import {
  fetchUrlContent,
  generateFlashcards,
  generateNotes,
  isValidUrl,
  summarizeText,
} from './services/contentProcessor.js';
import StudyTopic from './models/StudyTopic.js';

// Retrieve all saved study topics
export const getTopics = async (req, res) => {
  try {
    const topics = await StudyTopic.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: topics,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new study topic (scrapes and generates summary, notes, flashcards in parallel)
export const createTopic = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ success: false, message: 'A valid http(s) URL is required' });
    }

    // Step 1: Scrape the page content
    const page = await fetchUrlContent(url);

    // Step 2: Concurrently generate summary, flashcards, and notes
    const [summary, flashcards, notes] = await Promise.all([
      summarizeText(page.text, page.title),
      generateFlashcards(page.text, page.title),
      generateNotes(page.text, page.title),
    ]);

    // Step 3: Save to MongoDB
    const topic = new StudyTopic({
      title: page.title || 'Untitled Topic',
      url: page.url || url,
      summary,
      notes,
      content: page.text || '',
      flashcards: (flashcards || []).map((card) => ({
        front: card.front,
        back: card.back,
        status: 'needs_practice',
      })),
    });

    await topic.save();

    res.status(201).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Summarize a URL without saving it as a study topic
export const summarizeUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || !isValidUrl(url)) {
      return res.status(400).json({ success: false, message: 'A valid http(s) URL is required' });
    }

    const page = await fetchUrlContent(url);
    const summary = await summarizeText(page.text, page.title);

    res.status(200).json({
      success: true,
      data: {
        url: page.url || url,
        title: page.title || 'Untitled Page',
        summary,
        content: page.text || '',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update individual progress attributes (e.g. read state or flashcard mastery)
export const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { summaryCompleted, notesCompleted, flashcardId, flashcardStatus } = req.body;

    const topic = await StudyTopic.findById(id);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Study topic not found' });
    }

    if (summaryCompleted !== undefined) {
      topic.summaryCompleted = summaryCompleted;
    }
    if (notesCompleted !== undefined) {
      topic.notesCompleted = notesCompleted;
    }

    if (flashcardId && flashcardStatus) {
      const card = topic.flashcards.id(flashcardId);
      if (card) {
        card.status = flashcardStatus;
      }
    }

    await topic.save();

    res.status(200).json({
      success: true,
      data: topic,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a study topic
export const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await StudyTopic.findByIdAndDelete(id);

    if (!topic) {
      return res.status(404).json({ success: false, message: 'Study topic not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Study topic deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper: Call OpenAI Chat completions for conversational tutoring
async function callOpenAIChat(systemPrompt, messages) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY_MISSING');
  }

  const isGroq = apiKey.startsWith('gsk_');
  const url = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
  const defaultModel = isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
  const model = process.env.OPENAI_MODEL || defaultModel;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error: ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

// Controller: Handle chat messages with the AI tutor for a specific study topic
export const chatWithTutor = async (req, res) => {
  try {
    const { id } = req.params;
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'Conversation history is required' });
    }

    const topic = await StudyTopic.findById(id);
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Study topic not found' });
    }

    const contextText = topic.content ? topic.content.slice(0, 15000) : 'No source text available.';

    const systemPrompt = `You are a helpful, expert AI tutor. A student is studying the article titled "${topic.title}".
Use the following source text as your primary reference to answer the student's questions. 
If the student asks a question whose answer is not in the source text, use your general knowledge, but state that the information was not in the original text.
Keep your explanations clear, structured, and easy to understand for a student.

Source Text Reference:
"""
${contextText}
"""`;

    try {
      const reply = await callOpenAIChat(systemPrompt, messages);
      res.status(200).json({
        success: true,
        reply,
      });
    } catch (err) {
      if (err.message === 'OPENAI_API_KEY_MISSING') {
        return res.status(400).json({
          success: false,
          code: 'OPENAI_API_KEY_MISSING',
          message: 'OpenAI API key is missing. Add OPENAI_API_KEY to your .env file to enable the study tutor.',
        });
      }
      throw err;
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

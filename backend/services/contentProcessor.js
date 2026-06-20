import { scrapeUrlWithAnakin } from './anakinScraper.js';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
  'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must',
  'that', 'this', 'these', 'those', 'it', 'its', 'as', 'if', 'then', 'than', 'when',
  'where', 'who', 'whom', 'which', 'what', 'how', 'why', 'not', 'no', 'nor', 'so',
  'such', 'can', 'just', 'also', 'very', 'more', 'most', 'some', 'any', 'each',
]);

export function isValidUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function fetchUrlContent(url) {
  const page = await scrapeUrlWithAnakin(url);
  return {
    title: page.title,
    text: page.text,
    url: page.url,
    markdown: page.markdown,
  };
}

function splitSentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 30);
}

function splitParagraphs(text) {
  return text
    .split(/\n{2,}|(?<=[.!?])\s+(?=[A-Z])/)
    .map((paragraph) => paragraph.trim())
    .filter((paragraph) => paragraph.length > 40);
}

function scoreSentences(sentences) {
  const words = sentences
    .join(' ')
    .toLowerCase()
    .match(/\b[a-z]{4,}\b/g) || [];

  const frequency = new Map();
  for (const word of words) {
    if (STOP_WORDS.has(word)) continue;
    frequency.set(word, (frequency.get(word) || 0) + 1);
  }

  return sentences.map((sentence) => {
    const tokens = sentence.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const score = tokens.reduce((total, token) => {
      if (STOP_WORDS.has(token)) return total;
      return total + (frequency.get(token) || 0);
    }, 0);

    return { sentence, score };
  });
}

async function callOpenAI(systemPrompt, userPrompt) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

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
      temperature: 0.4,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt.slice(0, 12000) },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI request failed: ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

export async function summarizeText(text, title = 'Summary') {
  const aiSummary = await callOpenAI(
    'You summarize web pages into clear, concise study notes. Use 3-5 short paragraphs.',
    `Summarize this page titled "${title}":\n\n${text}`
  );

  if (aiSummary) {
    return aiSummary;
  }

  const sentences = splitSentences(text);
  if (sentences.length === 0) {
    return text.slice(0, 600);
  }

  const ranked = scoreSentences(sentences)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((item) => item.sentence);

  return ranked.join(' ');
}

export async function generateFlashcards(text, title = 'Study Topic') {
  const aiCards = await callOpenAI(
    'Return JSON only: an array of 6 flashcards with "front" and "back" string fields. Front = question, back = concise answer.',
    `Create flashcards from this content about "${title}":\n\n${text}`
  );

  if (aiCards) {
    try {
      const parsed = JSON.parse(aiCards.replace(/```json|```/g, '').trim());
      if (Array.isArray(parsed)) {
        return parsed
          .filter((card) => card.front && card.back)
          .slice(0, 12)
          .map((card) => ({ front: card.front.trim(), back: card.back.trim() }));
      }
    } catch {
      // fall through to local generation
    }
  }

  const paragraphs = splitParagraphs(text).slice(0, 8);
  if (paragraphs.length === 0) {
    return splitSentences(text).slice(0, 6).map((sentence, index) => ({
      front: `What is key point ${index + 1} about ${title}?`,
      back: sentence,
    }));
  }

  return paragraphs.map((paragraph, index) => {
    const preview = paragraph.split(' ').slice(0, 8).join(' ');
    return {
      front: `Explain: ${preview}...`,
      back: paragraph,
    };
  });
}

export async function generateNotes(text, title = 'Study Notes') {
  const aiNotes = await callOpenAI(
    'Create structured study notes with a title, 3-5 section headings, and bullet points under each section. Use markdown.',
    `Create notes from this page titled "${title}":\n\n${text}`
  );

  if (aiNotes) {
    return aiNotes;
  }

  const paragraphs = splitParagraphs(text).slice(0, 6);
  const lines = [`# ${title}`, ''];

  paragraphs.forEach((paragraph, index) => {
    lines.push(`## Section ${index + 1}`);
    lines.push('');
    paragraph
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean)
      .forEach((sentence) => {
        lines.push(`- ${sentence}`);
      });
    lines.push('');
  });

  return lines.join('\n').trim();
}

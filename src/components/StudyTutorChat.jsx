import { useState, useEffect, useRef } from 'react';

function StudyTutorChat({ topic }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const messagesEndRef = useRef(null);

  // Initialize messages thread when active topic changes
  useEffect(() => {
    if (!topic) return;
    setMessages([
      {
        sender: 'ai',
        text: `Hi! I'm your AI tutor for "${topic.title}". Feel free to ask me any questions or doubts you have about this topic!`,
        timestamp: new Date(),
      },
    ]);
    setApiKeyMissing(false);
  }, [topic]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!topic) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputVal.trim() || loading) return;

    const userMessage = {
      sender: 'user',
      text: inputVal.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputVal('');
    setLoading(true);

    // Format chat history for OpenAI API payload
    const chatHistory = [...messages, userMessage].map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    try {
      const response = await fetch(`/api/topics/${topic._id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === 'OPENAI_API_KEY_MISSING') {
          setApiKeyMissing(true);
          setMessages((prev) => [
            ...prev,
            {
              sender: 'ai',
              text: 'Could not connect: OpenAI API Key is not configured.',
              isError: true,
              timestamp: new Date(),
            },
          ]);
        } else {
          throw new Error(result.message || 'Tutor was unable to respond.');
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: result.reply,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'Oops! I encountered an error. Please make sure the server is running and try again.',
          isError: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="study-tutor-container">
      {/* Floating Chat Bubble Button */}
      <button
        type="button"
        className={`chat-bubble-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Ask Tutor a Question"
      >
        <span className="bubble-icon">💬</span>
        <span className="bubble-badge">Tutor</span>
      </button>

      {/* Slide-up Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Chat Window Header */}
          <header className="chat-header">
            <div className="tutor-info">
              <span className="tutor-avatar">🤖</span>
              <div>
                <h4>AI Study Tutor</h4>
                <span className="tutor-status">Online</span>
              </div>
            </div>
            <button
              type="button"
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </header>

          {/* Messages Thread */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-row ${msg.sender}`}>
                <div className="avatar">{msg.sender === 'user' ? '👤' : '🤖'}</div>
                <div className={`message-bubble ${msg.isError ? 'error-bubble' : ''}`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="message-row ai loading-row">
                <div className="avatar">🤖</div>
                <div className="message-bubble loading-bubble">
                  <span className="dot" />
                  <span className="dot" />
                  <span className="dot" />
                </div>
              </div>
            )}

            {/* API Key Instructions */}
            {apiKeyMissing && (
              <div className="api-key-warning">
                <h5>⚠️ OpenAI API Key Missing</h5>
                <p>To chat with your AI Tutor, you must configure your OpenAI API Key.</p>
                <ol>
                  <li>Open the <code>.env</code> file in the project root.</li>
                  <li>Add the following line:</li>
                  <pre><code>OPENAI_API_KEY=your_openai_key_here</code></pre>
                  <li>Restart the backend server.</li>
                </ol>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Field */}
          <form onSubmit={handleSend} className="chat-input-area">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask a question about this guide..."
              disabled={loading || apiKeyMissing}
              required
            />
            <button type="submit" disabled={loading || !inputVal.trim() || apiKeyMissing}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default StudyTutorChat;

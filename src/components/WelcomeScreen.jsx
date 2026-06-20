import { useState } from 'react';

function WelcomeScreen({ onCreateTopic, loading, error }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    onCreateTopic(url);
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-content">
        <div className="welcome-badge">AI Student Assistant</div>
        <h1>Create a New Study Session</h1>
        <p className="welcome-subtitle">
          Paste any webpage or article URL. Our AI will automatically generate a summary, structured study notes, and interactive flashcards to supercharge your learning.
        </p>

        <form onSubmit={handleSubmit} className="welcome-form">
          <div className="input-group">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/learn-something-new"
              required
              disabled={loading}
            />
            <button type="submit" disabled={loading || !url.trim()}>
              {loading ? 'Analyzing Page...' : 'Generate Study Guide'}
            </button>
          </div>
          {error && <p className="form-error">{error}</p>}
        </form>

        <div className="welcome-features">
          <div className="feature-card">
            <div className="feature-icon">📝</div>
            <h3>Smart Summaries</h3>
            <p>Get straight to the point with concise, AI-extracted overviews.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Structured Notes</h3>
            <p>Beautiful markdown notes organized with section headings and bullet points.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Flash Cards</h3>
            <p>Test your knowledge with automatically generated active recall question cards.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;

import { useState } from 'react';

function UrlSummarizer({ sharedData, onUpdate }) {
  const [url, setUrl] = useState(sharedData.url);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!url.trim()) {
      setError('Please enter a website URL');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to summarize URL');
      }

      onUpdate({
        url,
        title: result.data.title,
        summary: result.data.summary,
        content: result.data.content,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="tool-section">
      <div className="tool-intro">
        <h2>URL Summarizer</h2>
        <p>Paste any public webpage link and get a concise summary you can reuse in flash cards and notes.</p>
      </div>

      <form className="tool-form" onSubmit={handleSubmit}>
        <label htmlFor="summary-url">Website URL</label>
        <div className="input-row">
          <input
            id="summary-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/article"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Summarizing...' : 'Summarize'}
          </button>
        </div>
        {error && <p className="form-error">{error}</p>}
      </form>

      {sharedData.summary && (
        <article className="result-card">
          <div className="result-meta">
            <span className="result-badge">Summary</span>
            {sharedData.title && <h3>{sharedData.title}</h3>}
            {sharedData.url && <a href={sharedData.url} target="_blank" rel="noreferrer">{sharedData.url}</a>}
          </div>
          <p className="result-text">{sharedData.summary}</p>
        </article>
      )}
    </section>
  );
}

export default UrlSummarizer;

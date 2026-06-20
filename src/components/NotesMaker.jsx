import { useState } from 'react';
import { apiUrl } from '../lib/api.js';

function NotesMaker({ sharedData, onUpdate }) {
  const [url, setUrl] = useState(sharedData.url);
  const [notes, setNotes] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [useSummary, setUseSummary] = useState(Boolean(sharedData.summary));

  const handleGenerate = async (event) => {
    event.preventDefault();

    const payload = useSummary && sharedData.content
      ? { content: sharedData.content, title: sharedData.title }
      : { url };

    if (!payload.content && !payload.url?.trim()) {
      setError('Enter a URL or summarize a page first');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await fetch(apiUrl('/api/notes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate notes');
      }

      setNotes(result.data.notes);
      setTitle(result.data.title);

      if (payload.url) {
        onUpdate({ url });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!notes) return;
    await navigator.clipboard.writeText(notes);
  };

  return (
    <section className="tool-section">
      <div className="tool-intro">
        <h2>Notes Maker</h2>
        <p>Generate structured study notes from a URL or from your latest summary.</p>
      </div>

      <form className="tool-form" onSubmit={handleGenerate}>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={useSummary}
            onChange={(event) => setUseSummary(event.target.checked)}
            disabled={!sharedData.content}
          />
          Use content from URL Summarizer
        </label>

        {!useSummary && (
          <>
            <label htmlFor="notes-url">Website URL</label>
            <input
              id="notes-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/article"
            />
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Notes'}
        </button>
        {error && <p className="form-error">{error}</p>}
      </form>

      {notes && (
        <article className="result-card notes-card">
          <div className="result-meta">
            <span className="result-badge">Notes</span>
            {title && <h3>{title}</h3>}
          </div>

          <textarea
            className="notes-editor"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={16}
          />

          <div className="notes-actions">
            <button type="button" onClick={handleCopy}>Copy Notes</button>
          </div>
        </article>
      )}
    </section>
  );
}

export default NotesMaker;

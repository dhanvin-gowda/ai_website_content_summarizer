import { useState } from 'react';
import { apiUrl } from '../lib/api.js';

function FlashcardsGenerator({ sharedData, onUpdate }) {
  const [url, setUrl] = useState(sharedData.url);
  const [flashcards, setFlashcards] = useState([]);
  const [title, setTitle] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
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
      setFlipped(false);
      setActiveIndex(0);

      const response = await fetch(apiUrl('/api/flashcards'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate flashcards');
      }

      setFlashcards(result.data.flashcards);
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

  const currentCard = flashcards[activeIndex];

  const goNext = () => {
    setFlipped(false);
    setActiveIndex((prev) => (prev + 1) % flashcards.length);
  };

  const goPrev = () => {
    setFlipped(false);
    setActiveIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <section className="tool-section">
      <div className="tool-intro">
        <h2>Flash Cards Generator</h2>
        <p>Turn page content into quick-review question and answer cards.</p>
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
            <label htmlFor="flashcards-url">Website URL</label>
            <input
              id="flashcards-url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/article"
            />
          </>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Generating...' : 'Generate Flash Cards'}
        </button>
        {error && <p className="form-error">{error}</p>}
      </form>

      {flashcards.length > 0 && currentCard && (
        <div className="flashcards-area">
          <div className="result-meta">
            <span className="result-badge">Flash Cards</span>
            {title && <h3>{title}</h3>}
            <p className="card-counter">
              Card {activeIndex + 1} of {flashcards.length}
            </p>
          </div>

          <button
            type="button"
            className={`flashcard ${flipped ? 'flipped' : ''}`}
            onClick={() => setFlipped((prev) => !prev)}
          >
            <div className="flashcard-inner">
              <div className="flashcard-face flashcard-front">
                <span>Question</span>
                <p>{currentCard.front}</p>
              </div>
              <div className="flashcard-face flashcard-back">
                <span>Answer</span>
                <p>{currentCard.back}</p>
              </div>
            </div>
          </button>

          <p className="flashcard-hint">Click the card to flip it.</p>

          <div className="flashcard-controls">
            <button type="button" onClick={goPrev}>Previous</button>
            <button type="button" onClick={() => setFlipped((prev) => !prev)}>
              Flip
            </button>
            <button type="button" onClick={goNext}>Next</button>
          </div>
        </div>
      )}
    </section>
  );
}

export default FlashcardsGenerator;

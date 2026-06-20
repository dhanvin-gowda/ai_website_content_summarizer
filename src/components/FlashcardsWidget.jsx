import { useState } from 'react';

function FlashcardsWidget({ topic, onUpdateCardStatus }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const cards = topic.flashcards || [];
  const currentCard = cards[activeIndex];

  const goNext = () => {
    setFlipped(false);
    setActiveIndex((prev) => (prev + 1) % cards.length);
  };

  const goPrev = () => {
    setFlipped(false);
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleStatusChange = (status) => {
    if (!currentCard) return;
    onUpdateCardStatus(currentCard._id, status);
    // Auto advance card after marking status
    setTimeout(() => {
      goNext();
    }, 400);
  };

  const masteredCount = cards.filter((c) => c.status === 'mastered').length;
  const progressPercent = cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0;

  return (
    <div className="widget-card flashcards-widget">
      <div className="widget-header">
        <div className="widget-title-area">
          <span className="widget-icon">⚡</span>
          <h2>Flash Cards</h2>
        </div>
        <div className="flashcards-progress-badge">
          {masteredCount}/{cards.length} Mastered ({progressPercent}%)
        </div>
      </div>

      <div className="widget-body">
        {cards.length === 0 ? (
          <p className="no-cards">No flashcards generated for this topic.</p>
        ) : (
          <>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
            </div>

            <p className="card-counter">
              Card {activeIndex + 1} of {cards.length}
            </p>

            <button
              type="button"
              className={`flashcard ${flipped ? 'flipped' : ''}`}
              onClick={() => setFlipped((prev) => !prev)}
            >
              <div className="flashcard-inner">
                <div className="flashcard-face flashcard-front">
                  <div className="card-header">
                    <span>Question</span>
                    {currentCard.status === 'mastered' && <span className="mastered-tag">✓ Mastered</span>}
                  </div>
                  <p>{currentCard.front}</p>
                </div>
                <div className="flashcard-face flashcard-back">
                  <div className="card-header">
                    <span>Answer</span>
                    {currentCard.status === 'mastered' && <span className="mastered-tag">✓ Mastered</span>}
                  </div>
                  <p>{currentCard.back}</p>
                </div>
              </div>
            </button>

            <p className="flashcard-hint">Click the card to flip it.</p>

            <div className="flashcard-controls">
              <button type="button" className="nav-btn" onClick={goPrev}>
                ◀ Prev
              </button>

              <div className="mastery-actions">
                <button
                  type="button"
                  className={`mastery-btn practice-btn ${currentCard?.status === 'needs_practice' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('needs_practice')}
                >
                  ❌ Practice
                </button>
                <button
                  type="button"
                  className={`mastery-btn master-btn ${currentCard?.status === 'mastered' ? 'active' : ''}`}
                  onClick={() => handleStatusChange('mastered')}
                >
                  ✅ Master
                </button>
              </div>

              <button type="button" className="nav-btn" onClick={goNext}>
                Next ▶
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default FlashcardsWidget;

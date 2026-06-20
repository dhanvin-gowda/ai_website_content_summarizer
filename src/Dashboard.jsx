import { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import SummaryWidget from './components/SummaryWidget.jsx';
import NotesWidget from './components/NotesWidget.jsx';
import FlashcardsWidget from './components/FlashcardsWidget.jsx';
import StudyTutorChat from './components/StudyTutorChat.jsx';
import './Dashboard.css';

function Dashboard() {
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all saved topics on component mount
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await fetch('/api/topics');
        const result = await response.json();
        if (response.ok) {
          setTopics(result.data || []);
        }
      } catch (err) {
        console.error('Error fetching topics:', err);
      }
    };
    fetchTopics();
  }, []);

  const handleCreateTopic = async (url) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to generate study guide');
      }

      setTopics((prev) => [result.data, ...prev]);
      setSelectedTopicId(result.data._id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSummary = async (topicId, completed) => {
    // Optimistic update
    setTopics((prev) =>
      prev.map((t) => (t._id === topicId ? { ...t, summaryCompleted: completed } : t))
    );

    try {
      await fetch(`/api/topics/${topicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryCompleted: completed }),
      });
    } catch (err) {
      console.error('Error saving summary status:', err);
    }
  };

  const handleToggleNotes = async (topicId, completed) => {
    // Optimistic update
    setTopics((prev) =>
      prev.map((t) => (t._id === topicId ? { ...t, notesCompleted: completed } : t))
    );

    try {
      await fetch(`/api/topics/${topicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notesCompleted: completed }),
      });
    } catch (err) {
      console.error('Error saving notes status:', err);
    }
  };

  const handleUpdateCardStatus = async (topicId, cardId, status) => {
    // Optimistic update
    setTopics((prev) =>
      prev.map((t) => {
        if (t._id !== topicId) return t;
        const updatedCards = t.flashcards.map((c) =>
          c._id === cardId ? { ...c, status } : c
        );
        return { ...t, flashcards: updatedCards };
      })
    );

    try {
      await fetch(`/api/topics/${topicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcardId: cardId, flashcardStatus: status }),
      });
    } catch (err) {
      console.error('Error updating flashcard status:', err);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this study session?')) return;

    // Optimistic update
    setTopics((prev) => prev.filter((t) => t._id !== topicId));
    if (selectedTopicId === topicId) {
      setSelectedTopicId(null);
    }

    try {
      await fetch(`/api/topics/${topicId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Error deleting topic:', err);
    }
  };

  // Helper: calculate progress percentage for a topic
  const calculateTopicProgress = (topic) => {
    if (!topic) return 0;
    let progress = 0;
    if (topic.summaryCompleted) progress += 33.3;
    if (topic.notesCompleted) progress += 33.3;

    const cards = topic.flashcards || [];
    const mastered = cards.filter((c) => c.status === 'mastered').length;
    if (cards.length > 0) {
      progress += (mastered / cards.length) * 33.4;
    } else {
      progress += 33.4;
    }
    return Math.round(progress);
  };

  // Global Stat Calculations
  const activeTopic = topics.find((t) => t._id === selectedTopicId) || null;
  const activeTopicProgress = calculateTopicProgress(activeTopic);

  const totalTopics = topics.length;
  const avgProgress =
    totalTopics > 0
      ? Math.round(topics.reduce((acc, t) => acc + calculateTopicProgress(t), 0) / totalTopics)
      : 0;

  const totalCards = topics.reduce((acc, t) => acc + (t.flashcards ? t.flashcards.length : 0), 0);
  const totalMastered = topics.reduce(
    (acc, t) => acc + (t.flashcards ? t.flashcards.filter((c) => c.status === 'mastered').length : 0),
    0
  );
  const overallMasteryPercent = totalCards > 0 ? Math.round((totalMastered / totalCards) * 100) : 0;

  return (
    <div className="dashboard-container">
      {/* Sidebar: Holds App Title, Global Stats, and Library History */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-area">
            <span className="logo-icon">🧠</span>
            <div className="logo-text">
              <h1>StudySpace</h1>
              <span>AI Learning Partner</span>
            </div>
          </div>
          <button
            type="button"
            className="new-session-btn"
            onClick={() => setSelectedTopicId(null)}
          >
            ＋ New Session
          </button>
        </div>

        {/* Global Progress Stats Widget */}
        <div className="sidebar-stats">
          <h3>My Progress</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{totalTopics}</div>
              <div className="stat-label">Guides</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{avgProgress}%</div>
              <div className="stat-label">Avg. Progress</div>
            </div>
            <div className="stat-card full-width">
              <div className="stat-value-row">
                <span className="stat-value">{overallMasteryPercent}%</span>
                <span className="stat-sub">{totalMastered}/{totalCards} cards</span>
              </div>
              <div className="stat-label">Flashcard Mastery</div>
              <div className="mini-progress-track">
                <div className="mini-progress-fill" style={{ width: `${overallMasteryPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* My Library: Historical Topics */}
        <div className="library-section">
          <h3>Library ({totalTopics})</h3>
          {topics.length === 0 ? (
            <p className="empty-library">No sessions yet. Paste a URL to start studying!</p>
          ) : (
            <ul className="library-list">
              {topics.map((t) => {
                const topicProgress = calculateTopicProgress(t);
                const isActive = t._id === selectedTopicId;
                return (
                  <li key={t._id} className={`library-item ${isActive ? 'active' : ''}`}>
                    <button
                      type="button"
                      className="library-item-content"
                      onClick={() => setSelectedTopicId(t._id)}
                    >
                      <span className="library-item-title">{t.title}</span>
                      <div className="library-item-meta">
                        <span className={`progress-dot ${topicProgress === 100 ? 'done' : 'doing'}`} />
                        <span>{topicProgress}% complete</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className="delete-item-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTopic(t._id);
                      }}
                      title="Delete study session"
                    >
                      🗑
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Main Study Workspace Area */}
      <main className="main-content">
        {!activeTopic ? (
          <WelcomeScreen
            onCreateTopic={handleCreateTopic}
            loading={loading}
            error={error}
          />
        ) : (
          <div className="study-workspace">
            {/* Workspace Header */}
            <header className="workspace-header">
              <div className="header-details">
                <div className="eyebrow">Active study session</div>
                <h1>{activeTopic.title}</h1>
                <a
                  href={activeTopic.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-link"
                >
                  🔗 {activeTopic.url}
                </a>
              </div>

              {/* Session Progress Tracker */}
              <div className="header-progress-area">
                <div className="progress-label-row">
                  <span>Session Completion</span>
                  <strong>{activeTopicProgress}%</strong>
                </div>
                <div className="progress-track-large">
                  <div
                    className="progress-fill-large"
                    style={{ width: `${activeTopicProgress}%` }}
                  />
                </div>
              </div>
            </header>

            {/* Dashboard Grid containing Summary, Notes, and Flashcards */}
            <div className="study-grid">
              <div className="grid-left-col">
                <SummaryWidget
                  topic={activeTopic}
                  onToggleComplete={(val) => handleToggleSummary(activeTopic._id, val)}
                />
                <FlashcardsWidget
                  topic={activeTopic}
                  onUpdateCardStatus={(cardId, status) =>
                    handleUpdateCardStatus(activeTopic._id, cardId, status)
                  }
                />
              </div>

              <div className="grid-right-col">
                <NotesWidget
                  topic={activeTopic}
                  onToggleComplete={(val) => handleToggleNotes(activeTopic._id, val)}
                />
              </div>
            </div>

            {/* Floating Chatbot Tutor */}
            <StudyTutorChat topic={activeTopic} />
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;

import { useState } from 'react';

function NotesWidget({ topic, onToggleComplete }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(topic.notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const rendered = [];
    let currentList = [];

    const flushList = (key) => {
      if (currentList.length > 0) {
        rendered.push(<ul key={`list-${key}`}>{currentList}</ul>);
        currentList = [];
      }
    };

    lines.forEach((line, index) => {
      if (line.startsWith('# ')) {
        flushList(index);
        rendered.push(<h1 key={index}>{line.slice(2)}</h1>);
      } else if (line.startsWith('## ')) {
        flushList(index);
        rendered.push(<h2 key={index}>{line.slice(3)}</h2>);
      } else if (line.startsWith('### ')) {
        flushList(index);
        rendered.push(<h3 key={index}>{line.slice(4)}</h3>);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        const itemText = line.slice(2);
        const parts = itemText.split('**');
        currentList.push(
          <li key={index}>
            {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
          </li>
        );
      } else if (line.trim() === '') {
        flushList(index);
        rendered.push(<div key={index} className="notes-para-space" />);
      } else {
        flushList(index);
        const parts = line.split('**');
        rendered.push(
          <p key={index}>
            {parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))}
          </p>
        );
      }
    });

    flushList(lines.length);
    return rendered;
  };

  return (
    <div className={`widget-card notes-widget ${topic.notesCompleted ? 'completed' : ''}`}>
      <div className="widget-header">
        <div className="widget-title-area">
          <span className="widget-icon">📚</span>
          <h2>Study Notes</h2>
        </div>
        <div className="widget-actions">
          <button type="button" className="action-btn copy-btn" onClick={handleCopy}>
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
          <label className="completion-toggle">
            <input
              type="checkbox"
              checked={topic.notesCompleted}
              onChange={(e) => onToggleComplete(e.target.checked)}
            />
            <span>{topic.notesCompleted ? 'Reviewed' : 'Mark Reviewed'}</span>
          </label>
        </div>
      </div>

      <div className="widget-body markdown-content">
        {renderMarkdown(topic.notes)}
      </div>
    </div>
  );
}

export default NotesWidget;

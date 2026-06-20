function SummaryWidget({ topic, onToggleComplete }) {
  return (
    <div className={`widget-card summary-widget ${topic.summaryCompleted ? 'completed' : ''}`}>
      <div className="widget-header">
        <div className="widget-title-area">
          <span className="widget-icon">📝</span>
          <h2>URL Summary</h2>
        </div>
        <label className="completion-toggle">
          <input
            type="checkbox"
            checked={topic.summaryCompleted}
            onChange={(e) => onToggleComplete(e.target.checked)}
          />
          <span>{topic.summaryCompleted ? 'Read' : 'Mark as Read'}</span>
        </label>
      </div>

      <div className="widget-body">
        <p className="summary-text">{topic.summary}</p>
      </div>
    </div>
  );
}

export default SummaryWidget;

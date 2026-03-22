import { getLevelProgress } from '../utils/storage';
import './MainMenu.css';

const HARD_TAGS = {
  hard:   { label: 'Hard',   color: '#e17055' },
  expert: { label: 'Expert', color: '#d63031' },
  master: { label: 'Master', color: '#6c5ce7' },
};

export default function MainMenu({ levels, onSelectLevel, onHowToPlay }) {
  return (
    <div className="main-menu">
      <div className="logo">
        <h1>Patches</h1>
        <p className="subtitle">Rectangle Logic Puzzle</p>
      </div>

      <button className="btn how-to-play-btn" onClick={onHowToPlay}>
        How to Play
      </button>

      <div className="all-levels-grid">
        {levels.map((level) => {
          const progress = getLevelProgress(level.id);
          const completed = !!progress;
          const tag = HARD_TAGS[level.difficulty];
          return (
            <button
              key={level.id}
              className={`level-card${completed ? ' completed' : ''}${tag ? ' has-tag' : ''}`}
              onClick={() => onSelectLevel(level)}
            >
              {tag && (
                <span className="diff-tag" style={{ background: tag.color }}>
                  {tag.label}
                </span>
              )}
              <span className="level-num">{level.levelNumber}</span>
              {completed && (
                <div className="level-stars">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className={`mini-star${i < progress.stars ? ' filled' : ''}`}>
                      ★
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

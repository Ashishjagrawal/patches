import { getLevelProgress } from '../utils/storage';
import './MainMenu.css';

const HARD_TAGS = {
  hard:   { label: 'Hard',   color: '#D4613E' },
  expert: { label: 'Expert', color: '#9B59B6' },
  master: { label: 'Master', color: '#3D322A' },
};

export default function MainMenu({ levels, onSelectLevel, onHowToPlay }) {
  return (
    <div className="main-menu">
      <div className="logo">
        <h1>P<em>a</em>tches</h1>
        <p className="subtitle">Rectangle Logic Puzzle</p>
      </div>

      <button className="how-to-play-btn" onClick={onHowToPlay}>
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

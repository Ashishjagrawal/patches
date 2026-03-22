import { useState, useEffect, useRef, useCallback } from 'react';
import Board from './Board';
import { checkSolution, getStars } from '../utils/puzzleEngine';
import { saveLevelProgress } from '../utils/storage';
import './GameScreen.css';

export default function GameScreen({ level, onBack, onNext }) {
  const [patches, setPatches] = useState([]);
  const [history, setHistory] = useState([]);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(true);
  const [solved, setSolved] = useState(false);
  const [usedHint, setUsedHint] = useState(false);
  const [stars, setStarsCount] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    setPatches([]);
    setHistory([]);
    setTimer(0);
    setRunning(true);
    setSolved(false);
    setUsedHint(false);
  }, [level.id]);

  useEffect(() => {
    if (running && !solved) {
      intervalRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, solved]);

  const handlePlace = useCallback(
    (patch) => {
      if (solved) return;
      setHistory((h) => [...h, patches]);
      const newPatches = [...patches, patch];
      setPatches(newPatches);

      // Check solution
      if (checkSolution(newPatches, level.clues, level.rows, level.cols)) {
        setSolved(true);
        setRunning(false);
        const s = getStars(level.difficulty, timer, usedHint);
        setStarsCount(s);
        saveLevelProgress(level.id, s, timer);
      }
    },
    [patches, solved, level, timer, usedHint]
  );

  const handleRemove = useCallback(
    (index) => {
      if (solved) return;
      setHistory((h) => [...h, patches]);
      setPatches((p) => p.filter((_, i) => i !== index));
    },
    [patches, solved]
  );

  const handleUndo = () => {
    if (history.length === 0) return;
    setPatches(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  };

  const handleReset = () => {
    setHistory((h) => [...h, patches]);
    setPatches([]);
    setTimer(0);
  };

  const handleHint = () => {
    if (!level.solution || solved) return;
    setUsedHint(true);
    // Find a solution rect that isn't already placed
    for (const sol of level.solution) {
      const alreadyPlaced = patches.some(
        (p) => p.row === sol.row && p.col === sol.col && p.w === sol.w && p.h === sol.h
      );
      if (!alreadyPlaced) {
        // Find the clue index for this solution rect
        const ci = level.clues.findIndex(
          (c) =>
            c.clueRow >= sol.row &&
            c.clueRow < sol.row + sol.h &&
            c.clueCol >= sol.col &&
            c.clueCol < sol.col + sol.w
        );
        if (ci >= 0) {
          handlePlace({ ...sol, clueIndex: ci });
        }
        break;
      }
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const renderStars = (count) =>
    Array.from({ length: 3 }, (_, i) => (
      <span key={i} className={`star ${i < count ? 'filled' : ''}`}>
        ★
      </span>
    ));

  return (
    <div className="game-screen">
      <div className="game-header">
        <button className="btn-icon" onClick={onBack} title="Back">
          ←
        </button>
        <div className="level-info">
          <span className="level-title">
            Level {level.levelNumber}
          </span>
          <span className={`timer${running && !solved ? ' on' : ''}`}>{formatTime(timer)}</span>
        </div>
        <div className="header-spacer" />
      </div>

      <Board level={level} patches={patches} onPlacePatch={handlePlace} onRemovePatch={handleRemove} />

      <div className="game-controls">
        <button className="btn" onClick={handleUndo} disabled={history.length === 0 || solved}>
          Undo
        </button>
        <button className="btn" onClick={handleHint} disabled={solved}>
          Hint
        </button>
        <button className="btn" onClick={handleReset} disabled={solved}>
          Reset
        </button>
      </div>

      {solved && (
        <div className="solved-overlay">
          <div className="solved-modal">
            <h2>Puzzle Complete!</h2>
            <div className="solved-stars">{renderStars(stars)}</div>
            <p className="solved-time">Time: {formatTime(timer)}</p>
            {usedHint && <p className="hint-penalty">Hint used (max 2 stars)</p>}
            <div className="solved-actions">
              <button className="btn btn-primary" onClick={onNext}>
                Next Level
              </button>
              <button className="btn" onClick={onBack}>
                Level Select
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

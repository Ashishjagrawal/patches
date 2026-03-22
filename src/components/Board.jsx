import { useState, useRef, useCallback, useEffect } from 'react';
import { SHAPE, findClueInRect, validatePlacement, checkOverlap } from '../utils/puzzleEngine';
import { getPatchColor, getPatchBorder } from '../utils/colors';
import './Board.css';

const SHAPE_SVGS = {
  [SHAPE.SQUARE]: (
    <svg viewBox="0 0 20 20" className="clue-icon">
      <rect x="3" y="3" width="14" height="14" rx="2" fill="currentColor" />
    </svg>
  ),
  [SHAPE.WIDE]: (
    <svg viewBox="0 0 20 20" className="clue-icon">
      <rect x="1" y="5" width="18" height="10" rx="2" fill="currentColor" />
    </svg>
  ),
  [SHAPE.TALL]: (
    <svg viewBox="0 0 20 20" className="clue-icon">
      <rect x="5" y="1" width="10" height="18" rx="2" fill="currentColor" />
    </svg>
  ),
};

export default function Board({ level, patches, onPlacePatch, onRemovePatch }) {
  const { rows, cols, clues } = level;
  const boardRef = useRef(null);
  const [dragStart, setDragStart] = useState(null);
  const [dragEnd, setDragEnd] = useState(null);
  const [dragging, setDragging] = useState(false);

  const getCellFromEvent = useCallback(
    (e) => {
      const board = boardRef.current;
      if (!board) return null;
      const rect = board.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const cellW = rect.width / cols;
      const cellH = rect.height / rows;
      const col = Math.floor(x / cellW);
      const row = Math.floor(y / cellH);
      if (row < 0 || row >= rows || col < 0 || col >= cols) return null;
      return { row, col };
    },
    [rows, cols]
  );

  const handleStart = useCallback(
    (e) => {
      e.preventDefault();
      const cell = getCellFromEvent(e);
      if (!cell) return;

      const patchIdx = patches.findIndex(
        (p) =>
          cell.row >= p.row &&
          cell.row < p.row + p.h &&
          cell.col >= p.col &&
          cell.col < p.col + p.w
      );
      if (patchIdx >= 0) {
        onRemovePatch(patchIdx);
        return;
      }

      setDragStart(cell);
      setDragEnd(cell);
      setDragging(true);
    },
    [getCellFromEvent, patches, onRemovePatch]
  );

  const handleMove = useCallback(
    (e) => {
      if (!dragging) return;
      e.preventDefault();
      const cell = getCellFromEvent(e);
      if (cell) setDragEnd(cell);
    },
    [dragging, getCellFromEvent]
  );

  const handleEnd = useCallback(() => {
    if (!dragging || !dragStart || !dragEnd) {
      setDragging(false);
      return;
    }

    const minRow = Math.min(dragStart.row, dragEnd.row);
    const maxRow = Math.max(dragStart.row, dragEnd.row);
    const minCol = Math.min(dragStart.col, dragEnd.col);
    const maxCol = Math.max(dragStart.col, dragEnd.col);

    const rect = {
      row: minRow,
      col: minCol,
      w: maxCol - minCol + 1,
      h: maxRow - minRow + 1,
    };

    const clueIndices = findClueInRect(rect, clues);
    if (clueIndices.length === 1) {
      const ci = clueIndices[0];
      const clue = clues[ci];
      if (validatePlacement(rect, clue) && !checkOverlap(rect, patches)) {
        onPlacePatch({ ...rect, clueIndex: ci });
      }
    }

    setDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, [dragging, dragStart, dragEnd, clues, patches, onPlacePatch]);

  useEffect(() => {
    const handleGlobalEnd = () => {
      if (dragging) handleEnd();
    };
    window.addEventListener('mouseup', handleGlobalEnd);
    window.addEventListener('touchend', handleGlobalEnd);
    return () => {
      window.removeEventListener('mouseup', handleGlobalEnd);
      window.removeEventListener('touchend', handleGlobalEnd);
    };
  }, [dragging, handleEnd]);

  // Drag preview rect
  let dragRect = null;
  let dragValid = false;
  if (dragging && dragStart && dragEnd) {
    const minRow = Math.min(dragStart.row, dragEnd.row);
    const maxRow = Math.max(dragStart.row, dragEnd.row);
    const minCol = Math.min(dragStart.col, dragEnd.col);
    const maxCol = Math.max(dragStart.col, dragEnd.col);
    dragRect = { row: minRow, col: minCol, w: maxCol - minCol + 1, h: maxRow - minRow + 1 };
    const clueIndices = findClueInRect(dragRect, clues);
    if (clueIndices.length === 1) {
      const clue = clues[clueIndices[0]];
      dragValid = validatePlacement(dragRect, clue) && !checkOverlap(dragRect, patches);
    }
  }

  // Check which cells are covered by patches
  const coveredCells = new Set();
  patches.forEach((p) => {
    for (let r = p.row; r < p.row + p.h; r++) {
      for (let c = p.col; c < p.col + p.w; c++) {
        coveredCells.add(`${r}-${c}`);
      }
    }
  });

  const pctW = 100 / cols;
  const pctH = 100 / rows;

  return (
    <div className="board-wrapper">
      <div
        className="board"
        ref={boardRef}
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {/* Grid cells */}
        {Array.from({ length: rows * cols }, (_, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const key = `${row}-${col}`;
          const isCovered = coveredCells.has(key);
          const clue = clues.find((c) => c.clueRow === row && c.clueCol === col);

          let inDrag = false;
          if (dragRect) {
            inDrag =
              row >= dragRect.row &&
              row < dragRect.row + dragRect.h &&
              col >= dragRect.col &&
              col < dragRect.col + dragRect.w;
          }

          return (
            <div
              key={key}
              className={`cell${isCovered ? ' covered' : ''}${inDrag ? (dragValid ? ' drag-valid' : ' drag-invalid') : ''}`}
            >
              {clue && !isCovered && (
                <div className="clue">
                  {SHAPE_SVGS[clue.shape]}
                  <span className="clue-number">{clue.area}</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Patch overlays */}
        {patches.map((p, pi) => {
          const clue = clues.find(
            (c) =>
              c.clueRow >= p.row &&
              c.clueRow < p.row + p.h &&
              c.clueCol >= p.col &&
              c.clueCol < p.col + p.w
          );
          return (
            <div
              key={`patch-${pi}`}
              className="patch"
              style={{
                left: `${p.col * pctW}%`,
                top: `${p.row * pctH}%`,
                width: `${p.w * pctW}%`,
                height: `${p.h * pctH}%`,
                backgroundColor: getPatchColor(pi),
                borderColor: getPatchBorder(pi),
              }}
            >
              {clue && (
                <span className="patch-label">
                  {clue.area}
                </span>
              )}
            </div>
          );
        })}

        {/* Drag selection overlay */}
        {dragRect && (
          <div
            className={`selection-overlay${dragValid ? '' : ' invalid'}`}
            style={{
              left: `${dragRect.col * pctW}%`,
              top: `${dragRect.row * pctH}%`,
              width: `${dragRect.w * pctW}%`,
              height: `${dragRect.h * pctH}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}

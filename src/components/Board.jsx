import { useState, useRef, useCallback, useEffect } from 'react';
import { SHAPE, findClueInRect, validatePlacement, checkOverlap } from '../utils/puzzleEngine';
import { getPatchColor } from '../utils/colors';
import './Board.css';

const SHAPE_ICONS = {
  [SHAPE.SQUARE]: '■',
  [SHAPE.WIDE]: '▬',
  [SHAPE.TALL]: '▮',
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

      // Check if clicking on existing patch to remove it
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

    // Validate: exactly one clue inside, matches shape+area, no overlap
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

  // Build cell map for rendering
  const cellMap = {};
  patches.forEach((p, pi) => {
    for (let r = p.row; r < p.row + p.h; r++) {
      for (let c = p.col; c < p.col + p.w; c++) {
        cellMap[`${r}-${c}`] = pi;
      }
    }
  });

  // Current drag preview
  let dragRect = null;
  let dragValid = false;
  if (dragging && dragStart && dragEnd) {
    const minRow = Math.min(dragStart.row, dragEnd.row);
    const maxRow = Math.max(dragStart.row, dragEnd.row);
    const minCol = Math.min(dragStart.col, dragEnd.col);
    const maxCol = Math.max(dragStart.col, dragEnd.col);
    dragRect = {
      row: minRow,
      col: minCol,
      w: maxCol - minCol + 1,
      h: maxRow - minRow + 1,
    };
    const clueIndices = findClueInRect(dragRect, clues);
    if (clueIndices.length === 1) {
      const clue = clues[clueIndices[0]];
      dragValid = validatePlacement(dragRect, clue) && !checkOverlap(dragRect, patches);
    }
  }

  return (
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
      {Array.from({ length: rows * cols }, (_, i) => {
        const row = Math.floor(i / cols);
        const col = i % cols;
        const key = `${row}-${col}`;
        const patchIndex = cellMap[key];
        const hasPatch = patchIndex !== undefined;
        const patch = hasPatch ? patches[patchIndex] : null;

        // Is this cell the top-left of its patch?
        const isPatchOrigin = patch && patch.row === row && patch.col === col;

        // Clue in this cell?
        const clue = clues.find((c) => c.clueRow === row && c.clueCol === col);

        // Drag preview
        let inDrag = false;
        if (dragRect) {
          inDrag =
            row >= dragRect.row &&
            row < dragRect.row + dragRect.h &&
            col >= dragRect.col &&
            col < dragRect.col + dragRect.w;
        }

        // Border classes for patches
        let borderClasses = '';
        if (hasPatch) {
          if (row === patch.row) borderClasses += ' bt';
          if (row === patch.row + patch.h - 1) borderClasses += ' bb';
          if (col === patch.col) borderClasses += ' bl';
          if (col === patch.col + patch.w - 1) borderClasses += ' br';
        }

        return (
          <div
            key={key}
            className={`cell${hasPatch ? ' patched' : ''}${inDrag ? (dragValid ? ' drag-valid' : ' drag-invalid') : ''}${borderClasses}`}
            style={
              hasPatch
                ? {
                    backgroundColor: getPatchColor(patchIndex),
                  }
                : undefined
            }
          >
            {clue && (
              <div className={`clue${hasPatch ? ' clue-filled' : ''}`}>
                <span className="clue-shape">{SHAPE_ICONS[clue.shape]}</span>
                <span className="clue-number">{clue.area}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

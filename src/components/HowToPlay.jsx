import './HowToPlay.css';

export default function HowToPlay({ onBack }) {
  return (
    <div className="how-to-play">
      <div className="htp-header">
        <button className="btn-icon" onClick={onBack}>←</button>
        <h2>How to Play</h2>
        <div className="header-spacer" />
      </div>

      <div className="htp-content">
        <section>
          <h3>Goal</h3>
          <p>Fill the entire grid by drawing rectangles (patches). Each patch must contain exactly one clue and match its requirements.</p>
        </section>

        <section>
          <h3>Clues</h3>
          <p>Each clue shows a <strong>shape icon</strong> and a <strong>number</strong>:</p>
          <ul>
            <li><span className="icon">■</span> <strong>Square</strong> — width equals height (2×2, 3×3)</li>
            <li><span className="icon">▬</span> <strong>Wide</strong> — width greater than height (3×1, 4×2)</li>
            <li><span className="icon">▮</span> <strong>Tall</strong> — height greater than width (1×3, 2×4)</li>
          </ul>
          <p>The number is the total cells the patch must cover.</p>
        </section>

        <section>
          <h3>Rules</h3>
          <ol>
            <li>Every cell must be covered by exactly one patch</li>
            <li>Each patch must contain exactly one clue</li>
            <li>The patch must match the clue's shape type and cell count</li>
            <li>Patches cannot overlap</li>
          </ol>
        </section>

        <section>
          <h3>Controls</h3>
          <ul>
            <li><strong>Draw:</strong> Click/tap and drag across cells to create a rectangle</li>
            <li><strong>Remove:</strong> Click/tap on a placed patch to remove it</li>
            <li><strong>Undo:</strong> Revert your last action</li>
            <li><strong>Hint:</strong> Reveals one correct patch (limits max rating to 2 stars)</li>
          </ul>
        </section>

        <section>
          <h3>Stars</h3>
          <p>Earn 1-3 stars based on completion time. Using hints caps you at 2 stars.</p>
        </section>
      </div>
    </div>
  );
}

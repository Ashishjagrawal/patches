import { useState, useMemo } from 'react';
import MainMenu from './components/MainMenu';
import GameScreen from './components/GameScreen';
import HowToPlay from './components/HowToPlay';
import { generateAllLevels } from './utils/levelGenerator';
import './App.css';

export default function App() {
  const levels = useMemo(() => generateAllLevels(), []);
  const [screen, setScreen] = useState('menu');
  const [currentLevel, setCurrentLevel] = useState(null);

  const handleSelectLevel = (level) => {
    setCurrentLevel(level);
    setScreen('game');
  };

  const handleNext = () => {
    if (!currentLevel) return;
    const idx = levels.findIndex((l) => l.id === currentLevel.id);
    const nextIdx = idx + 1;
    if (nextIdx < levels.length) {
      setCurrentLevel(levels[nextIdx]);
    } else {
      setScreen('menu');
    }
  };

  return (
    <div className="app">
      {screen === 'menu' && (
        <MainMenu
          levels={levels}
          onSelectLevel={handleSelectLevel}
          onHowToPlay={() => setScreen('howto')}
        />
      )}
      {screen === 'game' && currentLevel && (
        <GameScreen
          level={currentLevel}
          onBack={() => setScreen('menu')}
          onNext={handleNext}
        />
      )}
      {screen === 'howto' && <HowToPlay onBack={() => setScreen('menu')} />}
    </div>
  );
}

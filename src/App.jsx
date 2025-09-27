import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header.jsx';
import TitleScreen from './components/TitleScreen.jsx';
import PlayScreen from './components/PlayScreen/PlayScreen.jsx';
import { runPathfindingUnitTests } from './lib/runUnitTests.js';

const PLAY_MODES = {
  BLANK: 'blank',
  MAZE: 'maze',
};

export default function App() {
  const [screen, setScreen] = useState('title');
  const [speedMode, setSpeedMode] = useState('Normal');
  const [playConfig, setPlayConfig] = useState({ seed: 0, mode: PLAY_MODES.BLANK });

  useEffect(() => {
    runPathfindingUnitTests();
  }, []);

  const handleStart = (mode) => {
    setPlayConfig((prev) => ({ seed: prev.seed + 1, mode }));
    setScreen('play');
  };

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 flex flex-col">
      <Header onOpenMenu={() => setScreen('title')} />
      <AnimatePresence initial={false} mode="wait">
        {screen === 'title' && (
          <motion.div
            key="title"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex-1"
          >
            <TitleScreen
              speedMode={speedMode}
              onSelectSpeed={setSpeedMode}
              onStartBlank={() => handleStart(PLAY_MODES.BLANK)}
              onStartWithMaze={() => handleStart(PLAY_MODES.MAZE)}
            />
          </motion.div>
        )}
        {screen === 'play' && (
          <PlayScreen key={playConfig.seed} speedMode={speedMode} mode={playConfig.mode} />
        )}
      </AnimatePresence>
    </div>
  );
}

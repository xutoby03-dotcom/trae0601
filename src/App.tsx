import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { TitleScreen } from './components/TitleScreen';
import { SceneDisplay } from './components/SceneDisplay';
import { BattleScreen } from './components/BattleScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { SaveLoadScreen } from './components/SaveLoadScreen';
import { GameOverScreen } from './components/GameOverScreen';
import { EndingScreen } from './components/EndingScreen';
import { PlayerHUD } from './components/PlayerHUD';
import { loadSaves } from './utils/gameUtils';

function App() {
  const { screen, message, setMessage, setScreen, currentNodeId } = useGameStore();

  useEffect(() => {
    useGameStore.setState({ saves: loadSaves() });
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [message, setMessage]);

  const renderScreen = () => {
    switch (screen) {
      case 'title':
        return <TitleScreen />;
      case 'game':
        return (
          <div className="game-screen">
            <PlayerHUD />
            <SceneDisplay />
          </div>
        );
      case 'battle':
        return (
          <div className="game-screen">
            <PlayerHUD />
            <BattleScreen />
          </div>
        );
      case 'inventory':
        return (
          <div className="game-screen">
            <PlayerHUD />
            <InventoryScreen />
          </div>
        );
      case 'save':
        return (
          <div className="game-screen">
            <PlayerHUD />
            <SaveLoadScreen mode="save" />
          </div>
        );
      case 'load':
        return <SaveLoadScreen mode="load" />;
      case 'gameover':
        return <GameOverScreen />;
      case 'ending':
        return <EndingScreen />;
      default:
        return <TitleScreen />;
    }
  };

  return (
    <div className="app-container">
      {renderScreen()}
      
      {message && (
        <div className="message-popup">
          {message}
        </div>
      )}
    </div>
  );
}

export default App;

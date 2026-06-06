import { Routes, Route } from 'react-router-dom';
import { MainMenu, GameScreen, GameOver } from './components';

function App() {
  return (
    <div className="w-full h-screen">
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/gameover" element={<GameOver />} />
      </Routes>
    </div>
  );
}

export default App;

import GameRoom from './components/GameRoom';
import HomePage from './components/HomePage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    // Homepage and game rooms
    // :room captures any value after game/ as a parameter
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/game/:room" element={<GameRoom/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

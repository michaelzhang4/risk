import './App.css';
import GameRoom from './components/GameRoom';
import HomePage from './components/HomePage';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/game/:room" element={<GameRoom/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

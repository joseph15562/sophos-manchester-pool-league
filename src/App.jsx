import { Routes, Route } from 'react-router-dom';
import MainPage from './pages/MainPage';
import DisplayBoard from './pages/DisplayBoard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/display" element={<DisplayBoard />} />
    </Routes>
  );
}

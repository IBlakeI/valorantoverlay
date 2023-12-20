import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import RankOverlay from './rankOverlay/RankOverlay';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RankOverlay />} />
      </Routes>
    </Router>
  );
};
export default App;

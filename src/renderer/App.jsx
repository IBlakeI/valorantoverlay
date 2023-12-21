import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import RankOverlay from './rankOverlay/RankOverlay';
import './App.css';
import SettingsView from './settingsView/SettingsView';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RankOverlay />} />
        <Route path="/settings" element={<SettingsView />} />
      </Routes>
    </Router>
  );
};
export default App;

import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useReducer } from 'react';
import RankOverlay from './rankOverlay/RankOverlay';
import './App.css';
import SettingsView from './settingsView/SettingsView';
import { createContext } from 'react';
import { initialState } from './reducer/initalstate';
import appReducer from '../renderer/reducer/appReducer';

export const AppContext = createContext();
const App = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <Router>
        <Routes>
          <Route path="/" element={<RankOverlay />} />
          <Route path="/settings" element={<SettingsView />} />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
};
export default App;

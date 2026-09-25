import { HashRouter as Router, Routes, Route } from "react-router";
import RankOverlay from "./pages/RankOverlay";
import Settings from "./pages/Settings";
import "./assets/main.css";

function App(): React.JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RankOverlay />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}

export default App;

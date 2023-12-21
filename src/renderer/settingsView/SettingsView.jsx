import { useState } from 'react';
import './settingsView.css'; // Import your CSS file

const SettingsPage = () => {
  const [showNameAndTag, setShowNameAndTag] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#1e1e1e');
  const [selectedRegion, setSelectedRegion] = useState('NA');
  const [riotName, setRiotName] = useState('');
  const [riotTag, setRiotTag] = useState('');

  const handleSaveSettings = (e) => {
    e.preventDefault();

    // Implement your save logic here
    console.log('Settings saved:', {
      showNameAndTag,
      backgroundColor,
      selectedRegion,
      riotName,
      riotTag,
    });
  };

  const handleRiotNameChange = (event) => {
    setRiotName(event.target.value);
  };

  const handleRiotTagChange = (event) => {
    setRiotTag(event.target.value);
  };

  return (
    <div className="settings-container">
      <h2>Settings</h2>
      <form onSubmit={handleSaveSettings}>
        <div className="setting-option">
          <label>
            <input
              type="checkbox"
              checked={showNameAndTag}
              onChange={() => setShowNameAndTag(!showNameAndTag)}
            />
            Show Name and Tag
          </label>
        </div>
        <div className="setting-option">
          <label>
            Background Color:{' '}
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
            />
          </label>
        </div>
        <div className="setting-option">
          <label>
            Region:{' '}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="NA">NA</option>
              <option value="EU">EU</option>
            </select>
          </label>
        </div>
        <div className="setting-option">
          <label>
            Riot ID:{' '}
            <input
              type="text"
              placeholder="Name"
              className="riotName"
              value={riotName}
              onChange={handleRiotNameChange}
            />
            <span>#</span>
            <input
              type="text"
              placeholder="Tag"
              className="riotTag"
              value={riotTag}
              onChange={handleRiotTagChange}
            />
          </label>
        </div>
        <div className="setting-option">
          <button type="submit">Save Settings</button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;

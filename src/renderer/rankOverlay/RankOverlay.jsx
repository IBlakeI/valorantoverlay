import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';

import './rankOverlay.css';
const RankOverlay = () => {
  const { state, dispatch } = useContext(AppContext);

  const [data, setData] = useState();

  const isValidInput =
    state?.config?.riotName &&
    state?.config?.riotTag &&
    state?.config?.selectedRegion &&
    data?.elo;
  const fetchStats = async () => {
    await fetch(
      `https://api.henrikdev.xyz/valorant/v1/mmr/${state?.config?.selectedRegion}/${state?.config?.riotName}/${state?.config?.riotTag}`,
    )
      .then((response) => response.json())
      .then((data) => setData(data?.data));
  };

  const navigate = useNavigate();
  console.log(data);

  useEffect(() => {
    const openSettingsHandler = () => {
      navigate('/settings');
    };

    window.electron?.ipcRenderer.on('open-settings', openSettingsHandler);
  }, [navigate]);

  useEffect(() => {
    window.electron?.ipcRenderer?.sendMessage('get-config');
    window.electron?.ipcRenderer?.on('config', (receivedConfig) => {
      dispatch({ type: 'SET_CONFIG', payload: receivedConfig });
    });
  }, []);
  useEffect(() => {
    let interval;
    if (
      state?.config?.riotName &&
      state?.config?.riotTag &&
      state?.config?.selectedRegion
    ) {
      fetchStats();
      interval = setInterval(() => {
        fetchStats();
      }, 5000);
    }

    return () => {
      clearInterval(interval);
      interval = null;
    };
  }, [state.config]);

  const getEloColor = (change) => {
    if (change > 0) {
      return 'green';
    }
    if (change === 0) {
      return 'white';
    }
    if (change < 0) {
      return 'red';
    }
  };

  useEffect(() => {
    window.electron.ipcRenderer.on('config-updated', (updatedConfig) => {
      // Handle the updated config
      dispatch({ type: 'SET_CONFIG', payload: updatedConfig });
    });
  }, []);

  return (
    <div
      className="overlayWrapper"
      style={{
        backgroundColor: state?.config?.backgroundColor || 'rgb(37, 37, 37)',
      }}
    >
      {isValidInput ? (
        <>
          <div className="wrapper">
            <div className="logoEloWrapper">
              <div className="rankLogo">
                <img src={data?.images?.small} />
              </div>
              <div className="elo">
                <b>{data?.ranking_in_tier}</b>
                <div className="rrtext">{' RR'}</div>
              </div>
            </div>
            <div
              className="lastGame"
              style={{
                color: getEloColor(data?.mmr_change_to_last_game),
              }}
            >
              {data?.mmr_change_to_last_game > 0
                ? `+${data?.mmr_change_to_last_game}`
                : data?.mmr_change_to_last_game}
            </div>
          </div>
          {state.config?.showNameAndTag && (
            <div className="nameWrapper">
              {data?.name}
              {' #'}
              {data?.tag}
            </div>
          )}
        </>
      ) : (
        <>Invalid Config. Please check via the settings bar.</>
      )}
    </div>
  );
};

export default RankOverlay;

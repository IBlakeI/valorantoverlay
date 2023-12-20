import { useEffect, useState } from 'react';

import './rankOverlay.css';
const RankOverlay = () => {
  const [data, setData] = useState();
  const fetchStats = async () => {
    await fetch(`https://api.henrikdev.xyz/valorant/v1/mmr/na/Dasnerth/king`)
      .then((response) => response.json())
      .then((data) => setData(data?.data));
  };
  console.log(data);
  useEffect(() => {
    fetchStats();
    let interval = setInterval(() => {
      // Your logic to be executed at each interval
      fetchStats();
    }, 10000);
    return () => {
      clearInterval(interval);
      interval = null;
    };
  }, []);

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

  return (
    <div className="overlayWrapper">
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
      <div className="nameWrapper">
        {data?.name}
        {' #'}
        {data?.tag}
      </div>
    </div>
  );
};

export default RankOverlay;

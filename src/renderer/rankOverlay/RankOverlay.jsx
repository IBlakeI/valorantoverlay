import { useEffect, useState } from 'react';

import './rankOverlay.css';
const RankOverlay = () => {
  const [data, setData] = useState();
  const fetchStats = async () => {
    await fetch(`https://api.henrikdev.xyz/valorant/v1/mmr/na/Blake/000`)
      .then((response) => response.json())
      .then((data) => setData(data?.data));
  };
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

  return (
    <div className="wrapper">
      <div className="nameWrapper">
        {data?.name}
        {'#'}
        {data?.tag}
      </div>
      <div className="rankLogo">
        <img src={data?.images?.small} />
      </div>
      <div className="elo">{`${data?.elo} RP`}</div>
      <div className="lastGame">{data?.mmr_change_to_last_game}</div>
    </div>
  );
};

export default RankOverlay;

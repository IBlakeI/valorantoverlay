import { Config, useConfigStore } from "@renderer/utils/configStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface RankData {
  elo: number;
  ranking_in_tier: number;
  mmr_change_to_last_game: number;
  name: string;
  tag: string;
  images?: {
    small?: string;
  };
}

interface HenrikDevResponse {
  data?: RankData;
}

const RankOverlay = () => {
  const navigate = useNavigate();

  const config = useConfigStore((state) => state.config);
  const setConfig = useConfigStore((state) => state.setConfig);

  const [data, setData] = useState<RankData | null>(null);

  /**
   * Open settings from the Electron menu/IPC.
   */
  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer;

    if (!ipcRenderer) {
      return;
    }

    const openSettingsHandler = () => {
      navigate("/settings");
    };

    ipcRenderer.on("open-settings", openSettingsHandler);

    return () => {
      ipcRenderer.removeListener?.("open-settings", openSettingsHandler);
    };
  }, [navigate]);

  /**
   * Fetch Valorant rank data.
   */
  useEffect(() => {
    if (
      config?.riotName == null ||
      config?.riotTag == null ||
      config?.selectedRegion == null
    ) {
      return;
    }

    let cancelled = false;

    const fetchStats = async (): Promise<void> => {
      try {
        const response = await fetch(
          `https://api.henrikdev.xyz/valorant/v1/mmr/${encodeURIComponent(
            config.selectedRegion,
          )}/${encodeURIComponent(config.riotName)}/${encodeURIComponent(
            config.riotTag,
          )}`,
          {
            headers: {
              Authorization: import.meta.env.VITE_HENRIKDEV_API_KEY,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch rank: ${response.status}`);
        }

        const result: HenrikDevResponse = await response.json();

        if (!cancelled) {
          setData(result.data ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch Valorant stats:", error);
          setData(null);
        }
      }
    };

    void fetchStats();

    const interval = window.setInterval(() => {
      void fetchStats();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [config?.riotName, config?.riotTag, config?.selectedRegion]);

  /**
   * Keep this renderer synchronized with config changes
   * from the Electron main process.
   */
  useEffect(() => {
    const ipcRenderer = window.electron?.ipcRenderer;

    if (!ipcRenderer) {
      return;
    }

    const handleConfigUpdated = (
      _event: Electron.IpcRendererEvent,
      updatedConfig: Config,
    ) => {
      setConfig(updatedConfig);
    };

    ipcRenderer.on("config-updated", handleConfigUpdated);

    return () => {
      ipcRenderer.removeListener?.("config-updated", handleConfigUpdated);
    };
  }, [setConfig]);

  const getEloColor = (change: number | undefined) => {
    if (change === undefined || change === 0) {
      return "text-white";
    }

    if (change > 0) {
      return "text-emerald-400";
    }

    return "text-red-400";
  };

  const getEloBackground = (change: number | undefined) => {
    if (change === undefined || change === 0) {
      return "bg-white/10";
    }

    if (change > 0) {
      return "bg-emerald-500/15";
    }

    return "bg-red-500/15";
  };

  const isValidInput = Boolean(
    config?.riotName &&
    config?.riotTag &&
    config?.selectedRegion &&
    data?.elo !== undefined,
  );

  return (
    <div
      className="h-full w-full text-white"
      style={{
        fontFamily: config?.selectedFont || "sans-serif",
      }}
    >
      {isValidInput && data ? (
        <div className="w-full max-w-md">
          {/* Main overlay card */}
          <div
            className="
              relative overflow-hidden
              rounded-xl
              bg-black/25
              px-4 py-3
              shadow-[0_4px_20px_rgba(0,0,0,0.35)]
              backdrop-blur-sm
            "
          >
            {/* Rank row */}
            <div className="flex items-center justify-between gap-4">
              {/* Rank icon + RR */}
              <div className="flex min-w-0 items-center gap-3">
                {/* Rank icon */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center">
                  {data.images?.small && (
                    <img
                      src={data.images.small}
                      alt=""
                      className="
                        h-full
                        w-full
                        object-contain
                        drop-shadow-[0_3px_4px_rgba(0,0,0,0.7)]
                      "
                    />
                  )}
                </div>

                {/* RR */}
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span
                      className="
                        text-4xl
                        font-black
                        leading-none
                        tracking-tight
                        [text-shadow:2px_2px_3px_rgba(0,0,0,0.8)]
                      "
                    >
                      {data.ranking_in_tier}
                    </span>

                    <span
                      className="
                        text-xs
                        font-bold
                        uppercase
                        tracking-widest
                        text-white/50
                      "
                    >
                      RR
                    </span>
                  </div>

                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
                    {config.selectedRegion}
                  </span>
                </div>
              </div>

              {/* Match RR change */}
              <div
                className={`
                  flex
                  min-w-[100px]
                  flex-col
                  items-center
                  justify-center
                  rounded-lg
                  px-3
                  py-2
                  shadow-inner
                  ${getEloBackground(data.mmr_change_to_last_game)}
                `}
              >
                <span
                  className={`
                    text-xl
                    font-black
                    leading-none
                    ${getEloColor(data.mmr_change_to_last_game)}
                  `}
                >
                  {data.mmr_change_to_last_game > 0
                    ? `+${data.mmr_change_to_last_game}`
                    : data.mmr_change_to_last_game}
                </span>

                <span className="mt-1 text-[9px] font-bold uppercase tracking-wider text-white/40">
                  Last Game
                </span>
              </div>
            </div>

            {/* Player information */}
            {config?.showNameAndTag && (
              <div className="mt-3 border-t border-white/10 pt-2">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 truncate">
                    <span className="text-sm font-bold text-white/90">
                      {data.name}
                    </span>

                    <span className="ml-1 text-sm font-medium text-white/40">
                      #{data.tag}
                    </span>
                  </div>

                  <span className="ml-3 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                    Competitive
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className="
            rounded-lg
            border border-white/10
            bg-black/25
            px-4 py-3
            text-sm
            text-white/60
          "
        >
          Invalid Config. Please check your settings.
        </div>
      )}
    </div>
  );
};

export default RankOverlay;

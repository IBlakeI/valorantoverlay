import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Config {
  riotName: string;
  riotTag: string;
  selectedRegion: string;
  selectedFont?: string;
  showNameAndTag?: boolean;
}

interface ConfigStore {
  config: Config;
  setConfig: (config: Config) => void;
}

const defaultConfig: Config = {
  riotName: "",
  riotTag: "",
  selectedRegion: "NA",
  selectedFont: "sans-serif",
  showNameAndTag: false,
};

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      config: defaultConfig,

      setConfig: (config) => {
        set({ config });
      },
    }),
    {
      name: "valorant-overlay-config",
    },
  ),
);

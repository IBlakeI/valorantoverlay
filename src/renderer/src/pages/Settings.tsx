import { useState, type ChangeEvent, type FormEvent } from "react";
import { useConfigStore, type Config } from "@renderer/utils/configStore";

const fontOptions = [
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Verdana",
  "Georgia",
  "ValorantFont",
  "joystix",
];

const defaultConfig: Config = {
  showNameAndTag: true,
  selectedRegion: "NA",
  riotName: "",
  riotTag: "",
  selectedFont: "sans-serif",
};

const Settings = () => {
  const config = useConfigStore((state) => state.config);
  const setConfig = useConfigStore((state) => state.setConfig);

  const [form, setForm] = useState<Config>({
    ...defaultConfig,
    ...config,
  });

  const updateField = <K extends keyof Config>(field: K, value: Config[K]) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSaveSettings = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setConfig(form);

    window.electron?.ipcRenderer?.send("config-updated", form);
  };

  const handleTextChange =
    (field: "riotName" | "riotTag") =>
    (event: ChangeEvent<HTMLInputElement>) => {
      updateField(field, event.target.value);
    };

  return (
    <div className="flex min-h-screen w-full flex-col bg-zinc-950 px-6 py-8 text-zinc-100">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

          <p className="text-sm text-zinc-500">
            Configure how your Valorant overlay looks and behaves.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="flex flex-col gap-4">
          {/* Player Settings */}
          <section className="settings-section">
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-zinc-100">Player</h2>

              <p className="mt-1 text-xs text-zinc-500">
                Enter the Riot ID used to retrieve your rank information.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {/* Riot ID */}
              <div>
                <label htmlFor="riotName" className="settings-label">
                  Riot ID
                </label>

                <div className="flex items-center">
                  <input
                    id="riotName"
                    type="text"
                    placeholder="Name"
                    value={form.riotName}
                    onChange={handleTextChange("riotName")}
                    className="settings-input flex-1 rounded-r-none"
                  />

                  <div className="flex h-[42px] items-center border-y border-zinc-700 bg-zinc-900 px-3 text-zinc-500">
                    #
                  </div>

                  <input
                    type="text"
                    placeholder="Tag"
                    value={form.riotTag}
                    onChange={handleTextChange("riotTag")}
                    className="settings-input w-28 rounded-l-none"
                  />
                </div>
              </div>

              {/* Region */}
              <div>
                <label htmlFor="region" className="settings-label">
                  Region
                </label>

                <div className="relative">
                  <select
                    id="region"
                    value={form.selectedRegion}
                    onChange={(e) =>
                      updateField("selectedRegion", e.target.value)
                    }
                    className="settings-select"
                  >
                    <option value="NA">North America</option>

                    <option value="EU">Europe</option>
                  </select>

                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* Overlay Settings */}
          <section className="settings-section">
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-zinc-100">Overlay</h2>

              <p className="mt-1 text-xs text-zinc-500">
                Customize the appearance of the rank overlay.
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {/* Show Name */}
              <label
                htmlFor="showNameAndTag"
                className="
                  flex
                  cursor-pointer
                  items-center
                  justify-between
                  rounded-lg
                  border
                  border-zinc-800
                  bg-zinc-950/50
                  px-4
                  py-3
                  transition
                  hover:border-zinc-700
                "
              >
                <div>
                  <div className="text-sm font-medium text-zinc-200">
                    Show Name and Tag
                  </div>

                  <div className="mt-0.5 text-xs text-zinc-500">
                    Display your Riot ID below the rank.
                  </div>
                </div>

                <input
                  id="showNameAndTag"
                  type="checkbox"
                  checked={form.showNameAndTag ?? false}
                  onChange={(e) =>
                    updateField("showNameAndTag", e.target.checked)
                  }
                  className="settings-checkbox"
                />
              </label>

              {/* Font */}
              <div>
                <label htmlFor="font" className="settings-label">
                  Font
                </label>

                <div className="relative">
                  <select
                    id="font"
                    value={form.selectedFont ?? "sans-serif"}
                    onChange={(e) =>
                      updateField("selectedFont", e.target.value)
                    }
                    style={{
                      fontFamily: form.selectedFont,
                    }}
                    className="settings-select"
                  >
                    <option
                      value="sans-serif"
                      style={{
                        fontFamily: "sans-serif",
                      }}
                    >
                      Sans Serif (default)
                    </option>

                    {fontOptions.map((font) => (
                      <option
                        key={font}
                        value={font}
                        style={{
                          fontFamily: font,
                        }}
                      >
                        {font}
                      </option>
                    ))}
                  </select>

                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </section>

          {/* Save */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="
                cursor-pointer
                rounded-lg
                bg-white
                px-5
                py-2.5
                text-sm
                font-semibold
                text-zinc-950
                shadow-sm
                transition
                hover:bg-zinc-200
                active:scale-[0.98]
              "
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;

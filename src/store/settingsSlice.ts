import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  type HistoryDensity,
  type ThemeKey,
} from "../containers/BingoMachinePageContainer";

export type SettingsState = {
  numbersPerDraw: number;
  historyDensity: HistoryDensity;
  theme: ThemeKey;
  bgmVolume: number; // percentage 0-100
  sfxVolume: number; // percentage 0-100
};

const initialState: SettingsState = {
  numbersPerDraw: 1,
  historyDensity: "large",
  theme: "themeAurora",
  bgmVolume: 80,
  sfxVolume: 90,
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setNumbersPerDraw: (state, action: PayloadAction<number>) => {
      state.numbersPerDraw = action.payload;
    },
    setHistoryDensity: (state, action: PayloadAction<HistoryDensity>) => {
      state.historyDensity = action.payload;
    },
    setTheme: (state, action: PayloadAction<ThemeKey>) => {
      state.theme = action.payload;
    },
    setBgmVolume: (state, action: PayloadAction<number>) => {
      state.bgmVolume = action.payload;
    },
    setSfxVolume: (state, action: PayloadAction<number>) => {
      state.sfxVolume = action.payload;
    },
  },
});

export const { setNumbersPerDraw, setHistoryDensity, setTheme, setBgmVolume, setSfxVolume } =
  settingsSlice.actions;

export default settingsSlice.reducer;

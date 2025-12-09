import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  type HistoryDensity,
  type ThemeKey,
} from "../containers/BingoMachinePageContainer";

export type SettingsState = {
  numbersPerDraw: number;
  historyDensity: HistoryDensity;
  theme: ThemeKey;
};

const initialState: SettingsState = {
  numbersPerDraw: 1,
  historyDensity: "large",
  theme: "themeAurora",
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
  },
});

export const { setNumbersPerDraw, setHistoryDensity, setTheme } = settingsSlice.actions;

export default settingsSlice.reducer;

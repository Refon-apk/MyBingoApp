export type ThemeKey = "themeAurora" | "themeSunset" | "themeForest" | "themeSnow" | "themeCitrus";

export type ThemeOption = {
  id: ThemeKey;
  label: string;
  description: string;
  preview: string;
};

export type HistoryDensity = "large" | "medium" | "compact";

export const ALL_NUMBERS = Array.from({ length: 75 }, (_, index) => index + 1);
export const SPIN_INTERVAL_MS = 80;
export const MAX_NUMBERS_PER_DRAW = 5;

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "themeAurora",
    label: "オーロラ",
    description: "深い紺と紫が静かな夜空をイメージした標準テーマ",
    preview: "linear-gradient(120deg, #0f172a 0%, #1e293b 50%, #312e81 100%)",
  },
  {
    id: "themeSunset",
    label: "サンセット",
    description: "夕焼けを思わせる暖色グラデーションで会場を華やかに演出",
    preview: "linear-gradient(135deg, #7c2d12 0%, #f97316 45%, #f43f5e 100%)",
  },
  {
    id: "themeForest",
    label: "フォレスト",
    description: "落ち着いた森の緑で目に優しいナチュラルな配色",
    preview: "linear-gradient(135deg, #064e3b 0%, #047857 45%, #0f172a 100%)",
  },
  {
    id: "themeSnow",
    label: "スノウ",
    description: "明るい白基調でクリーンな印象を与えるハイコントラストテーマ",
    preview: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 45%, #cbd5fe 100%)",
  },
  {
    id: "themeCitrus",
    label: "シトラス",
    description: "ビタミンカラーが弾ける明るいオレンジ基調のフェスティバルテーマ",
    preview: "linear-gradient(135deg, #fef08a 0%, #f97316 45%, #ea580c 100%)",
  },
];

export const HISTORY_DENSITY_OPTIONS: Array<{
  id: HistoryDensity;
  label: string;
  description: string;
}> = [
  { id: "large", label: "大", description: "視認性重視のビッグサイズ" },
  { id: "medium", label: "中", description: "バランスの良い標準サイズ" },
  { id: "compact", label: "小", description: "表示数を優先したコンパクト表示" },
];

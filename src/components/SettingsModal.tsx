import { ChangeEvent } from "react";
import {
  MAX_NUMBERS_PER_DRAW,
  type HistoryDensity,
} from "../containers/BingoMachinePageContainer";
import styles from "../pages/BingoMachinePage.module.css";
import classNames from "../utils/classNames";

type HistoryOption = {
  id: HistoryDensity;
  label: string;
  description: string;
};

type SettingsModalProps = {
  numbersPerDraw: number;
  isSpinning: boolean;
  historyDensity: HistoryDensity;
  historyOptions: HistoryOption[];
  bgmVolume: number;
  sfxVolume: number;
  onNumbersPerDrawChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSelectHistoryDensity: (density: HistoryDensity) => void;
  onBgmVolumeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSfxVolumeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenThemeModal: () => void;
  onClose: () => void;
};

/**
 * 一般設定（抽選個数や履歴表示）をまとめたモーダル。
 */
function SettingsModal({
  numbersPerDraw,
  isSpinning,
  historyDensity,
  historyOptions,
  bgmVolume,
  sfxVolume,
  onNumbersPerDrawChange,
  onSelectHistoryDensity,
  onBgmVolumeChange,
  onSfxVolumeChange,
  onOpenThemeModal,
  onClose,
}: SettingsModalProps) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 id="settings-modal-title" className={styles.modalTitle}>
            表示設定
          </h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.settingGroup}>
          <label htmlFor="numbers-per-draw" className={styles.settingLabel}>
            一度に引く個数
          </label>
          <div className={styles.rangeRow}>
            <input
              id="numbers-per-draw"
              type="range"
              min={1}
              max={MAX_NUMBERS_PER_DRAW}
              step={1}
              value={numbersPerDraw}
              onChange={onNumbersPerDrawChange}
              className={styles.rangeInput}
              disabled={isSpinning}
            />
            <span className={styles.rangeValue}>{numbersPerDraw}個</span>
          </div>
          <p className={styles.settingHint}>
            {`最大${MAX_NUMBERS_PER_DRAW}個まで同時に抽選できます。残りが少ない場合は自動調整されます。`}
          </p>
        </div>

        <div className={styles.settingGroup}>
          <span className={styles.settingLabel}>履歴表示サイズ</span>
          <div className={styles.optionButtons}>
            {historyOptions.map((option) => {
              const isActive = historyDensity === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={classNames(
                    styles.optionButton,
                    isActive && styles.optionButtonActive,
                  )}
                  onClick={() => onSelectHistoryDensity(option.id)}
                  aria-pressed={isActive}
                  title={option.description}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className={styles.settingHint}>
            表示される履歴数に合わせてサイズバランスを調整できます。
          </p>
        </div>

        <div className={styles.settingGroup}>
          <label htmlFor="bgm-volume" className={styles.settingLabel}>
            BGM 音量
          </label>
          <div className={styles.rangeRow}>
            <input
              id="bgm-volume"
              type="range"
              min={0}
              max={100}
              step={1}
              value={bgmVolume}
              onChange={onBgmVolumeChange}
              className={styles.rangeInput}
            />
            <span className={styles.rangeValue}>{bgmVolume}%</span>
          </div>
          <p className={styles.settingHint}>演出中に流れるBGM音量を調整します。</p>
        </div>

        <div className={styles.settingGroup}>
          <label htmlFor="sfx-volume" className={styles.settingLabel}>
            効果音 音量
          </label>
          <div className={styles.rangeRow}>
            <input
              id="sfx-volume"
              type="range"
              min={0}
              max={100}
              step={1}
              value={sfxVolume}
              onChange={onSfxVolumeChange}
              className={styles.rangeInput}
            />
            <span className={styles.rangeValue}>{sfxVolume}%</span>
          </div>
          <p className={styles.settingHint}>抽選番号表示などの効果音音量です。</p>
        </div>

        <button type="button" className={styles.themeLaunchButton} onClick={onOpenThemeModal}>
          テーマを選択…
        </button>
      </div>
    </div>
  );
}

export default SettingsModal;

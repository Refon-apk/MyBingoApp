import {
  type ThemeKey,
  type ThemeOption,
} from "../containers/BingoMachinePageContainer";
import styles from "../pages/BingoMachinePage.module.css";
import classNames from "../utils/classNames";

type ThemeModalProps = {
  currentTheme: ThemeKey;
  themeOptions: ThemeOption[];
  onApplyTheme: (themeId: ThemeKey) => void;
  onClose: () => void;
};

/**
 * テーマ選択専用のモーダル。
 */
function ThemeModal({ currentTheme, themeOptions, onApplyTheme, onClose }: ThemeModalProps) {
  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={classNames(styles.modal, styles.themeModal)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 id="theme-modal-title" className={styles.modalTitle}>
            テーマを選択
          </h2>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.themeGrid}>
          {themeOptions.map((option) => {
            const isActive = option.id === currentTheme;
            const cardClass = classNames(styles.themeCard, isActive && styles.themeCardActive);

            return (
              <button
                key={option.id}
                type="button"
                className={cardClass}
                onClick={() => onApplyTheme(option.id)}
                aria-pressed={isActive}
              >
                <span
                  className={styles.themePreview}
                  style={{ background: option.preview }}
                  aria-hidden="true"
                />
                <span className={styles.themeDetails}>
                  <span className={styles.themeName}>{option.label}</span>
                  <span className={styles.themeDescription}>{option.description}</span>
                  <span className={styles.themeAction}>
                    {isActive ? "現在のテーマ" : "このテーマに変更"}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ThemeModal;

import styles from "../pages/BingoMachinePage.module.css";

type ConfirmResetModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * リセット実行前にユーザーへ確認を促すモーダル。
 */
function ConfirmResetModal({ onConfirm, onCancel }: ConfirmResetModalProps) {
  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-reset-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 id="confirm-reset-title" className={styles.modalTitle}>
            リセットしますか？
          </h2>
          <button type="button" className={styles.closeButton} onClick={onCancel}>
            ×
          </button>
        </div>
        <p className={styles.confirmBody}>
          抽選履歴と残りの数字がすべて初期化されます。よろしいですか？
        </p>
        <div className={styles.confirmActions}>
          <button type="button" className={styles.confirmSecondary} onClick={onCancel}>
            キャンセル
          </button>
          <button type="button" className={styles.confirmDanger} onClick={onConfirm}>
            リセットする
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmResetModal;

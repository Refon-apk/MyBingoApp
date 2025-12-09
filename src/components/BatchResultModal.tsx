import styles from "../pages/BingoMachinePage.module.css";

type BatchResultModalProps = {
  batch: number[];
  onConfirm: () => void;
};

/**
 * 直近の複数抽選結果をまとめて通知するモーダル。
 */
function BatchResultModal({ batch, onConfirm }: BatchResultModalProps) {
  return (
    <div className={styles.batchModal}>
      <div
        className={styles.batchContent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-modal-title"
      >
        <h2 id="batch-modal-title" className={styles.batchTitle}>
          今回の抽選結果
        </h2>
        <div className={styles.batchNumbers}>
          {batch.map((value) => (
            <span key={`batch-${value}`} className={styles.batchNumber}>
              {value}
            </span>
          ))}
        </div>
        <button type="button" className={styles.batchConfirmButton} onClick={onConfirm}>
          OK
        </button>
      </div>
    </div>
  );
}

export default BatchResultModal;

import { useEffect, useState } from "react";
import styles from "../pages/BingoMachinePage.module.css";

type BatchResultModalProps = {
  batch: number[];
  onConfirm: () => void;
  onRevealNumber?: () => void;
};

/**
 * 直近の複数抽選結果をまとめて通知するモーダル。
 * 最初は「?」の玉を表示し、時間差で割れて数字が現れる演出を付与。
 */
function BatchResultModal({ batch, onConfirm, onRevealNumber }: BatchResultModalProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setRevealed(true), 500);
    return () => window.clearTimeout(timer);
  }, [batch]);

  useEffect(() => {
    if (!revealed || !onRevealNumber) {
      return;
    }
    const STAGGER_MS = 1500;
    const timeouts = batch.map((_, index) =>
      window.setTimeout(() => {
        onRevealNumber();
      }, index * STAGGER_MS),
    );
    return () => {
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
    };
  }, [batch, onRevealNumber, revealed]);

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
          {batch.map((value, index) => {
            const delay = `${index * 1500}ms`;
            return (
              <span key={`batch-${value}`} className={styles.batchNumber}>
                <span
                  className={`${styles.batchNumberShell} ${revealed ? styles.batchNumberShellCrack : ""}`}
                  style={{ animationDelay: delay }}
                  aria-hidden={revealed}
                >
                  <span className={styles.batchQuestion}>?</span>
                </span>
                <span
                  className={`${styles.batchNumberValue} ${revealed ? styles.batchNumberValueShow : ""}`}
                  style={{ animationDelay: delay }}
                >
                  {value}
                </span>
              </span>
            );
          })}
        </div>
        <button type="button" className={styles.batchConfirmButton} onClick={onConfirm}>
          OK
        </button>
      </div>
    </div>
  );
}

export default BatchResultModal;

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import BatchResultModal from "../components/BatchResultModal";
import SettingsModal from "../components/SettingsModal";
import ThemeModal from "../components/ThemeModal";
import {
  ALL_NUMBERS,
  HISTORY_DENSITY_OPTIONS,
  MAX_NUMBERS_PER_DRAW,
  SPIN_INTERVAL_MS,
  THEME_OPTIONS,
  type HistoryDensity,
  type ThemeKey,
} from "../containers/BingoMachinePageContainer";
import classNames from "../utils/classNames";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setHistoryDensity as setHistoryDensityAction,
  setNumbersPerDraw as setNumbersPerDrawAction,
  setTheme as setThemeAction,
} from "../store/settingsSlice";
import styles from "./BingoMachinePage.module.css";

/**
 * 抽選処理やプレビュー、設定モーダルなど画面全体の挙動を担うビンゴページ。
 */
function BingoMachinePage() {
  const dispatch = useAppDispatch();
  const numbersPerDraw = useAppSelector((state) => state.settings.numbersPerDraw);
  const historyDensity = useAppSelector((state) => state.settings.historyDensity);
  const theme = useAppSelector((state) => state.settings.theme);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [remainingNumbers, setRemainingNumbers] = useState<number[]>(ALL_NUMBERS);
  const [lastNumber, setLastNumber] = useState<number | null>(null);
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  const [isThemeModalOpen, setThemeModalOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [previewNumber, setPreviewNumber] = useState<number | null>(null);
  const [recentBatch, setRecentBatch] = useState<number[] | null>(null);

  const spinIntervalRef = useRef<number | null>(null);
  const remainingRef = useRef(remainingNumbers);
  const numbersPerDrawRef = useRef(numbersPerDraw);

  useEffect(() => {
    remainingRef.current = remainingNumbers;
  }, [remainingNumbers]);

  useEffect(() => {
    numbersPerDrawRef.current = numbersPerDraw;
  }, [numbersPerDraw]);

  useEffect(() => {
    return () => {
      if (spinIntervalRef.current !== null) {
        window.clearInterval(spinIntervalRef.current);
      }
    };
  }, []);

  /**
   * スピン用インターバルを確実に停止し、二重タイマーを防ぐ。
   */
  const clearSpinTimer = useCallback(() => {
    if (spinIntervalRef.current !== null) {
      window.clearInterval(spinIntervalRef.current);
      spinIntervalRef.current = null;
    }
  }, []);

  /**
   * 抽選確定までのスピンプレビューを開始する。
   * すでにスピン中または残り番号がない場合は何もしない。
   */
  const startSpin = useCallback(() => {
    if (isSpinning || remainingRef.current.length === 0) {
      return;
    }

    setIsSpinning(true);
    setRecentBatch(null);
    setPreviewNumber(() => {
      const pool = remainingRef.current;
      if (pool.length === 0) return null;
      const index = Math.floor(Math.random() * pool.length);
      return pool[index];
    });

    spinIntervalRef.current = window.setInterval(() => {
      const pool = remainingRef.current;
      if (pool.length === 0) {
        setPreviewNumber(null);
        return;
      }
      const index = Math.floor(Math.random() * pool.length);
      setPreviewNumber(pool[index]);
    }, SPIN_INTERVAL_MS);
  }, [isSpinning]);

  /**
   * スピンプレビューを停止し、抽選結果を履歴と状態に反映する。
   */
  const stopSpin = useCallback(() => {
    if (!isSpinning) {
      return;
    }

    clearSpinTimer();
    setIsSpinning(false);
    setPreviewNumber(null);

    setRemainingNumbers((prevRemaining) => {
      const pool = [...prevRemaining];
      const drawCount = Math.min(numbersPerDrawRef.current, pool.length);

      if (drawCount === 0) {
        return pool;
      }

      const batch: number[] = [];
      for (let i = 0; i < drawCount; i += 1) {
        const index = Math.floor(Math.random() * pool.length);
        batch.push(pool.splice(index, 1)[0]);
      }

      setDrawnNumbers((prev) => [...prev, ...batch]);
      setLastNumber(batch[batch.length - 1] ?? null);
      setRecentBatch(drawCount > 1 ? batch : null);

      return pool;
    });
  }, [clearSpinTimer, isSpinning]);

  /**
   * タイマーや履歴を含めて初期状態へリセットする。
   */
  const resetGame = () => {
    clearSpinTimer();
    setIsSpinning(false);
    setPreviewNumber(null);
    setDrawnNumbers([]);
    setRemainingNumbers(ALL_NUMBERS);
    setLastNumber(null);
    setRecentBatch(null);
  };

  /**
   * 「一度に抽選する個数」のスライダー変更を状態へ反映し、まとめ表示をリセットする。
   */
  const handleNumbersPerDrawChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setNumbersPerDrawAction(Number(event.target.value)));
    setRecentBatch(null);
  };

  const primaryButtonDisabled = !isSpinning && remainingNumbers.length === 0;
  const drawButtonClass = classNames(
    styles.drawButton,
    primaryButtonDisabled && styles.drawButtonDisabled,
    isSpinning && styles.drawButtonSpinning,
  );

  const startLabel =
    numbersPerDraw === 1 ? "抽選スタート" : `抽選スタート（${numbersPerDraw}個）`;
  const drawButtonLabel = isSpinning ? "ストップ" : startLabel;

  /**
   * スペースキー操作などでスピン状態をトグルする。
   */
  const handleSpaceToggle = useCallback(() => {
    if (isSpinning) {
      stopSpin();
    } else {
      startSpin();
    }
  }, [isSpinning, startSpin, stopSpin]);

  const confirmBatchModal = useCallback(() => {
    setRecentBatch(null);
  }, []);

  const historyDensityClass = useMemo(() => {
    const key = `historyList${historyDensity.charAt(0).toUpperCase()}${historyDensity.slice(
      1,
    )}` as keyof typeof styles;
    return styles[key] ?? styles.historyListMedium;
  }, [historyDensity]);

  const lastNumberClass = classNames(
    styles.lastNumber,
    (previewNumber ?? lastNumber) === null && styles.lastNumberReady,
    isSpinning && styles.lastNumberSpinning,
  );

  const displayNumber = previewNumber ?? lastNumber;

  const hasHistory = drawnNumbers.length > 0;
  const reversedHistory = useMemo(
    () =>
      drawnNumbers
        .map((value, index) => ({ value, order: index + 1 }))
        .reverse(),
    [drawnNumbers],
  );

  useEffect(() => {
    if (!isSettingsOpen && !isThemeModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (isThemeModalOpen) {
          setThemeModalOpen(false);
          return;
        }
        setSettingsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSettingsOpen, isThemeModalOpen]);

  useEffect(() => {
    if (!isSettingsOpen && !isThemeModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isSettingsOpen, isThemeModalOpen]);

  const openSettings = () => setSettingsOpen(true);
  const closeSettings = () => {
    setSettingsOpen(false);
    setThemeModalOpen(false);
  };
  const openThemeModal = () => setThemeModalOpen(true);
  const closeThemeModal = () => setThemeModalOpen(false);
  const applyTheme = useCallback(
    (themeId: ThemeKey) => {
      dispatch(setThemeAction(themeId));
    },
    [dispatch],
  );
  const handleHistoryDensityChange = useCallback(
    (density: HistoryDensity) => {
      dispatch(setHistoryDensityAction(density));
    },
    [dispatch],
  );

  const shouldShowBatchModal =
    recentBatch !== null && recentBatch.length > 1 && !isSpinning;

  useEffect(() => {
    const handleSpace = (event: KeyboardEvent) => {
      if (event.code !== "Space" && event.key !== " ") {
        return;
      }

      if (shouldShowBatchModal) {
        event.preventDefault();
        confirmBatchModal();
        return;
      }

      if (isSettingsOpen || isThemeModalOpen) {
        return;
      }

      event.preventDefault();
      handleSpaceToggle();
    };

    window.addEventListener("keydown", handleSpace);
    return () => {
      window.removeEventListener("keydown", handleSpace);
    };
  }, [
    confirmBatchModal,
    handleSpaceToggle,
    isSettingsOpen,
    isThemeModalOpen,
    shouldShowBatchModal,
  ]);

  const containerClass = classNames(styles.container, styles[theme]);

  return (
    <main className={containerClass}>
      <div className={styles.topBar}>
        <header className={styles.header}>
          <h1 className={styles.title}>もとやまンゴ</h1>
          <p className={styles.subtitle}>develop by: もとやま</p>
        </header>
        <button
          type="button"
          className={styles.settingsButton}
          onClick={openSettings}
          aria-haspopup="dialog"
          aria-expanded={isSettingsOpen}
        >
          ⚙ 設定
        </button>
      </div>

      <div className={styles.content}>
        <section className={styles.controlPanel}>
          <div className={styles.controls}>
            <button
              type="button"
              onClick={isSpinning ? stopSpin : startSpin}
              disabled={primaryButtonDisabled}
              className={drawButtonClass}
            >
              {drawButtonLabel}
            </button>

            <button type="button" onClick={resetGame} className={styles.resetButton}>
              リセット
            </button>

            <div className={styles.remaining}>
              残り: {remainingNumbers.length} / {ALL_NUMBERS.length}
            </div>
            <div className={styles.perDrawNotice}>一度に抽選: {numbersPerDraw}個</div>
          </div>

          <div className={styles.lastNumberWrapper}>
            <div className={lastNumberClass}>{displayNumber ?? "READY"}</div>
          </div>
        </section>

        <section className={styles.historyWrapper}>
          <h2 className={styles.historyTitle}>抽選履歴</h2>
          <p className={styles.historySummary}>
            <span>合計: {drawnNumbers.length}件</span>
            <span>残り: {remainingNumbers.length}件</span>
            <span>一度に抽選: 最大 {Math.min(numbersPerDraw, MAX_NUMBERS_PER_DRAW)}個</span>
          </p>
          <div className={styles.history}>
            {hasHistory ? (
              <div className={classNames(styles.historyList, historyDensityClass)}>
                {reversedHistory.map(({ value, order }) => (
                  <div key={`history-${value}-${order}`} className={styles.historyNumber}>
                    {value}
                    <span className={styles.historyOrder}>{order}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className={styles.historyEmpty}>抽選履歴はまだありません。</span>
            )}
          </div>
        </section>
      </div>

      {shouldShowBatchModal && recentBatch && (
        <BatchResultModal batch={recentBatch} onConfirm={confirmBatchModal} />
      )}

      {isSettingsOpen && !isThemeModalOpen && (
        <SettingsModal
          numbersPerDraw={numbersPerDraw}
          isSpinning={isSpinning}
          historyDensity={historyDensity}
          historyOptions={HISTORY_DENSITY_OPTIONS}
          onNumbersPerDrawChange={handleNumbersPerDrawChange}
          onSelectHistoryDensity={handleHistoryDensityChange}
          onOpenThemeModal={openThemeModal}
          onClose={closeSettings}
        />
      )}

      {isThemeModalOpen && (
        <ThemeModal
          themeOptions={THEME_OPTIONS}
          currentTheme={theme}
          onApplyTheme={(themeId) => {
            applyTheme(themeId);
            closeThemeModal();
          }}
          onClose={closeThemeModal}
        />
      )}
    </main>
  );
}

export default BingoMachinePage;


















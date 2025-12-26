import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import classNames from "../utils/classNames";
import styles from "./SlotMachine.module.css";

import leverSound from "../therdParty/web_copilot_v4/assets/sound/lever.mp3";
import slotBgm from "../assets/bingoBGM.mp3";
import reelStopSound from "../assets/reelStop.mp3";
import bonusSuccessSound from "../assets/bonasSucces.mp3";
import bonusFailSound from "../assets/bonasFaild.mp3";

const LETTERS = ["I", "M", "S"] as const;
const CHEAT_SEQUENCE = ["i", "m", "s"];

const SYMBOL_SIZE = 120;
const LOOPS = 30;
const STRIP_HEIGHT = (LOOPS + 1) * LETTERS.length * SYMBOL_SIZE;

const GOGO_MODE: "PRE" | "LAST" = "LAST";


type SlotMachineProps = {
  onExit: () => void;
  bgmVolume: number;
};

type ReelState = {
  spinning: boolean;
  pos: number;
  speed: number;
  maxSpeed: number;
  accel: number;
  raf: number | null;
  resultIndex: number | null;
};

function createInitialState(): ReelState {
  return {
    spinning: false,
    pos: 0,
    speed: 0,
    maxSpeed: 42,
    accel: 2.2,
    raf: null,
    resultIndex: null,
  };
}

export default function SlotMachine({ onExit, bgmVolume }: SlotMachineProps) {
  const stripsRef = useRef<Array<HTMLDivElement | null>>([]);
  const stateRef = useRef<ReelState[]>([createInitialState(), createInitialState(), createInitialState()]);
  const canStopRef = useRef(false);
  const isWinRoundRef = useRef(false);
  const thirdLetterRef = useRef<typeof LETTERS[number]>("S");
  const cheatModeRef = useRef(false);
  const cheatProgressRef = useRef(0);
  const enableTimeoutRef = useRef<number | null>(null);
  const [stopEnabled, setStopEnabled] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [gogoActive, setGogoActive] = useState(false);
  const [resultState, setResultState] = useState<"win" | "lose" | null>(null);
  const completedRef = useRef(false);

  const leverSoundRef = useRef<HTMLAudioElement | null>(null);
  const reelStopSoundRef = useRef<HTMLAudioElement | null>(null);
  const bonusSuccessSoundRef = useRef<HTMLAudioElement | null>(null);
  const bonusFailSoundRef = useRef<HTMLAudioElement | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  const stripSymbols = useMemo(() => {
    const entries: Array<{ key: string; letter: string }> = [];
    for (let loop = 0; loop <= LOOPS; loop += 1) {
      LETTERS.forEach((letter, index) => {
        entries.push({
          key: `${letter}-${loop}-${index}`,
          letter,
        });
      });
    }
    return entries;
  }, []);

  useEffect(() => {
    leverSoundRef.current = new Audio(leverSound);
    reelStopSoundRef.current = new Audio(reelStopSound);
    bonusSuccessSoundRef.current = new Audio(bonusSuccessSound);
    bonusFailSoundRef.current = new Audio(bonusFailSound);
  }, []);

  useEffect(() => {
    const bgm = new Audio(slotBgm);
    bgm.loop = true;
    bgm.volume = Math.max(0, Math.min(1, bgmVolume / 100));
    bgmRef.current = bgm;
    void bgm.play().catch(() => undefined);

    return () => {
      bgm.pause();
      bgm.currentTime = 0;
      bgmRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = Math.max(0, Math.min(1, bgmVolume / 100));
    }
  }, [bgmVolume]);

  const playSound = useCallback((audioRef: MutableRefObject<HTMLAudioElement | null>) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.currentTime = 0;
    void audio.play().catch(() => undefined);
  }, []);

  const cleanup = useCallback(() => {
    stateRef.current.forEach((state) => {
      state.spinning = false;
      if (state.raf !== null) {
        cancelAnimationFrame(state.raf);
        state.raf = null;
      }
    });
    if (enableTimeoutRef.current !== null) {
      clearTimeout(enableTimeoutRef.current);
      enableTimeoutRef.current = null;
    }
    canStopRef.current = false;
  }, []);

  const completeAndExit = useCallback(() => {
    if (completedRef.current) {
      return;
    }
    completedRef.current = true;
    cleanup();
    onExit();
  }, [cleanup, onExit]);

  const animateReel = useCallback((index: number) => {
    const reelState = stateRef.current[index];
    const strip = stripsRef.current[index];
    if (!strip) return;

    const step = () => {
      if (!reelState.spinning) {
        return;
      }
      reelState.speed = Math.min(reelState.maxSpeed, reelState.speed + reelState.accel);
      reelState.pos -= reelState.speed;
      if (reelState.pos < -STRIP_HEIGHT) {
        reelState.pos += STRIP_HEIGHT;
      }
      strip.style.transition = "none";
      strip.style.transform = `translateY(${reelState.pos}px)`;
      reelState.raf = requestAnimationFrame(step);
    };

    reelState.raf = requestAnimationFrame(step);
  }, []);

  const checkResult = useCallback(() => {
    if (!stateRef.current.every((state) => state.resultIndex !== null)) {
      return;
    }

    const win = isWinRoundRef.current;
    setResultState(win ? "win" : "lose");
  if (GOGO_MODE === "LAST") {
    if (win) {
      setGogoActive(true);
      playSound(bonusSuccessSoundRef);
    } else {
      playSound(bonusFailSoundRef);
    }
  } else {
    // PREの場合は結果音のみ
    playSound(win ? bonusSuccessSoundRef : bonusFailSoundRef);
  }
  }, [playSound]);

  const stopReel = useCallback(
    (index: number) => {
      if (!canStopRef.current) {
        return;
      }
      const reelState = stateRef.current[index];
      if (!reelState.spinning) {
        return;
      }

      reelState.spinning = false;
      if (reelState.raf !== null) {
        cancelAnimationFrame(reelState.raf);
        reelState.raf = null;
      }
      playSound(reelStopSoundRef);

      const strip = stripsRef.current[index];
      if (!strip) {
        return;
      }

      const predeterminedLetter =
        index === 0 ? "I" : index === 1 ? "M" : thirdLetterRef.current;
      const target = LETTERS.indexOf(predeterminedLetter);
      reelState.resultIndex = target;

      requestAnimationFrame(() => {
        strip.style.transition = "transform 600ms cubic-bezier(0.1, 0.8, 0.2, 1)";
        strip.style.transform = `translateY(${-target * SYMBOL_SIZE}px)`;
      });

      setStopEnabled((prev) => {
        const next = [...prev] as [boolean, boolean, boolean];
        next[index] = false;
        return next;
      });

      const handleTransitionEnd = () => {
        strip.removeEventListener("transitionend", handleTransitionEnd);
        checkResult();
      };
      strip.addEventListener("transitionend", handleTransitionEnd);
    },
    [checkResult, playSound],
  );

  const startSpin = useCallback(() => {
    completedRef.current = false;
    canStopRef.current = false;
    setStopEnabled([false, false, false]);
    setGogoActive(false);
    setResultState(null);
    // ---- 先告知（PRE） ----
    if (GOGO_MODE === "PRE") {
      if (isWinRoundRef.current) {
        setGogoActive(true);
        playSound(bonusSuccessSoundRef);
      }
    }

    thirdLetterRef.current = cheatModeRef.current
      ? "S"
      : LETTERS[Math.floor(Math.random() * LETTERS.length)];
    stateRef.current.forEach((state, index) => {
      state.spinning = true;
      state.pos = 0;
      state.speed = 0;
      state.resultIndex = null;
      const strip = stripsRef.current[index];
      if (strip) {
        strip.style.transition = "none";
        strip.style.transform = "translateY(0px)";
      }
      animateReel(index);
    });

    isWinRoundRef.current = thirdLetterRef.current === "S";
    playSound(leverSoundRef);

    enableTimeoutRef.current = window.setTimeout(() => {
      canStopRef.current = true;
      setStopEnabled([true, true, true]);
    }, 200);
  }, [animateReel, playSound]);

  useEffect(() => {
    startSpin();
    return () => {
      cleanup();
    };
  }, [cleanup, startSpin]);

  const handleCheatSequence = useCallback(
    (key: string) => {
      const targetIndex = cheatProgressRef.current;
      if (key === CHEAT_SEQUENCE[targetIndex]) {
        cheatProgressRef.current += 1;
        if (cheatProgressRef.current === CHEAT_SEQUENCE.length) {
          cheatModeRef.current = !cheatModeRef.current;
          cheatProgressRef.current = 0;
        }
        return;
      }
      if (key === CHEAT_SEQUENCE[0]) {
        cheatProgressRef.current = 1;
      } else {
        cheatProgressRef.current = 0;
      }
    },
    [],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "c") {
        event.preventDefault();
        completeAndExit();
        return;
      }

      if (key === "1" || key === "2" || key === "3") {
        event.preventDefault();
        stopReel(Number(key) - 1);
        return;
      }

      handleCheatSequence(key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [completeAndExit, handleCheatSequence, stopReel]);

  const setStripRef = useCallback((index: number, element: HTMLDivElement | null) => {
    stripsRef.current[index] = element;
  }, []);

  const hasResult = resultState !== null;

  return (
    <div className={styles.slotOverlay}>
      <div className={styles.displayArea}>
        <div className={styles.reelFrame}>
          <div className={styles.reels}>
            {[0, 1, 2].map((index) => (
              <div key={`reel-${index}`} className={styles.reel}>
                <div className={styles.strip} ref={(element) => setStripRef(index, element)}>
                  {stripSymbols.map((symbol) => (
                    <div key={`${symbol.key}-${index}`} className={styles.symbol}>
                      <span className={styles.symbolText}>{symbol.letter}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className={classNames(styles.gogoLamp, gogoActive && styles.gogoLampActive)}
          aria-live="polite"
        >
          GOGO!
        </div>
        {hasResult && resultState === "win" && (
          <div
            className={classNames(
              styles.resultOverlay,
              styles.resultOverlayVisible,
              styles.resultOverlayWin,
            )}
          >
            <div className={styles.resultContent}>
              <p className={styles.resultLabel}>SUPER BONUS</p>
              <p className={classNames(styles.resultText, styles.resultTextWin)}>ボーナス獲得！</p>
              <p className={styles.resultSubtext}>Cキーでビンゴに戻れます</p>
            </div>
          </div>
        )}
        {hasResult && resultState === "lose" && (
          <div
            className={classNames(
              styles.resultOverlay,
              styles.resultOverlayVisible,
              styles.resultOverlayLose,
            )}
          >
            <div>
              <div className={styles.loseGlitchText}>失敗...</div>
              <div className={styles.loseSubtext}>Cキーでビンゴに戻れます</div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.controlArea}>
        <div className={styles.leverBtn}>
          <span className={styles.leverBall} />
        </div>
        <div className={styles.stopGroup}>
          {[0, 1, 2].map((index) => (
            <button
              key={`stop-${index}`}
              type="button"
              className={classNames(styles.stopBtn, stopEnabled[index] && styles.stopBtnEnabled)}
              onClick={() => stopReel(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.closeHint}>Cキーで戻る</div>
    </div>
  );
}

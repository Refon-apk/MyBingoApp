import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type FreezeIMSProps = {
  trigger: number;
  text?: string;
  onComplete?: () => void;
};

export default function FreezeIMS({ trigger, text = "IMS", onComplete }: FreezeIMSProps) {
  const [phase, setPhase] = useState("idle"); // idle | off | black | quotes | letters
  const [showSlotChance, setShowSlotChance] = useState(false);

  const letters = useMemo(() => [...text], [text]);
  const lettersAnimationMs = useMemo(() => {
    if (letters.length === 0) return 0;
    const staggerMs = 0.94 * 1000;
    const letterDurationMs = 0.5 * 1000;
    const lastLetterDelay = (letters.length - 1) * staggerMs;
    return lastLetterDelay + letterDurationMs;
  }, [letters.length]);

  useEffect(() => {
    if (!trigger) return;

    setPhase("off");
    setShowSlotChance(false);

    const offMs = 820;
    const blackMs = 4000;
    const quotesMs = 3000;
    const returnDelayMs = 3000; // wait 3s after animation completes before returning

    const t1 = setTimeout(() => setPhase("black"), offMs);
    const t2 = setTimeout(() => setPhase("quotes"), offMs + blackMs);
    const t3 = setTimeout(() => setPhase("letters"), offMs + blackMs + quotesMs);
    const t4 = setTimeout(() => {
      setPhase("idle");
      onComplete?.();
    }, offMs + blackMs + quotesMs + lettersAnimationMs + returnDelayMs);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [lettersAnimationMs, onComplete, trigger]);

  const phrases = useMemo(
    () => [
      "お客様と共に発展し共に喜べる\nパートナーであり続けたい",
      "より多くのお客様から絶対必要とされる永続的な企業体を目指し、\n豊かで平和な社会の実現・発展に貢献していくこと",
      "お客様と共に発展し、共に考え共に喜びあえる企業であること",
      "皆が喜びを感じる豊かで平和な社会の実現・発展",
      "システム設計、システム開発ならアイエムエスへ",
      "ネットワークカメラ",
      "kaole",
      "尾高 一秀",
    ],
    [],
  );

  const quotePlacements = useMemo(
    () =>
      phrases.map((line) => {
        const rand = (min: number, max: number) => Math.random() * (max - min) + min;
        const vertical = Math.random() > 0.5;
        return {
          text: line,
          top: `${rand(5, 72)}%`,
          left: `${rand(8, 82)}%`,
          rotate: `${rand(-14, 14)}deg`,
          fontSize: `${rand(14, 34)}px`,
          opacity: rand(0.65, 0.92),
          vertical,
          delay: rand(0, 0.5),
        };
      }),
    [phrases, trigger],
  );

  return (
    <AnimatePresence>
      {phase !== "idle" && (
        <motion.div
          className="fxRoot"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="fxBg" />

          {phase === "off" && (
            <motion.div className="offWrap">
              <motion.div
                className="screenGlow"
                initial={{ scaleY: 1, scaleX: 1, opacity: 1, filter: "blur(0px)" }}
                animate={{
                  opacity: [1, 1, 0],
                  scaleY: [1, 0.06, 0],
                  scaleX: [1, 1.06, 0.85],
                  filter: ["blur(0px)", "blur(1.5px)", "blur(0px)"],
                }}
                transition={{
                  duration: 0.42,
                  ease: [0.2, 0.9, 0.2, 1],
                  times: [0, 0.75, 1],
                }}
              />
              <motion.div
                className="collapseLine"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.25, times: [0, 0.25, 1], delay: 0.12 }}
              />
            </motion.div>
          )}

          {phase === "black" && null}

          {phase === "quotes" && (
            <div className="imsQuotes">
              {quotePlacements.map((item, idx) => (
                <motion.div
                  key={`quote-${idx}`}
                  className={`imsQuote ${item.vertical ? "imsQuoteVertical" : ""}`}
                  style={{
                    top: item.top,
                    left: item.left,
                    rotate: item.rotate,
                    fontSize: item.fontSize,
                    opacity: item.opacity,
                  }}
                  initial={{ opacity: 0, scale: 0.65, filter: "blur(8px)" }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    transition: { duration: 0.55, delay: item.delay, ease: [0.25, 0.8, 0.2, 1] },
                  }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                >
                  {item.text}
                </motion.div>
              ))}
            </div>
          )}

          {phase === "letters" && (
            <>
              <motion.div
                className="letters"
                initial="hidden"
                animate="show"
                onAnimationComplete={() => {
                  setShowSlotChance(true);
                }}
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.94 } },
                }}
              >
                {letters.map((ch, i) => (
                  <motion.span
                    key={`${ch}-${i}`}
                    className="letter"
                    variants={{
                      hidden: { opacity: 0, scale: 0.6, y: 14, filter: "blur(10px)" },
                      show: {
                        opacity: 1,
                        scale: [0.6, 1.25, 1],
                        y: [14, -4, 0],
                        filter: ["blur(10px)", "blur(0px)"],
                        transition: { duration: 0.5, ease: [0.2, 0.9, 0.2, 1] },
                      },
                    }}
                  >
                    {ch}
                  </motion.span>
                ))}
              </motion.div>
              {showSlotChance && (
                <div className="slotChanceText slotChanceTextVisible">
                  <div className="slotChanceLabel">SLOT CHANCE</div>
                  <div className="slotChanceSub">スロットチャンス発生！</div>
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

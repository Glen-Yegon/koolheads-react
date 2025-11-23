import { useEffect, useMemo, useState } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "../App.css";

type LoaderProps = {
  duration?: number; // how long to show loader (ms)
  onFinish?: () => void;
};

const CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_+=<>?/[]{}|~";

export default function Loader({ duration = 5000, onFinish }: LoaderProps) {
  const target = "KOOLHEADS";
  const len = target.length;

  const revealTimes = useMemo(() => {
    return Array.from({ length: len }).map((_, i) =>
      Math.round(((i + 1) / len) * duration)
    );
  }, [len, duration]);

  const [display, setDisplay] = useState<string[]>(
    Array.from({ length: len }, () => "")
  );
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem("koolheads_loader_seen");

    // If already seen, skip showing loader
    if (alreadySeen) {
      setHasLoaded(true);
      if (onFinish) onFinish();
      return;
    }

    let rafId = 0;
    let mounted = true;
    const start = performance.now();

    function step(now: number) {
      if (!mounted) return;
      const elapsed = now - start;

      const next = display.slice();
      for (let i = 0; i < len; i++) {
        if (elapsed >= revealTimes[i]) {
          next[i] = target[i];
        } else {
          const rand = CHARSET[Math.floor(Math.random() * CHARSET.length)];
          next[i] = rand;
        }
      }
      setDisplay(next);

      if (elapsed < duration) {
        rafId = requestAnimationFrame(step);
      } else {
        setDisplay(Array.from(target));
        sessionStorage.setItem("koolheads_loader_seen", "true"); // Mark as seen
        setTimeout(() => onFinish && onFinish(), 300);
      }
    }

    rafId = requestAnimationFrame(step);
    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ This return statement must be in the main function body, not inside useEffect
  if (hasLoaded) return null;

  return (
    <div className="loader-viewport" role="status" aria-label="Loading KOOLHEADS">
      <div className="loader-content">
        <div className="cheetah-wrap">
          <DotLottieReact
            src="https://lottie.host/15d124dc-02e0-4ed8-acd8-5ddbd665e6f8/X8eaHbX3EX.lottie"
            loop
            autoplay
            className="cheetah-lottie"
          />
        </div>

        <h1 className="loader-title" aria-live="polite">
          {display.map((c, i) => (
            <span
              key={i}
              className={`loader-letter ${c === target[i] ? "revealed" : "shuffling"}`}
            >
              {c || "\u00A0"}
            </span>
          ))}
        </h1>
      </div>
    </div>
  );
}

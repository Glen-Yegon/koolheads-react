import React, { createContext, useContext, useRef, useState, useEffect } from "react";
import type { ReactNode, FC } from "react"; // ✅ type-only imports
import { useNavigate } from "react-router-dom";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "../styles/page-transition.css";
import { PANEL_ANIM_MS, LOTTIE_DISPLAY_MS} from "./page-transition-constants";



const TOTAL_WAIT_MS = PANEL_ANIM_MS + LOTTIE_DISPLAY_MS;

/* --- Context --- */
interface PageTransitionContextType {
  trigger: (to: string) => void;
  isActive: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextType | null>(null);

export function usePageTransition(): PageTransitionContextType {
  const ctx = useContext(PageTransitionContext);
  if (!ctx)
    throw new Error("usePageTransition must be used within a PageTransitionProvider");
  return ctx;
}

/* --- Provider --- */
export const PageTransitionProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const targetRef = useRef<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

const trigger = (to: string) => {
  if (isActive) return;
  targetRef.current = to;
  setIsActive(true);

  timerRef.current = window.setTimeout(() => {
    if (targetRef.current) {
      navigate(targetRef.current);
    }

    // Keep overlay for fade-out duration
    timerRef.current = window.setTimeout(() => {
      setIsActive(false);
      targetRef.current = null;
    }, 400); // match this with CSS fade-out duration
  }, TOTAL_WAIT_MS);
};


  useEffect(() => clearTimers, []);

  return (
    <PageTransitionContext.Provider value={{ trigger, isActive }}>
      {children}
      <TransitionOverlay active={isActive} />
    </PageTransitionContext.Provider>
  );
};

/* --- Overlay --- */
function TransitionOverlay({ active }: { active: boolean }) {
  return (
    <div
      className={`pt-overlay ${active ? "active" : ""}`}
      aria-hidden={!active} // ✅ valid ARIA string
    >
      <div className="pt-panels">
        <div className="pt-panel tl" />
        <div className="pt-panel tr" />
        <div className="pt-panel bl" />
        <div className="pt-panel br" />
      </div>

      <div className="pt-lottie-wrap">
        <div className="pt-lottie-inner">
          <DotLottieReact
            src="https://lottie.host/15d124dc-02e0-4ed8-acd8-5ddbd665e6f8/X8eaHbX3EX.lottie"
            loop
            autoplay
            className="pt-lottie"
          />
        </div>
      </div>
    </div>
  );
}

/* --- Link wrapper for internal navigation --- */
interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: ReactNode;
}

export function TransitionLink({ to, children, ...rest }: TransitionLinkProps) {
  const { trigger, isActive } = usePageTransition();

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    ) return;

    e.preventDefault();
    if (isActive) return;
    trigger(to);
  };

  return (
    <a href={to} onClick={onClick} {...rest}>
      {children}
    </a>
  );
}

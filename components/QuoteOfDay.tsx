"use client";

import { useEffect, useRef, useState } from "react";
import { getItems } from "@/lib/cms";

interface Quote {
  text: string;
  author: string;
  meaning: string;
}

/**
 * Admin-added quotes (CMS "quotes" section): title = quote text, description =
 * author. Set the item's link to "pin" to pin it (always shown). Merged with
 * the built-in list below so the owner can add their own from the admin panel.
 */
function adminQuotes(): Quote[] {
  return getItems("quotes")
    .filter((i) => i.title?.trim())
    .map((i) => ({
      text: i.title.trim(),
      author: (i.description || "").trim() || "Anonymous",
      meaning: "",
    }));
}
function pinnedQuote(): Quote | null {
  const p = getItems("quotes").find(
    (i) => (i.link || "").trim().toLowerCase() === "pin" && i.title?.trim()
  );
  return p
    ? {
        text: p.title.trim(),
        author: (p.description || "").trim() || "Anonymous",
        meaning: "",
      }
    : null;
}

const quotes: Quote[] = [
  { text: "The unexamined life is not worth living.", author: "Socrates", meaning: "A call to relentless self-reflection that challenges passive existence." },
  { text: "I know that I know nothing.", author: "Socrates", meaning: "The ultimate humility in wisdom—true knowledge begins with acknowledging our ignorance." },
  { text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi", meaning: "A profound reminder that personal transformation is the root of any greater shift." },
  { text: "To live is the rarest thing in the world. Most people exist, that is all.", author: "Oscar Wilde", meaning: "It cuts to the difference between merely surviving and truly embracing life." },
  { text: "Everything can be taken from a man but one thing... to choose one's attitude.", author: "Viktor E. Frankl", meaning: "Drawn from extreme suffering, this affirms the unbreakable power of inner choice." },
  { text: "The mind is everything. What you think you become.", author: "Buddha", meaning: "A timeless insight into how our thoughts shape reality itself." },
  { text: "You could not step twice into the same river.", author: "Heraclitus", meaning: "Captures the eternal flux of existence—nothing stays the same, including ourselves." },
  { text: "When I let go of what I am, I become what I might be.", author: "Lao Tzu", meaning: "Profound wisdom on surrender, growth, and the fluid nature of identity." },
  { text: "We suffer more often in imagination than in reality.", author: "Seneca", meaning: "A Stoic truth that frees us from the prison of overthinking and imagined fears." },
  { text: "The opposite of love is not hate, it's indifference.", author: "Elie Wiesel", meaning: "It reveals the quietest, most devastating force in human connections." },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci", meaning: "A profound elegance in restraint that challenges complexity as a false measure of depth." },
  { text: "Art is never finished, only abandoned.", author: "Leonardo da Vinci", meaning: "A poignant truth about creation's endless pursuit." },
  { text: "There is nothing either good or bad, but thinking makes it so.", author: "William Shakespeare", meaning: "A revolutionary insight into the subjective nature of reality and perception." },
  { text: "The fool doth think he is wise, but the wise man knows himself to be a fool.", author: "William Shakespeare", meaning: "Humble self-awareness as the true mark of wisdom." },
  { text: "Heard melodies are sweet, but those unheard are sweeter.", author: "John Keats", meaning: "A celebration of imagination's boundless potential beyond the tangible." },
  { text: "This being human is a guest house. Every morning a new arrival.", author: "Rumi", meaning: "Embrace all emotions as temporary visitors; they arrive to teach and cleanse." },
  { text: "The woods are lovely, dark and deep, But I have promises to keep...", author: "Robert Frost", meaning: "The tension between life's seductive rest and duty to continue the journey." },
  { text: "Look on my Works, ye Mighty, and despair!", author: "Percy Bysshe Shelley", meaning: "The inevitable fall of empires and hubris; time erodes all human power." },
  { text: "Do not go gentle into that good night.", author: "Dylan Thomas", meaning: "A poetic battle cry against passivity in the face of mortality." },
  { text: "Stay hungry, stay foolish.", author: "Steve Jobs", meaning: "A modern call to curiosity, risk, and lifelong learning." },
  { text: "We are all stories in the end. Just make it a good one.", author: "The Doctor", meaning: "A line that captures the narrative essence of human life and legacy." },
  { text: "The obstacle is the way.", author: "Ryan Holiday", meaning: "Stoic reinterpretation: adversity is not a barrier but the path to growth." },
  { text: "I think, therefore I am.", author: "René Descartes", meaning: "The absolute foundation of modern philosophy and self-awareness." },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", meaning: "A reminder that constraints and struggles breed innovation." },
  { text: "The journey of a thousand miles begins with a single step.", author: "Laozi", meaning: "A call to action—monumental achievements require immediate, small beginnings." },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", meaning: "The ultimate testament to the survival power of having a distinct purpose." },
  { text: "Imagination is more important than knowledge.", author: "Albert Einstein", meaning: "Knowledge is limited; imagination encircles the world and drives progress." },
  { text: "The meaning of life is that it stops.", author: "Franz Kafka", meaning: "A profound reminder that scarcity of time is what gives existence its value." },
  { text: "The privilege of a lifetime is to become who you truly are.", author: "Carl Jung", meaning: "The ultimate goal of psychological and spiritual maturation." },
  { text: "How strange it is to be anything at all.", author: "Jeff Mangum", meaning: "A simple, haunting eight-word summary of the miracle of existence." },
];

/**
 * Floating "Quote of the Day" toast — fixed bottom-right, overlays the site
 * without affecting page scroll.
 *   · First shows 15s after the site opens.
 *   · After ✕ (or auto-hide) it returns 30s later with a NEW quote.
 *   · Only on the home page, and never while a popup/dialog is open — if one
 *     opens while it's showing, it slips away and comes back afterwards.
 *   · Randomized via a shuffle bag: no repeats until every quote has shown, so
 *     the next one is genuinely unpredictable.
 * Hover reveals the author; click springs open the meaning.
 */
const APPEAR_FIRST_MS = 15_000; // first appearance after load
const APPEAR_AGAIN_MS = 30_000; // after ✕ it returns in 30s with a new quote
const VISIBLE_MS = 600_000; // if left alone, it stays for 10 minutes
const RETRY_MS = 4_000; // blocked (popup open / not home) → check again soon

/** Fisher–Yates shuffle → an unpredictable, repeat-free order. */
function shuffled(pool: Quote[]): Quote[] {
  const b = [...pool];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export default function QuoteOfDay() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  // Pause the auto-hide while the user is hovering or has it expanded.
  const holdRef = useRef(false);
  const bagRef = useRef<Quote[]>([]);
  const showTimer = useRef<number | undefined>(undefined);
  const hideTimer = useRef<number | undefined>(undefined);
  const visibleRef = useRef(false); // mirror of `visible` for the observer closure
  const dismissRef = useRef<() => void>(() => {}); // ✕ handler set by the effect
  // Reduced-motion users get an instant appearance (no slide).
  const [reduced] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    // Show only on the home page, never over an open popup/dialog, and never
    // while the Jerry welcome toast is still up (they'd stack bottom-right).
    const canShow = () =>
      window.location.pathname === "/" &&
      !document.querySelector(
        '[role="dialog"], [aria-modal="true"], [data-welcome-popup]'
      );

    const draw = (): Quote => {
      // A pinned admin quote always wins.
      const pin = pinnedQuote();
      if (pin) return pin;
      if (bagRef.current.length === 0) {
        // Rebuild the bag from built-ins + admin quotes each cycle so newly
        // added quotes join the rotation without a reload.
        bagRef.current = shuffled([...quotes, ...adminQuotes()]);
      }
      return bagRef.current.pop() as Quote;
    };

    const show = () => {
      if (!canShow()) {
        showTimer.current = window.setTimeout(show, RETRY_MS);
        return;
      }
      setExpanded(false);
      holdRef.current = false;
      setQuote(draw());
      // double-rAF so the hidden state paints once → the slide-up runs.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setVisible(true))
      );
      armAutoHide();
    };

    const armAutoHide = () => {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => {
        if (holdRef.current) {
          armAutoHide(); // held open (hover/expanded) → keep checking
          return;
        }
        hideAndReschedule();
      }, VISIBLE_MS);
    };

    const hideAndReschedule = () => {
      setVisible(false);
      window.clearTimeout(hideTimer.current);
      window.setTimeout(() => setQuote(null), 400); // after the exit transition
      showTimer.current = window.setTimeout(show, APPEAR_AGAIN_MS);
    };
    dismissRef.current = hideAndReschedule;

    // If a popup opens while the quote is up, let it slip away (return later).
    const observer = new MutationObserver(() => {
      if (
        visibleRef.current &&
        document.querySelector('[role="dialog"], [aria-modal="true"]')
      ) {
        hideAndReschedule();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    showTimer.current = window.setTimeout(show, APPEAR_FIRST_MS);
    return () => {
      window.clearTimeout(showTimer.current);
      window.clearTimeout(hideTimer.current);
      observer.disconnect();
    };
  }, []);

  // Mirror `visible` into a ref for the MutationObserver closure.
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  if (!quote) return null;

  return (
    /* pointer-events-none wrapper: the page scrolls/clicks straight through
       everywhere except the card itself. Anchored bottom-right. */
    <div className="pointer-events-none fixed inset-x-3 bottom-[5.5rem] z-50 mx-auto max-w-[400px] sm:inset-x-auto sm:right-10 sm:bottom-10 sm:mx-0 sm:w-[92vw] sm:max-w-sm">
      <div
        className="qotd group pointer-events-auto"
        onMouseEnter={() => {
          holdRef.current = true;
        }}
        onMouseLeave={() => {
          holdRef.current = expanded;
        }}
        style={{
          transform: visible ? "translateY(0) scale(1)" : "translateY(120%) scale(0.98)",
          opacity: visible ? 1 : 0,
          transition: reduced
            ? "none"
            : "transform 400ms cubic-bezier(0.22, 1, 0.36, 1), opacity 400ms ease",
          willChange: "transform, opacity",
        }}
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() =>
            setExpanded((e) => {
              const next = !e;
              holdRef.current = next; // keep visible while expanded
              return next;
            })
          }
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && setExpanded((x) => !x)
          }
          aria-expanded={expanded}
          className="qotd-pulse relative w-full cursor-pointer rounded-2xl border border-[rgba(var(--theme-accent-rgb),0.35)] bg-black/70 px-5 py-4 text-left shadow-[0_8px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-colors duration-150 hover:border-[rgba(var(--theme-accent-rgb),0.7)] active:scale-[0.99]"
        >
          {/* Dismiss — pointer-events-auto + high stack so the click always lands */}
          <button
            type="button"
            aria-label="Dismiss quote"
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              dismissRef.current(); // hide now, return in 30s with a new quote
            }}
            className="pointer-events-auto absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-white/50 transition-all hover:bg-white/10 hover:text-white active:scale-90"
          >
            ✕
          </button>

          <div className="mb-1.5 flex items-center gap-2 text-[10px] uppercase tracking-widest text-[var(--theme-accent)] opacity-80">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--theme-accent)]" />
            Quote of the day
          </div>

          <p className="pr-6 font-mono text-[13px] leading-relaxed text-white">
            &ldquo;{quote.text}&rdquo;
          </p>

          {/* Author — revealed on hover (or while expanded) */}
          <div className={`qotd-author ${expanded ? "is-open" : ""}`}>
            <p className="mt-1.5 font-mono text-xs text-white/80">
              — {quote.author}
            </p>
          </div>

          {/* Meaning — springs open on click */}
          <div
            className="overflow-hidden"
            style={{
              maxHeight: expanded ? 200 : 0,
              opacity: expanded ? 1 : 0,
              transform: expanded ? "translateY(0)" : "translateY(-4px)",
              transition:
                "max-height 450ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 300ms ease, transform 300ms ease",
              willChange: "max-height, opacity, transform",
            }}
          >
            <p className="mt-2 border-t border-[rgba(var(--theme-accent-rgb),0.2)] pt-2 font-mono text-[11px] italic leading-relaxed text-white/60">
              {quote.meaning}
            </p>
          </div>

          <p className="mt-1.5 font-mono text-[10px] text-white/30 transition-colors group-hover:text-white/50">
            {expanded ? "click to collapse" : "hover for author · click for meaning"}
          </p>
        </div>
      </div>
    </div>
  );
}

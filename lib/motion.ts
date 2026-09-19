import type { Transition } from "framer-motion";

/**
 * Shared motion vocabulary for every popup.
 *
 * Each popup authors its OWN entrance (the palette drops from above, the
 * document viewer unrolls, the game powers on like a CRT...), so they do not
 * all feel like the same box scaling in. What they share is the grammar:
 *
 * - one curve for arrivals: ease-out-quart, the curve the terminal chips and
 *   cards already use;
 * - exits that are short and quiet. The user has already decided to leave,
 *   so an exit that replays a 500ms spring just makes the page feel slow to
 *   respond. Every popup used to exit on its entrance spring.
 */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Standard exit: fast, accelerating away. */
export const EXIT: Transition = { duration: 0.16, ease: [0.4, 0, 1, 1] };

/**
 * Backdrop fade shared by every modal overlay.
 *
 * pointerEvents drops to "none" the instant an exit starts. AnimatePresence
 * keeps an exiting overlay mounted until EVERY descendant has finished
 * leaving — for the project modal that includes the screenshot flying back
 * into its card, ~600ms — and until then a fully transparent full-screen
 * layer sat on top of the page swallowing every click. A closed popup must
 * never be able to eat input.
 */
export const BACKDROP = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    pointerEvents: "auto",
    transition: { duration: 0.24, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    pointerEvents: "none",
    transition: { duration: 0.18, ease: "easeIn" },
  },
} as const;

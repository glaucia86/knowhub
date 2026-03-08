import type { Variants } from 'framer-motion';

export const motionTransition = {
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1] as const,
};

export const motionContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.08,
    },
  },
};

export const motionFadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: motionTransition },
};

export const motionScaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: { opacity: 1, scale: 1, transition: motionTransition },
};

export const motionHoverLift = {
  whileHover: { y: -4, scale: 1.01 },
  whileTap: { scale: 0.99 },
  transition: { type: 'spring' as const, stiffness: 420, damping: 26 },
};

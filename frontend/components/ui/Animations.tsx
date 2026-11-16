"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { ReactNode } from "react";

// Animation variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
};

export const fadeInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
};

export const fadeInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

export const slideInFromBottom: Variants = {
  initial: { opacity: 0, y: "100%" },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: "100%" },
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

// Reusable animated components
interface AnimatedContainerProps {
  children: ReactNode;
  variant?: keyof typeof variants;
  delay?: number;
  duration?: number;
  className?: string;
  stagger?: boolean;
}

const variants = {
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  slideInFromBottom,
};

export const AnimatedContainer = ({
  children,
  variant = "fadeInUp",
  delay = 0,
  duration = 0.5,
  className = "",
  stagger = false,
}: AnimatedContainerProps) => (
  <motion.div
    variants={stagger ? staggerContainer : variants[variant]}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ duration, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

// Stagger children animation
export const StaggerChildren = ({
  children,
  className = "",
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) => (
  <motion.div
    variants={{
      animate: {
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
    initial="initial"
    animate="animate"
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerChild = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div variants={staggerItem} className={className}>
    {children}
  </motion.div>
);

// Hover animations
export const HoverScale = ({
  children,
  scale = 1.05,
  className = "",
}: {
  children: ReactNode;
  scale?: number;
  className?: string;
}) => (
  <motion.div
    whileHover={{ scale }}
    whileTap={{ scale: scale * 0.95 }}
    className={className}
  >
    {children}
  </motion.div>
);

export const HoverLift = ({
  children,
  y = -4,
  className = "",
}: {
  children: ReactNode;
  y?: number;
  className?: string;
}) => (
  <motion.div
    whileHover={{ y }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Page transitions
export const PageTransition = ({ children }: { children: ReactNode }) => (
  <AnimatePresence mode="wait">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  </AnimatePresence>
);

// Modal animations
export const ModalBackdrop = ({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 flex items-center justify-center p-4"
  >
    {children}
  </motion.div>
);

export const ModalContent = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: 20 }}
    onClick={(e) => e.stopPropagation()}
    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
);

// Loading animations
export const PulseLoader = ({ className = "" }: { className?: string }) => (
  <motion.div
    animate={{ opacity: [0.5, 1, 0.5] }}
    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    className={`bg-gray-200 dark:bg-gray-700 rounded ${className}`}
  />
);

export const BouncingDots = ({ className = "" }: { className?: string }) => (
  <div className={`flex space-x-1 ${className}`}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          delay: i * 0.1,
        }}
        className="w-2 h-2 bg-rose-500 rounded-full"
      />
    ))}
  </div>
);

// Scroll animations
export const ScrollReveal = ({
  children,
  className = "",
  threshold = 0.1,
}: {
  children: ReactNode;
  className?: string;
  threshold?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: threshold }}
    transition={{ duration: 0.6 }}
    className={className}
  >
    {children}
  </motion.div>
);

// Button animations
export const AnimatedButton = ({
  children,
  className = "",
  variant = "primary",
  ...props
}: {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  [key: string]: any;
}) => {
  const baseClasses =
    "relative overflow-hidden rounded-xl font-medium transition-all duration-200";
  const variantClasses = {
    primary:
      "bg-rose-500 hover:bg-rose-600 text-white shadow-lg hover:shadow-xl",
    secondary:
      "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white",
    ghost:
      "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      <motion.div
        className="absolute inset-0 bg-white/20"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

// Card animations
export const AnimatedCard = ({
  children,
  className = "",
  hoverEffect = true,
}: {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={
      hoverEffect
        ? { y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }
        : {}
    }
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm ${className}`}
  >
    {children}
  </motion.div>
);

// Number counter animation
export const CountUp = ({
  end,
  duration = 2,
  className = "",
}: {
  end: number;
  duration?: number;
  className?: string;
}) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.span
        initial={{ textContent: "0" }}
        animate={{ textContent: end.toString() }}
        transition={{ duration, ease: "easeOut" }}
      />
    </motion.span>
  );
};

// Floating elements
export const FloatingElement = ({
  children,
  className = "",
  amplitude = 20,
  duration = 6,
}: {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
}) => (
  <motion.div
    animate={{
      y: [0, -amplitude, 0],
      rotate: [0, 5, 0, -5, 0],
    }}
    transition={{
      duration,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className={className}
  >
    {children}
  </motion.div>
);

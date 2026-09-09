"use client";

import { type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Shared types                                                       */
/* ------------------------------------------------------------------ */

interface AnimationWrapperProps {
  children: ReactNode;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  1. FadeInUp                                                        */
/*  Animates children from 20px below with opacity 0→1                 */
/* ------------------------------------------------------------------ */

interface FadeInUpOwnProps extends AnimationWrapperProps {
  /** Delay in seconds before the animation starts */
  delay?: number;
}

type FadeInUpProps = FadeInUpOwnProps &
  Omit<HTMLMotionProps<"div">, "children" | "className" | "delay">;

export function FadeInUp({ children, className, delay = 0, ...rest }: FadeInUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={cn(className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  2. StaggerContainer                                                */
/*  Staggers children entry by 0.08s                                   */
/* ------------------------------------------------------------------ */

type StaggerContainerProps = AnimationWrapperProps &
  Omit<HTMLMotionProps<"div">, "children" | "className">;

const staggerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const staggerChildVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function StaggerContainer({
  children,
  className,
  ...rest
}: StaggerContainerProps) {
  return (
    <motion.div
      variants={staggerVariants}
      initial="hidden"
      animate="visible"
      className={cn(className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Wrap each direct child inside a StaggerContainer with this. */
export { staggerChildVariants };

/* ------------------------------------------------------------------ */
/*  3. ScaleOnHover                                                    */
/*  Scales to 1.02 on hover with a spring transition                   */
/* ------------------------------------------------------------------ */

type ScaleOnHoverProps = AnimationWrapperProps &
  Omit<HTMLMotionProps<"div">, "children" | "className">;

export function ScaleOnHover({
  children,
  className,
  ...rest
}: ScaleOnHoverProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  4. GlowPulse                                                       */
/*  Pulsing cyan box-shadow animation                                  */
/* ------------------------------------------------------------------ */

interface GlowPulseOwnProps extends AnimationWrapperProps {
  /** Glow colour (any valid CSS colour). Default: cyan #06b6d4 */
  glowColor?: string;
  /** Duration of one full pulse cycle in seconds */
  duration?: number;
}

type GlowPulseProps = GlowPulseOwnProps &
  Omit<HTMLMotionProps<"div">, "children" | "className">;

export function GlowPulse({
  children,
  className,
  glowColor = "#06b6d4",
  duration = 2,
  ...rest
}: GlowPulseProps) {
  return (
    <motion.div
      animate={{
        boxShadow: [
          `0 0 8px 0 ${glowColor}33`,
          `0 0 20px 4px ${glowColor}66`,
          `0 0 8px 0 ${glowColor}33`,
        ],
      }}
      transition={{
        duration,
        ease: "easeInOut",
        repeat: Infinity,
      }}
      className={cn("rounded-2xl", className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  5. Shimmer                                                         */
/*  Loading skeleton with a shimmer animation (glass surface gradient)  */
/* ------------------------------------------------------------------ */

interface ShimmerProps {
  className?: string;
  /** Width of the shimmer block (default: 100%) */
  width?: string | number;
  /** Height of the shimmer block (default: 16px) */
  height?: string | number;
}

export function Shimmer({
  className,
  width = "100%",
  height = 16,
}: ShimmerProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-xl",
        className
      )}
      style={{
        width,
        height,
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)",
        }}
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 0.5,
        }}
      />
    </motion.div>
  );
}

"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Variant & size maps                                                */
/* ------------------------------------------------------------------ */

const variantStyles = {
  primary: [
    "bg-gradient-to-r from-cyan-500 to-purple-500",
    "text-white font-medium",
    "shadow-lg shadow-cyan-500/20",
    "hover:shadow-cyan-500/30",
  ].join(" "),

  secondary: [
    "text-white font-medium",
    "border border-white/10",
    "hover:border-white/20",
  ].join(" "),

  ghost: [
    "bg-transparent",
    "text-slate-400",
    "hover:text-white hover:bg-white/5",
  ].join(" "),

  danger: [
    "text-white font-medium",
    "border border-red-500/20",
    "hover:border-red-500/30",
  ].join(" "),
} as const;

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-5 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-7 py-3.5 text-base rounded-xl gap-2.5",
} as const;

/* ------------------------------------------------------------------ */
/*  Inline glass backgrounds (can't be expressed as pure Tailwind)     */
/* ------------------------------------------------------------------ */

function variantInlineStyle(variant: ButtonVariant): React.CSSProperties {
  switch (variant) {
    case "secondary":
      return {
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      };
    case "danger":
      return {
        background: "rgba(239,68,68,0.12)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      };
    default:
      return {};
  }
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = keyof typeof variantStyles;
type ButtonSize = keyof typeof sizeStyles;

type MotionButtonProps = HTMLMotionProps<"button">;

interface ButtonProps
  extends Omit<MotionButtonProps, "ref"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className,
      style,
      children,
      disabled,
      ...rest
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={disabled ? undefined : { scale: 1.03 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={cn(
          // Base
          "relative inline-flex cursor-pointer select-none items-center justify-center",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]",
          "disabled:pointer-events-none disabled:opacity-50",
          // Variant + Size
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        style={{ ...variantInlineStyle(variant), ...style }}
        disabled={disabled}
        {...rest}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

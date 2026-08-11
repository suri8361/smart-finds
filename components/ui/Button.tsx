import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

// Uppercase, letter-spaced labels + a moderate (not full-pill) radius reads
// closer to a boutique/retail CTA than a SaaS button — the main visual lever
// alongside the warm color tokens (see app/globals.css).
const buttonStyles = cva(
  "inline-flex items-center justify-center gap-2 rounded-md font-semibold uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-brand-600 text-white hover:bg-brand-700",
        secondary: "bg-surface-muted text-foreground hover:bg-border",
        outline: "border border-foreground/25 text-foreground hover:border-foreground/50 hover:bg-surface-muted",
        ghost: "text-foreground hover:bg-surface-muted",
      },
      size: {
        sm: "h-9 px-4 text-[11px]",
        md: "h-11 px-6 text-xs",
        lg: "h-12 px-7 text-xs",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

type ButtonVariants = VariantProps<typeof buttonStyles>;

type ButtonAsLink = ButtonVariants &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

type ButtonAsButton = ButtonVariants & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

export type ButtonProps = ButtonAsLink | ButtonAsButton;

/**
 * Reusable button primitive (SRS §20). Renders a Next.js `<Link>` when given
 * an `href`, or a native `<button>` otherwise, so call sites don't have to
 * choose between "Button" and "LinkButton" components — the styling and
 * variant contract is identical either way.
 */
export function Button({ className, variant, size, ...props }: ButtonProps) {
  const classes = cn(buttonStyles({ variant, size }), className);

  if (props.href !== undefined) {
    const { href, ...rest } = props;
    return <Link href={href} className={classes} {...rest} />;
  }

  return <button className={classes} {...props} />;
}

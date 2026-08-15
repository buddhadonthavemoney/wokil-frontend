import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-navy hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        // The gold-outlined secondary action Stitch uses on nearly every screen.
        gold: "border border-accent bg-card text-primary shadow-sm hover:bg-surface-low",
        outline: "border border-border bg-card text-primary hover:bg-surface-low",
        secondary: "bg-secondary text-secondary-foreground hover:bg-surface-low",
        ghost: "text-muted-foreground hover:bg-surface-low hover:text-primary",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4",
        lg: "h-11 px-8",
        // Icon buttons sit on the tighter `lg` radius, per the Stitch scale.
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

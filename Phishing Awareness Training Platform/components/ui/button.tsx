import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: outline brand — no solid fill
        default:
          "border border-brand text-brand bg-transparent hover:bg-brand/[0.07] active:bg-brand/[0.12] active:scale-[0.98]",
        // Filled solid — use only when explicitly needed
        solid:
          "bg-brand text-white border border-brand/80 hover:bg-brand/90 active:scale-[0.98] shadow-sm btn-ripple",
        // Destructive: outline red
        destructive:
          "border border-destructive text-destructive bg-transparent hover:bg-destructive/[0.07] active:bg-destructive/[0.12]",
        outline:
          "border border-border text-foreground bg-transparent hover:bg-muted hover:border-foreground/20",
        secondary:
          "border border-border text-muted-foreground bg-transparent hover:bg-muted hover:text-foreground",
        ghost:
          "text-foreground bg-transparent hover:bg-muted border border-transparent hover:border-border/50",
        link:
          "text-brand underline-offset-4 hover:underline bg-transparent border-transparent p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-lg px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

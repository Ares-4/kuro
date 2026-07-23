import React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-semibold tracking-[-0.005em] rounded-lg",
    "transition-all duration-250 select-none cursor-pointer",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:scale-[0.97]",
  ].join(' '),
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.65),inset_0_1px_0_rgba(255,255,255,0.15)] hover:bg-blue-700 hover:shadow-[0_18px_36px_-12px_rgba(37,99,235,0.75)] hover:-translate-y-[2px]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/85 hover:-translate-y-[1px]",
        outline:
          "border border-slate-700 bg-transparent text-slate-100 hover:bg-slate-800 hover:border-slate-600 hover:-translate-y-[1px]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        ghost:
          "hover:bg-white/6 hover:text-white text-slate-300",
        link:
          "text-blue-400 underline-offset-4 hover:underline p-0 h-auto font-normal",
        glow:
          "bg-blue-600 text-white shadow-[0_10px_30px_-10px_rgba(37,99,235,0.65),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_0_28px_rgba(37,99,235,0.6)] hover:bg-blue-700 hover:-translate-y-[2px]",
      },
      size: {
        sm:      "h-8 px-3 text-xs rounded-md",
        default: "h-10 px-5 text-sm",
        lg:      "h-11 px-7 text-[15px]",
        xl:      "h-[52px] px-7 text-[15px] rounded-lg",
        icon:    "h-10 w-10",
        "icon-sm": "h-8 w-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }

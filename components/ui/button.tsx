import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white shadow-xl hover:shadow-2xl hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 transition-all duration-300 transform hover:scale-105 font-semibold",
        destructive:
          "bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 text-white shadow-xl hover:shadow-2xl hover:from-red-600 hover:via-rose-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-semibold",
        outline:
          "border-2 border-purple-300 bg-white shadow-lg hover:bg-gradient-to-r hover:from-purple-50 hover:via-pink-50 hover:to-rose-50 hover:border-purple-400 hover:text-purple-700 transition-all duration-300 font-semibold",
        secondary:
          "bg-gradient-to-r from-yellow-100 via-orange-100 to-amber-100 text-orange-700 shadow-lg hover:shadow-xl hover:from-yellow-200 hover:via-orange-200 hover:to-amber-200 transition-all duration-300 font-semibold",
        ghost:
          "hover:bg-gradient-to-r hover:from-purple-50 hover:via-pink-50 hover:to-rose-50 hover:text-purple-700 transition-all duration-300 rounded-lg font-medium",
        link: "text-purple-600 underline-offset-4 hover:underline hover:text-pink-600 transition-colors duration-300 font-semibold",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }

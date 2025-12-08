import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-purple-200 placeholder:text-muted-foreground focus-visible:border-purple-400 focus-visible:ring-purple-200/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-white flex field-sizing-content min-h-20 w-full rounded-lg border-2 px-4 py-3 text-base shadow-md transition-all duration-300 outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm hover:border-purple-300",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }

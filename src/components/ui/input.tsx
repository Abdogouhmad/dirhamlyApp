import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-xl border border-input bg-white/[0.03] px-3.5 py-2 text-base shadow-sm backdrop-blur-md transition-all outline-none placeholder:text-muted-foreground/50 focus:border-cobalt-500/50 focus:ring-4 focus:ring-cobalt-500/10 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.05]",
        className
      )}
      {...props}
    />
  )
}

export { Input }

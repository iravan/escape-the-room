import type { ReactNode } from "react";

// Frosted gallery-wall card with a soft shadow, the look of every HUD panel; compact on short (landscape phone) screens.
export function Panel({ side, children, className = "" }: { side: "left" | "right"; children: ReactNode; className?: string }) {
  return (
    <aside className={`fixed top-2.5 flex max-h-[calc(100dvh-1.25rem)] flex-col gap-2 overflow-y-auto rounded-lg border border-border bg-background/90 p-3 text-sm text-foreground shadow-[0_8px_30px_-10px_rgba(0,0,0,0.35)] backdrop-blur ${side === "left" ? "left-2.5 w-56" : "right-2.5 w-80"} [@media(max-height:500px)]:gap-1 [@media(max-height:500px)]:p-2 [@media(max-height:500px)]:text-xs [@media(max-height:500px)]:[&_button]:h-6 [@media(max-height:500px)]:[&_button]:px-0.5 [@media(max-height:500px)]:[&_button]:text-[11px] ${side === "left" ? "[@media(max-height:500px)]:w-44" : "[@media(max-height:500px)]:w-60"} ${className}`}>
      {children}
    </aside>
  );
}

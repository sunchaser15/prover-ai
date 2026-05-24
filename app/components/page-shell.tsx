import type { ReactNode } from "react";
import { PlasmaBackground } from "./plasma-background";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020302] text-white selection:bg-[#5E0ED7] selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#020302]" />
      <div className="pointer-events-none fixed inset-0 z-[1] opacity-65">
        <PlasmaBackground />
      </div>
      <div className="pointer-events-none fixed inset-0 z-[2] bg-[linear-gradient(90deg,rgba(0,0,0,0.88),rgba(0,0,0,0.42),rgba(0,0,0,0.74))]" />
      <SiteHeader />
      <div className="relative z-10 px-5 pb-20 pt-32 md:px-8 lg:pt-36">
        {children}
      </div>
      <SiteFooter />
    </main>
  );
}

"use client";

import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { useInView } from "@/hooks/use-in-view";
import Link from "next/link";

function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [ref, inView] = useInView({ threshold: 0.1 });

  return (
    <div
      ref={ref}
      className={`${className} ${inView ? "section-visible" : "section-hidden"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden page-surface text-foreground">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 -left-24 h-72 w-72 rounded-full bg-[#ffd2a1]/60 blur-3xl motion-safe:animate-[float_18s_ease-in-out_infinite]" />
        <div className="absolute top-10 right-0 h-80 w-80 rounded-full bg-[#b3f0ff]/60 blur-3xl motion-safe:animate-[float_22s_ease-in-out_infinite]" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-[#c2f2e3]/40 blur-3xl motion-safe:animate-[float_20s_ease-in-out_infinite]" />
        <div className="absolute inset-0 hero-grid" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-5 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{SITE_NAME}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">AI Page Studio</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="#how" className="transition-colors hover:text-foreground">How it works</Link>
            <Link href="#features" className="transition-colors hover:text-foreground">Features</Link>
            <Link href="#showcase" className="transition-colors hover:text-foreground">Showcase</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </header>

        <main className="flex-1">
          <section className="mx-auto w-full max-w-6xl px-6 pb-12 pt-10 lg:px-12 lg:pt-20">
            <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-8">
                <div
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs uppercase tracking-[0.3em] text-muted-foreground shadow-sm backdrop-blur opacity-0 motion-safe:animate-[reveal_0.8s_ease-out_forwards]"
                  style={{ animationDelay: "0ms" }}
                >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Launch-ready landing pages
                </div>

                <div
                  className="space-y-4 opacity-0 motion-safe:animate-[reveal_0.8s_ease-out_forwards]"
                  style={{ animationDelay: "120ms" }}
                >
                  <h1 className="font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
                    <span className="block">Prompt to polished</span>
                    <span className="block text-gradient">landing pages.</span>
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {SITE_DESCRIPTION} Give PageCraft a goal, tone, and sections. It returns responsive HTML,
                    you refine with follow-up prompts, then publish to a shareable link with view analytics.
                  </p>
                </div>

                <div
                  className="flex flex-wrap items-center gap-3 opacity-0 motion-safe:animate-[reveal_0.8s_ease-out_forwards]"
                  style={{ animationDelay: "240ms" }}
                >
                  <Link href="/signup">
                    <Button size="lg" className="rounded-full px-8">Start creating</Button>
                  </Link>
                  <Link href="#showcase">
                    <Button variant="outline" size="lg" className="rounded-full px-8">See examples</Button>
                  </Link>
                </div>

                <div
                  className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground opacity-0 motion-safe:animate-[reveal_0.8s_ease-out_forwards]"
                  style={{ animationDelay: "320ms" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Live preview
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Theme library
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Shareable links
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    View analytics
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -right-8 -top-6 h-24 w-24 rounded-2xl bg-[#fff0cc] shadow-lg motion-safe:animate-[float_16s_ease-in-out_infinite]" />
                <div className="absolute -left-6 -bottom-8 h-20 w-20 rounded-full bg-[#c2f2e3] shadow-lg motion-safe:animate-[float_14s_ease-in-out_infinite]" />

                <div className="relative rounded-3xl border border-border/70 bg-card/80 p-6 shadow-2xl backdrop-blur">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    <span>AI Composer</span>
                    <span className="rounded-full bg-accent px-2 py-1 text-[10px] text-accent-foreground">Live</span>
                  </div>

                  <div className="mt-5 space-y-4">
                    <div className="rounded-2xl border border-border/70 bg-background/80 p-4">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Prompt</p>
                      <p className="mt-3 text-sm text-foreground">
                        Design a bold landing page for a boutique coffee studio. Warm tones, editorial hero,
                        and a clear booking call-to-action.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border/70 bg-muted/60 p-4">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Generated</p>
                        <div className="mt-3 space-y-2">
                          <div className="h-2 w-24 rounded bg-foreground/20" />
                          <div className="h-2 w-36 rounded bg-foreground/15" />
                          <div className="h-2 w-28 rounded bg-foreground/20" />
                          <div className="h-2 w-32 rounded bg-foreground/10" />
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-background">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 6h16" />
                              <path d="M4 12h16" />
                              <path d="M4 18h10" />
                            </svg>
                          </span>
                          Clean HTML, no lock-in
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border/70 bg-background/90 p-4">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Preview</p>
                        <div className="mt-3 rounded-xl border border-border/60 bg-gradient-to-br from-[#fff3d9] via-white to-[#e9fbf7] p-3">
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                            <span>EMBER STUDIO</span>
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">Book</span>
                          </div>
                          <div className="mt-3 space-y-2">
                            <div className="h-4 w-32 rounded bg-foreground/20" />
                            <div className="h-2 w-full rounded bg-foreground/10" />
                            <div className="h-2 w-4/5 rounded bg-foreground/10" />
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-2">
                            <div className="h-10 rounded-lg bg-[#ffd9a8]/70" />
                            <div className="h-10 rounded-lg bg-[#c8f0e3]/70" />
                            <div className="h-10 rounded-lg bg-[#bfe6ff]/70" />
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="h-2 w-2 rounded-full bg-[#1fbf9b]" />
                          Responsive by default
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <AnimatedSection className="mx-auto w-full max-w-6xl px-6 py-14 lg:px-12">
            <section id="how">
              <div className="flex flex-col gap-3">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">How it works</p>
                <h2 className="font-display text-3xl sm:text-4xl">From prompt to publish in three steps.</h2>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-3">
                <div className="step-connector rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm card-hover">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                    1
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Describe the vibe</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Share the goal, sections, and tone. Add brand colors or pick a theme to guide the layout.
                  </p>
                </div>
                <div className="step-connector rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm card-hover">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                    2
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Refine in real-time</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Iterate with follow-up prompts, inspect the preview, and jump into the code view when needed.
                  </p>
                </div>
                <div className="step-connector rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm card-hover">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                    3
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Publish and share</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Deploy to a clean URL, then track page views and update the content whenever you want.
                  </p>
                </div>
              </div>
            </section>
          </AnimatedSection>

          <AnimatedSection className="mx-auto w-full max-w-6xl px-6 py-14 lg:px-12">
            <section id="features">
              <div className="flex flex-col gap-3">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Features</p>
                <h2 className="font-display text-3xl sm:text-4xl">Everything you need to ship fast.</h2>
              </div>
              <div className="mt-8 grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm card-hover">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground icon-hover">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">Live preview + code view</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Toggle between a full preview and the generated HTML to keep creative control.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm card-hover">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground icon-hover">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20l9-5-9-5-9 5 9 5z" />
                        <path d="M12 12l9-5-9-5-9 5 9 5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">Theme library</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Save brand palettes, typography, and layouts so every page stays on brand.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm card-hover">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground icon-hover">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">Publish to /p/slug</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Deploy in minutes and share a clean link that updates whenever you republish.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm card-hover">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground icon-hover">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v18h18" />
                        <path d="M18 9l-5 5-4-4-3 3" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold">Built-in analytics</h3>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Track page views and understand what is resonating before you double down.
                  </p>
                </div>
              </div>
            </section>
          </AnimatedSection>

          <AnimatedSection className="mx-auto w-full max-w-6xl px-6 py-14 lg:px-12">
            <section id="showcase">
              <div className="flex flex-col gap-3">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Showcase</p>
                <h2 className="font-display text-3xl sm:text-4xl">A few styles you can spin up fast.</h2>
              </div>
              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm card-hover">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Brand launch</span>
                    <span className="rounded-full border border-border/60 px-2 py-1">Landing</span>
                  </div>
                  <h3 className="mt-4 font-display text-xl">Aurora Coffee</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Warm editorial layout with bold product callouts and a focused booking section.
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="h-12 rounded-lg bg-[#ffd9a8]/70" />
                    <div className="h-12 rounded-lg bg-[#ffe9c8]/70" />
                    <div className="h-12 rounded-lg bg-[#c8f0e3]/70" />
                  </div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm card-hover">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Product studio</span>
                    <span className="rounded-full border border-border/60 px-2 py-1">SaaS</span>
                  </div>
                  <h3 className="mt-4 font-display text-xl">Orbit Analytics</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Clean grids, fast scannability, and a punchy CTA that converts without clutter.
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="h-12 rounded-lg bg-[#bfe6ff]/70" />
                    <div className="h-12 rounded-lg bg-[#d9f1ff]/70" />
                    <div className="h-12 rounded-lg bg-[#ffd2a1]/60" />
                  </div>
                </div>
                <div className="rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm card-hover">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    <span>Event</span>
                    <span className="rounded-full border border-border/60 px-2 py-1">Conference</span>
                  </div>
                  <h3 className="mt-4 font-display text-xl">Northwind Summit</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    High-energy event layout with speaker highlights, schedule blocks, and ticket CTA.
                  </p>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="h-12 rounded-lg bg-[#c2f2e3]/70" />
                    <div className="h-12 rounded-lg bg-[#e7fbf7]/70" />
                    <div className="h-12 rounded-lg bg-[#ffe0b8]/70" />
                  </div>
                </div>
              </div>
            </section>
          </AnimatedSection>

          <AnimatedSection className="mx-auto w-full max-w-6xl px-6 pb-20 pt-8 lg:px-12">
            <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-foreground px-8 py-10 text-background shadow-xl">
              <div aria-hidden="true" className="absolute inset-0">
                <div className="absolute -top-16 -left-10 h-48 w-48 rounded-full bg-[#ff8b5c]/30 blur-3xl motion-safe:animate-[float_18s_ease-in-out_infinite]" />
                <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-[#1fbf9b]/25 blur-3xl motion-safe:animate-[float_22s_ease-in-out_infinite]" />
              </div>
              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-background/70">Ready to ship</p>
                  <h2 className="mt-3 font-display text-3xl sm:text-4xl">Build the page before the meeting ends.</h2>
                  <p className="mt-2 text-sm text-background/70">
                    Start with a prompt, refine in minutes, and publish the link while the idea is still hot.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/signup">
                    <Button size="lg" className="rounded-full bg-background px-8 text-foreground hover:bg-background/90">
                      Start creating
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="rounded-full border-background/50 bg-transparent px-8 text-background hover:bg-background/10"
                    >
                      Sign in
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </main>

        <footer className="border-t border-border/60 px-6 py-8 text-sm text-muted-foreground lg:px-12">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <span>Built with Next.js and Supabase.</span>
            <div className="flex items-center gap-4">
              <Link href="/login" className="transition-colors hover:text-foreground">Sign in</Link>
              <Link href="/signup" className="transition-colors hover:text-foreground">Get started</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

import { Dashboard } from "@/components/dashboard";
import { Playground } from "@/components/playground";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-dvh">
      <header className="border-border/80 sticky top-0 z-20 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex min-w-0 flex-col">
            <p className="text-muted-foreground font-mono text-[11px] tracking-[0.22em] uppercase">
              specimen
            </p>
            <p className="truncate text-sm font-medium tracking-tight">
              @therealtinhtute/ui
            </p>
          </div>
          <nav className="text-muted-foreground hidden items-center gap-5 text-sm sm:flex">
            <a href="#primitives" className="hover:text-foreground">
              Primitives
            </a>
            <a href="#patterns" className="hover:text-foreground">
              Patterns
            </a>
            <a href="#block" className="hover:text-foreground">
              Block
            </a>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-12">
        <section className="flex max-w-2xl flex-col gap-3">
          <h1 className="text-3xl font-medium tracking-tight text-pretty sm:text-4xl">
            Live consumer of the local registry.
          </h1>
          <p className="text-muted-foreground text-base text-pretty">
            This app installs items the same way a real project would:{" "}
            <code className="font-mono text-sm">shadcn add @therealtinhtute/…</code>
          </p>
        </section>

        <Playground />

        <section id="block" className="flex flex-col gap-8">
          <div className="flex flex-col gap-1">
            <p className="text-muted-foreground font-mono text-xs tracking-[0.18em] uppercase">
              block
            </p>
            <h2 className="text-xl font-medium tracking-tight">Dashboard</h2>
          </div>
          <div className="overflow-hidden rounded-xl border">
            <Dashboard />
          </div>
        </section>
      </main>
    </div>
  );
}

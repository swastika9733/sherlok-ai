"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

type SherlokUser = {
  name: string;
  gender: string;
  companion: string;
};

/*
 * Cache the localStorage value.
 * This prevents React's "getSnapshot should be cached" error.
 */
let cachedStorageValue: string | null = null;
let cachedUser: SherlokUser | null = null;

function getUserSnapshot(): SherlokUser | null {
  const storageValue = localStorage.getItem("sherlokUser");

  // Nothing changed, so return the same object.
  if (storageValue === cachedStorageValue) {
    return cachedUser;
  }

  cachedStorageValue = storageValue;

  if (!storageValue) {
    cachedUser = null;
    return cachedUser;
  }

  try {
    cachedUser = JSON.parse(storageValue) as SherlokUser;
    return cachedUser;
  } catch {
    localStorage.removeItem("sherlokUser");
    cachedStorageValue = null;
    cachedUser = null;
    return null;
  }
}

/*
 * Server cannot access localStorage.
 */
function getServerSnapshot(): SherlokUser | null {
  return null;
}

/*
 * Listen for localStorage changes.
 */
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

export default function Dashboard() {
  const router = useRouter();
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const user = useSyncExternalStore(
    subscribe,
    getUserSnapshot,
    getServerSnapshot
  );

  /*
   * Redirect only after rendering.
   */
  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);

  /*
   * Loading screen while checking the user.
   */
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="text-5xl">🕵️</div>

          <p className="mt-4 text-slate-400">
            Loading Sherlok AI...
          </p>
        </div>
      </main>
    );
  }

  const companionEmoji =
    user.companion === "Kiki"
      ? "🩶"
      : user.companion === "Abhi"
        ? "💙"
        : user.companion === "Ren"
          ? "🧠"
          : user.companion === "Siya"
            ? "🎨"
            : "🕵️";

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">

      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/5 blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10 text-2xl">
              🕵️
            </div>

            <div>
              <h1 className="font-bold tracking-wide">
                Sherlok AI
              </h1>

              <p className="text-xs text-slate-400">
                Think • Create • Solve
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user.name}
              </p>

              <p className="text-xs text-slate-400">
                {user.companion} companion
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10">
              👤
            </div>

          </div>

        </div>
      </nav>

      {/* Main */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 py-10">

        {/* Welcome */}
        <section className="mb-10">

          <p className="text-sm font-medium uppercase tracking-[0.25em] text-cyan-400">
            Your workspace
          </p>

          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Welcome back, {user.name} 👋
          </h2>

          <p className="mt-3 max-w-2xl text-slate-400">
            Your Sherlok workspace is ready. What would you like
            to work on today?
          </p>

        </section>

        {/* Companion */}
        <section className="mb-10 rounded-3xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm text-slate-400">
                Your Sherlok companion
              </p>

              <h3 className="mt-1 text-2xl font-bold">
                {user.companion}
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                Ready to help you think, learn and create.
              </p>
            </div>

            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-4xl">
              {companionEmoji}
            </div>

          </div>

        </section>

        {/* Primary companion action */}
        <section className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/[0.12] via-white/[0.05] to-blue-600/[0.08] p-6 shadow-2xl shadow-cyan-950/20 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
                Your companion is listening
              </p>

              <h3 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Talk to {user.companion}.
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                Ask anything, share an idea, revise a topic or save a thought.
                Sherlok will understand what you need.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/chat")}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02] hover:shadow-cyan-500/40 sm:w-auto"
            >
              Start talking →
            </button>
          </div>
        </section>

        {/* Secondary tools */}
        <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold">Need a starting point?</h3>
            <p className="mt-1 text-sm text-slate-400">
              Open a focused prompt only when you want one.
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsToolsOpen((open) => !open)}
              aria-expanded={isToolsOpen}
              className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-slate-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
            >
              + Tools
            </button>

            {isToolsOpen && (
              <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl">
                {[
                  ["📚", "Study"],
                  ["✨", "Create"],
                  ["📝", "Note"],
                ].map(([icon, label]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => router.push("/chat")}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Student Banner */}
        <section className="mt-10 rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] p-5">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="font-semibold">
                🎓 Sherlok AI for Students
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Built to help students learn, create and solve —
                completely free for students.
              </p>
            </div>

            <span className="w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-300">
              STUDENT FREE
            </span>

          </div>

        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-white/10 pt-6 text-center">

          <p className="text-xs text-slate-500">
            Sherlok AI • Think • Create • Solve
          </p>

        </footer>

      </div>
    </main>
  );
}
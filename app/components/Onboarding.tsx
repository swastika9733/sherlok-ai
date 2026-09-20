"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
export default function Onboarding() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [selectedCharacter, setSelectedCharacter] = useState("");

  const handleContinue = () => {
  if (!name || !gender || !selectedCharacter) {
    alert("Please fill in all the details.");
    return;
  }

  // Save the user's onboarding information
  localStorage.setItem(
    "sherlokUser",
    JSON.stringify({
      name,
      gender,
      companion: selectedCharacter,
    })
  );

  // Go to the Sherlok dashboard
  router.push("/dashboard");
};
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10">
      
      {/* Background Glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-5rem)] items-center justify-center">

        {/* Glass Card */}
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl backdrop-blur-xl sm:p-10">

          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Image
              src="/logo/sherlok-logo.png"
              alt="Sherlok AI Logo"
              width={90}
              height={90}
              priority
              className="object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.25)]"
            />
          </div>

          {/* Heading */}
          <div className="text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-[0.3em] text-cyan-400">
              Sherlok AI
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Welcome to Sherlok
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-300">
              Your intelligent workspace for thinking, creating, learning,
              and solving problems together.
            </p>
          </div>

          {/* Name */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-white">
              What should we call you?
            </label>

            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:bg-white/15 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>

          {/* Gender */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-white">
              Choose your gender
            </label>

            <div className="mt-3 grid grid-cols-2 gap-3">

              {/* Male */}
              <button
                type="button"
                onClick={() => setGender("male")}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  gender === "male"
                    ? "border-blue-400 bg-blue-400/20 text-white shadow-lg shadow-blue-500/10"
                    : "border-white/15 bg-white/5 text-slate-300 hover:border-blue-400/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                👨 Male
              </button>

              {/* Female */}
              <button
                type="button"
                onClick={() => setGender("female")}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  gender === "female"
                    ? "border-pink-400 bg-pink-400/20 text-white shadow-lg shadow-pink-500/10"
                    : "border-white/15 bg-white/5 text-slate-300 hover:border-pink-400/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                👩 Female
              </button>

            </div>
          </div>

          {/* Character Selection */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-white">
              Choose your Sherlok companion
            </label>

            <p className="mt-1 text-xs text-slate-400">
              Pick the personality that fits the way you want to work.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-3">

              {/* Kiki */}
              <button
                type="button"
                onClick={() => setSelectedCharacter("Kiki")}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedCharacter === "Kiki"
                    ? "border-cyan-400 bg-cyan-400/15 shadow-lg shadow-cyan-500/10"
                    : "border-white/15 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10"
                }`}
              >
                <div className="text-lg">🩶</div>

                <div className="mt-2 font-semibold text-white">
                  Kiki
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  Organized & Supportive
                </div>
              </button>

              {/* Abhi */}
              <button
                type="button"
                onClick={() => setSelectedCharacter("Abhi")}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedCharacter === "Abhi"
                    ? "border-blue-400 bg-blue-400/15 shadow-lg shadow-blue-500/10"
                    : "border-white/15 bg-white/5 hover:border-blue-400/50 hover:bg-white/10"
                }`}
              >
                <div className="text-lg">💙</div>

                <div className="mt-2 font-semibold text-white">
                  Abhi
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  Motivator & Leader
                </div>
              </button>

              {/* Ren */}
              <button
                type="button"
                onClick={() => setSelectedCharacter("Ren")}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedCharacter === "Ren"
                    ? "border-cyan-400 bg-cyan-400/15 shadow-lg shadow-cyan-500/10"
                    : "border-white/15 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10"
                }`}
              >
                <div className="text-lg">🧠</div>

                <div className="mt-2 font-semibold text-white">
                  Ren
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  Logic & Technology
                </div>
              </button>

              {/* Siya */}
              <button
                type="button"
                onClick={() => setSelectedCharacter("Siya")}
                className={`rounded-xl border p-4 text-left transition ${
                  selectedCharacter === "Siya"
                    ? "border-pink-400 bg-pink-400/15 shadow-lg shadow-pink-500/10"
                    : "border-white/15 bg-white/5 hover:border-pink-400/50 hover:bg-white/10"
                }`}
              >
                <div className="text-lg">🎨</div>

                <div className="mt-2 font-semibold text-white">
                  Siya
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  Creative & Artistic
                </div>
              </button>

            </div>
          </div>

          {/* Continue Button */}
          <button
            type="button"
            onClick={handleContinue}
            className="mt-8 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.01] hover:shadow-cyan-500/40 active:scale-[0.99]"
          >
            Continue →
          </button>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-500">
            Think • Create • Solve
          </p>

        </div>
      </div>
    </main>
  );
}
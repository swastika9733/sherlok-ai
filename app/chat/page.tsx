"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addMemory, getMemories } from "../memory/store";
import VoiceControls from "./components/VoiceControls";
type Message = {
  id: number;
  sender: "user" | "sherlok";
  text: string;
};

const companions = {
  Kiki: {
    emoji: "🩶",
    title: "Kiki",
    role: "Organized & Supportive",
  },

  Abhi: {
    emoji: "💙",
    title: "Abhi",
    role: "Motivator & Leader",
  },

  Ren: {
    emoji: "🧠",
    title: "Ren",
    role: "Logic & Technology",
  },

  Siya: {
    emoji: "🎨",
    title: "Siya",
    role: "Creative & Artistic",
  },
};

export default function ChatPage() {
  const router = useRouter();

  const [selectedCompanion, setSelectedCompanion] =
    useState<keyof typeof companions>("Kiki");

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  const [isThinking, setIsThinking] = useState(false);

  const [latestReply, setLatestReply] = useState<{
    id: number;
    text: string;
  } | null>(null);

  const [isToolsOpen, setIsToolsOpen] = useState(false);

  const companion = companions[selectedCompanion];

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isThinking) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: trimmedMessage,
    };
    const updatedMessages = [...messages, userMessage];
    const memories = getMemories();

const memoryContext =
  memories.length > 0
    ? memories
        .map((memory) => `- ${memory.text}`)
        .join("\n")
    : "No saved memories yet.";

    setMessages(updatedMessages);
    setMessage("");
    setIsThinking(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          companion: selectedCompanion,
           memoryContext,
        }),
      });

      const responseText = await response.text();

let data: {
  reply?: string;
  error?: string;
  memoriesToSave?: unknown;
} = {};

if (responseText) {
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(
      `Server returned an invalid response (${response.status}).`
    );
  }
}

if (!response.ok) {
  throw new Error(
    data.error || `Server error (${response.status}).`
  );
}

if (!data.reply) {
  throw new Error("Sherlok returned an empty response.");
}

      if (Array.isArray(data.memoriesToSave)) {
        data.memoriesToSave.forEach((memory) => {
          if (typeof memory === "string" && memory.trim()) {
            addMemory(memory);
          }
        });
      }

      const sherlockMessage: Message = {
        id: Date.now() + 1,
        sender: "sherlok",
        text: data.reply,
      };

      setLatestReply({
        id: sherlockMessage.id,
        text: sherlockMessage.text,
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        sherlockMessage,
      ]);
    } catch (error) {
      console.error(error);

      const errorMessage: Message = {
        id: Date.now() + 1,
        sender: "sherlok",
        text:
          "Hmm, something went wrong 😕 Please try sending that again.",
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        errorMessage,
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setMessage(prompt);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-white">

      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-3xl" />

        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-white/10 bg-white/[0.03] backdrop-blur-xl">

        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3 sm:px-5 sm:py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-2xl">
              🕵️
            </div>

            <div>
              <h1 className="font-bold tracking-tight">
                Sherlok AI
              </h1>

              <p className="text-[11px] text-slate-400">
                Your AI Companion
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white sm:px-4 sm:text-sm"
          >
            ← Dashboard
          </button>

        </div>

      </header>

      {/* Main */}
      <section className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col px-3 py-3 sm:px-4 sm:py-6">

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl backdrop-blur-xl">

          {/* Companion Header */}
          <div className="border-b border-white/10 px-4 py-3 sm:px-5 sm:py-4">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-2xl">
                  {companion.emoji}
                </div>

                <div>

                  <h2 className="text-sm font-semibold sm:text-base">
                    {companion.title}
                  </h2>

                  <div className="mt-1 flex items-center gap-2">

                    <span className="h-2 w-2 rounded-full bg-green-400 shadow-sm shadow-green-400" />

                    <span className="text-[11px] text-slate-400">
                      {companion.role}
                    </span>

                  </div>

                </div>

              </div>

              <span className="hidden text-xs text-slate-500 sm:block">
                Online
              </span>

            </div>

          </div>

          {/* Messages */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">

            {messages.length === 0 ? (

              <div className="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">

                <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-[2rem] border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 text-5xl shadow-2xl shadow-cyan-500/10">
                  {companion.emoji}
                </div>

                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Hey, I&apos;m {companion.title} {companion.emoji}
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-slate-400">
                  What&apos;s on your mind? Talk naturally and I&apos;ll help you
                  study, create, solve or remember what matters.
                </p>

                {/* Quick prompts */}
                <div className="mt-7 grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">

                  <button
                    onClick={() =>
                      handleQuickPrompt(
                        "Hey, I have something to tell you 👀"
                      )
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-sm text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:text-white"
                  >
                    <span className="text-lg">☕</span>
                    <span className="ml-3">
                      I have some tea 👀
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      handleQuickPrompt(
                        "I'm feeling a little sad today."
                      )
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-sm text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:text-white"
                  >
                    <span className="text-lg">🥺</span>
                    <span className="ml-3">
                      I need to talk
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      handleQuickPrompt(
                        "Help me plan my studies 📚"
                      )
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-sm text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:text-white"
                  >
                    <span className="text-lg">📚</span>
                    <span className="ml-3">
                      Help me study
                    </span>
                  </button>

                  <button
                    onClick={() =>
                      handleQuickPrompt(
                        "I have an idea for a project 💻"
                      )
                    }
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-sm text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/5 hover:text-white"
                  >
                    <span className="text-lg">💻</span>
                    <span className="ml-3">
                      Talk about my project
                    </span>
                  </button>

                </div>

              </div>

            ) : (

              <div className="space-y-5 p-4 sm:p-7">

                {messages.map((item) => (

                  <div
                    key={item.id}
                    className={`flex ${
                      item.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >

                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 sm:max-w-[70%] ${
                        item.sender === "user"
                          ? "rounded-br-md bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/10"
                          : "rounded-bl-md border border-white/10 bg-white/[0.07] text-slate-200"
                      }`}
                    >
                      {item.text}
                    </div>

                  </div>

                ))}

                {/* Thinking */}
                {isThinking && (
                  <div className="flex justify-start">

                    <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.07] px-5 py-3">

                      <div className="flex items-center gap-1">

                        <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />

                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"
                          style={{ animationDelay: "150ms" }}
                        />

                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-cyan-400"
                          style={{ animationDelay: "300ms" }}
                        />

                      </div>

                    </div>

                  </div>
                )}

              </div>

            )}

          </div>

          {/* Companion selector */}
          <div className="border-t border-white/10 px-3 py-3 sm:px-4">

            <div className="mb-3 flex items-center justify-between gap-2">

              <div className="flex gap-2 overflow-x-auto pb-1">

                {(Object.keys(companions) as Array<
                  keyof typeof companions
                >).map((name) => (

                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedCompanion(name)}
                    className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs transition ${
                      selectedCompanion === name
                        ? "border-cyan-400/40 bg-cyan-400/10 text-white"
                        : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <span>{companions[name].emoji}</span>
                    <span>{name}</span>
                  </button>

                ))}

              </div>

              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsToolsOpen((open) => !open)}
                  aria-expanded={isToolsOpen}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-white"
                >
                  + Tools
                </button>

                {isToolsOpen && (
                  <div className="absolute right-0 top-full z-20 mt-2 w-44 rounded-2xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl">
                    {[
                      ["📚", "Study", "Help me revise a topic"],
                      ["✨", "Create", "Help me create something"],
                      ["📝", "Note", "Help me organize a note"],
                    ].map(([icon, label, prompt]) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setMessage(prompt);
                          setIsToolsOpen(false);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        <span>{icon}</span>
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Input */}
            <div className="flex items-end gap-2 sm:gap-3">

              <VoiceControls
                companion={selectedCompanion}
                latestReply={latestReply}
                onTranscript={setMessage}
              />

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isThinking}
                placeholder={`Talk to ${companion.title} or type anything...`}
                className="max-h-32 min-h-12 flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-400/50 focus:bg-white/[0.08] disabled:opacity-50"
              />

              <button
                type="button"
                onClick={sendMessage}
                disabled={!message.trim() || isThinking}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-xl shadow-lg shadow-cyan-500/20 transition hover:scale-105 hover:shadow-cyan-500/40 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Send message"
              >
                ➤
              </button>

            </div>

            <p className="mt-2 text-center text-[10px] text-slate-600">
              Enter to send • Shift + Enter for a new line
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}
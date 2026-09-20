"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type CompanionName = "Kiki" | "Abhi" | "Ren" | "Siya";

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type VoiceControlsProps = {
  companion: CompanionName;
  latestReply: { id: number; text: string } | null;
  onTranscript: (text: string) => void;
};

const preferredVoiceNames: Record<CompanionName, string[]> = {
  Kiki: ["Samantha", "Google UK English Female", "Microsoft Zira"],
  Abhi: ["Google UK English Male", "Microsoft David", "Alex"],
  Ren: ["Daniel", "Google US English", "Microsoft Guy Online"],
  Siya: ["Karen", "Google UK English Female", "Microsoft Hazel"],
};

const subscribeToBrowserCapabilities = () => () => {};

const getSpeechRecognitionAvailability = () =>
  Boolean(
    typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)
  );

const getSpeechSynthesisAvailability = () =>
  Boolean(typeof window !== "undefined" && window.speechSynthesis);

const getServerCapabilitySnapshot = () => false;

export default function VoiceControls({
  companion,
  latestReply,
  onTranscript,
}: VoiceControlsProps) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const spokenReplyIdRef = useRef<number | null>(null);
  const isListeningRef = useRef(false);
  const retryTimeoutRef = useRef<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceMessage, setVoiceMessage] = useState("");
  const speechRecognitionAvailable = useSyncExternalStore(
    subscribeToBrowserCapabilities,
    getSpeechRecognitionAvailability,
    getServerCapabilitySnapshot
  );
  const speechSynthesisAvailable = useSyncExternalStore(
    subscribeToBrowserCapabilities,
    getSpeechSynthesisAvailability,
    getServerCapabilitySnapshot
  );

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        window.clearTimeout(retryTimeoutRef.current);
      }
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (
      !latestReply ||
      !voiceEnabled ||
      spokenReplyIdRef.current === latestReply.id ||
      !window.speechSynthesis
    ) {
      return;
    }

    spokenReplyIdRef.current = latestReply.id;
    recognitionRef.current?.stop();

    const utterance = new SpeechSynthesisUtterance(latestReply.text);
    const availableVoices = window.speechSynthesis.getVoices();
    const preferredNames = preferredVoiceNames[companion];
    const preferredVoice = availableVoices.find((voice) =>
      preferredNames.some((name) => voice.name.includes(name))
    );

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setVoiceMessage("Sherlok could not speak that reply.");
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [companion, latestReply, voiceEnabled]);

  const stopListening = () => {
    if (retryTimeoutRef.current) {
      window.clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    isListeningRef.current = false;
    setIsListening(false);
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
    }

    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!Recognition) {
      setVoiceMessage(
        "Voice input isn't supported in this browser. You can still type normally."
      );
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    const startRecognition = () => {
      if (!isListeningRef.current) {
        return;
      }

      try {
        recognition.start();
      } catch {
        if (isListeningRef.current) {
          retryTimeoutRef.current = window.setTimeout(() => {
            if (isListeningRef.current) {
              startRecognition();
            }
          }, 300);
        }
      }
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result?.[0]?.transcript?.trim() ?? "")
        .filter(Boolean)
        .join(" ")
        .trim();

      if (transcript) {
        onTranscript(transcript);
        setVoiceMessage("Transcript ready to review.");
      } else {
        setVoiceMessage("I didn't hear anything. Try again when you're ready.");
      }
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        isListeningRef.current = false;
        setIsListening(false);
        setVoiceMessage(
          "Microphone permission was denied. You can still type normally."
        );
        return;
      }

      if (event.error === "no-speech") {
        setVoiceMessage("I didn’t catch that. Try again.");
        return;
      }

      if (event.error === "audio-capture") {
        isListeningRef.current = false;
        setIsListening(false);
        setVoiceMessage("Microphone access is unavailable. Please check your settings.");
        return;
      }

      if (isListeningRef.current) {
        setVoiceMessage("Voice input is reconnecting...");
        retryTimeoutRef.current = window.setTimeout(() => {
          if (isListeningRef.current) {
            startRecognition();
          }
        }, 400);
      }
    };
    recognition.onend = () => {
      if (!isListeningRef.current) {
        setIsListening(false);
        return;
      }

      retryTimeoutRef.current = window.setTimeout(() => {
        if (isListeningRef.current) {
          startRecognition();
        }
      }, 300);
    };

    recognitionRef.current = recognition;
    isListeningRef.current = true;
    setVoiceMessage("");
    setIsListening(true);
    startRecognition();
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  const toggleSpeech = () => {
    if (voiceEnabled) {
      stopSpeaking();
    }

    setVoiceEnabled((enabled) => !enabled);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggleListening}
        className={`flex h-12 items-center gap-2 rounded-2xl border px-3 text-sm transition sm:px-4 ${
          isListening
            ? "border-red-400/50 bg-red-400/10 text-red-200"
            : "border-white/10 bg-white/[0.06] text-slate-300 hover:border-cyan-400/40 hover:text-white"
        }`}
        aria-label={isListening ? "Stop listening" : "Start voice input"}
        title={
          speechRecognitionAvailable
            ? "Use voice input"
            : "Voice input availability will be checked when pressed"
        }
      >
        <span>{isListening ? "⏹" : "🎤"}</span>
        <span className="hidden sm:inline">
          {isListening ? "Listening..." : "Speak"}
        </span>
      </button>

      <button
        type="button"
        onClick={toggleSpeech}
        disabled={!speechSynthesisAvailable}
        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-lg text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
        aria-label={voiceEnabled ? "Disable spoken replies" : "Enable spoken replies"}
        title={voiceEnabled ? "Disable spoken replies" : "Enable spoken replies"}
      >
        {voiceEnabled ? "🔊" : "🔇"}
      </button>

      {isSpeaking && voiceEnabled && (
        <button
          type="button"
          onClick={stopSpeaking}
          className="h-12 rounded-2xl border border-white/10 bg-white/[0.06] px-3 text-xs text-slate-300 transition hover:border-cyan-400/40 hover:text-white"
        >
          Stop speaking
        </button>
      )}

      {(isListening || voiceMessage || !speechSynthesisAvailable) && (
        <span className="basis-full text-[10px] text-slate-500 sm:basis-auto">
          {isListening
            ? "Listening..."
            : voiceMessage || "Spoken replies aren't supported in this browser."}
        </span>
      )}
    </div>
  );
}
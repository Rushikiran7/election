"use client";
import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2, MessageSquare, Send, X } from "lucide-react";
import { sendVoiceCommand } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "ai";
  text: string;
}

export default function VoiceAssistant() {
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "Hi! I'm your Tamil Nadu Election Assistant 🗳️ Ask me anything about candidates, EVM usage, or voting day info." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Speech recognition ───────────────────────────────────────────────────
  let recognition: any = null;
  if (typeof window !== "undefined") {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      recognition = new SR();
      recognition.continuous = false;
      recognition.lang = "en-US";
      recognition.interimResults = false;
    }
  }

  const handleAIResponse = async (text: string) => {
    setProcessing(true);
    try {
      const response = await sendVoiceCommand(text);

      if (response.spoken_response) {
        const utterance = new SpeechSynthesisUtterance(response.spoken_response);
        window.speechSynthesis.speak(utterance);
        setMessages((prev) => [...prev, { role: "ai", text: response.spoken_response }]);
      }

      if (response.action === "navigate") {
        const [path, hash] = response.target.split("#");
        router.push(path);
        if (hash) {
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent("movePointer", { detail: { elementId: hash } }));
          }, 1000);
        }
      } else if (response.action === "highlight" || response.action === "scroll") {
        window.dispatchEvent(
          new CustomEvent("movePointer", { detail: { elementId: response.target.replace("#", "") } })
        );
      }
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, I couldn't process that. Please try again." }]);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setListening(false);
      setMessages((prev) => [...prev, { role: "user", text }]);
      if (!chatOpen) setChatOpen(true);
      await handleAIResponse(text);
    };

    recognition.onerror = () => {
      setListening(false);
      setProcessing(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, chatOpen]);

  const toggleListen = () => {
    if (!recognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
    }
  };

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || processing) return;
    setChatInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    await handleAIResponse(text);
  };

  return (
    <>
      {/* ── Chat panel ───────────────────────────────────────────────────── */}
      {chatOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 md:w-96 glass rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-700/60 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-brand-main/20 border-b border-slate-700/50">
            <span className="font-semibold text-brand-light text-sm flex items-center gap-2">
              <MessageSquare size={16} /> Election AI Assistant
            </span>
            <button onClick={() => setChatOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-brand-main text-white rounded-br-none"
                      : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {processing && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700 px-3 py-2 rounded-xl rounded-bl-none flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin text-brand-light" />
                  <span className="text-xs text-slate-400">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-700/50 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Ask anything…"
              className="flex-1 bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-main"
            />
            <button
              onClick={sendChat}
              disabled={processing || !chatInput.trim()}
              className="p-2 bg-brand-main hover:bg-brand-light disabled:opacity-40 rounded-lg transition-colors"
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
      )}

      {/* ── FAB row: Chat + Mic ──────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        {/* Transcript bubble */}
        {transcript && !chatOpen && (
          <div className="glass px-4 py-2 rounded-full text-sm font-medium animate-pulse">
            {transcript}
          </div>
        )}

        {/* Chat button */}
        <button
          onClick={() => setChatOpen((v) => !v)}
          title="Open AI Chat"
          className={`p-4 rounded-full shadow-2xl transition-all duration-300 ${
            chatOpen ? "bg-slate-700 ring-2 ring-brand-main" : "bg-slate-700 hover:bg-slate-600"
          }`}
        >
          <MessageSquare className="text-brand-light" size={24} />
        </button>

        {/* Mic button */}
        <button
          onClick={toggleListen}
          disabled={processing}
          title={listening ? "Stop listening" : "Start voice command"}
          className={`p-4 rounded-full shadow-2xl transition-all duration-300 ${
            listening ? "bg-red-500 animate-pulse" : "bg-brand-main hover:bg-brand-light"
          }`}
        >
          {processing ? (
            <Loader2 className="animate-spin text-white" size={24} />
          ) : listening ? (
            <MicOff className="text-white" size={24} />
          ) : (
            <Mic className="text-white" size={24} />
          )}
        </button>
      </div>
    </>
  );
}

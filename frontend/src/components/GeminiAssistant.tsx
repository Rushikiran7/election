"use client";
import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Send, Sparkles, User, Loader2, Bot } from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
}

const SYSTEM_CONTEXT = `You are a helpful Tamil Nadu 2026 Assembly Election AI Assistant. 
You help voters understand the election process, candidates, political parties (DMK, AIADMK, BJP, INC, NTK, TVK, PMK, VCK), 
alliances, voting procedure, EVM usage, and election results.
Keep answers concise, clear and helpful. Use bullet points for lists. 
If asked about a specific constituency or candidate, provide factual information about Tamil Nadu 2026 elections.
Always respond in the same language the user writes in (English or Tamil).`;

export default function GeminiAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setStarted(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // Build history for multi-turn chat
      const history = newMessages.slice(0, -1).map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const chat = model.startChat({
        history: [
          { role: "user", parts: [{ text: SYSTEM_CONTEXT }] },
          { role: "model", parts: [{ text: "Understood! I'm ready to assist voters with Tamil Nadu 2026 election information." }] },
          ...history,
        ],
      });

      const result = await chat.sendMessage(text);
      const responseText = result.response.text();

      setMessages((prev) => [...prev, { role: "model", text: responseText }]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "⚠️ Sorry, I couldn't connect to Gemini. Please check your API key or try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "Who is contesting in Perambur constituency?",
    "What are the major alliances in Tamil Nadu 2026?",
    "How does the EVM voting machine work?",
    "What is the role of DMK in this election?",
    "Tell me about Vijay's TVK party",
  ];

  return (
    <div className="glass rounded-2xl overflow-hidden border border-slate-700/60" id="ai-assistant">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-brand-main/20 to-orange-900/20 border-b border-orange-700/30 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-main to-brand-dark flex items-center justify-center shadow-lg shadow-orange-900/30">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">TN Election Bot 🗳️</h3>
          <p className="text-xs text-slate-400">Powered by Gemini · Tamil Nadu Election 2026</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400">Live</span>
        </div>
      </div>

      {/* Messages area */}
      <div className="p-4 space-y-4 min-h-[300px] max-h-[420px] overflow-y-auto">
        {/* Welcome / suggestion state */}
        {!started && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={16} className="text-white" />
              </div>
              <div className="glass px-4 py-3 rounded-2xl rounded-tl-none text-sm text-slate-200 leading-relaxed max-w-[85%]">
                👋 Hello! I'm your <span className="text-orange-400 font-semibold">TN Election Bot</span> — your smart guide for the 2026 Tamil Nadu Assembly Elections.
                <br /><br />
                Ask me anything — candidates, parties, alliances, EVM usage, voting day info, results analysis and more!
              </div>
            </div>

            <p className="text-xs text-slate-500 pl-11">Suggested questions:</p>
            <div className="pl-11 flex flex-col gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-left text-xs px-3 py-2 rounded-lg bg-slate-800/70 hover:bg-brand-main/10 border border-slate-700 hover:border-brand-main/50 text-slate-300 hover:text-brand-main transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation messages */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              msg.role === "user"
                ? "bg-slate-700 border border-slate-600"
                : "bg-gradient-to-br from-brand-main to-brand-dark"
            }`}>
              {msg.role === "user"
                ? <User size={15} className="text-slate-300" />
                : <Bot size={15} className="text-white" />
              }
            </div>

            {/* Bubble */}
            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-[82%] whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-gradient-to-br from-brand-main to-brand-dark text-white rounded-tr-none shadow shadow-orange-900/30"
                : "glass border border-orange-700/20 text-slate-200 rounded-tl-none"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-main to-purple-600 flex items-center justify-center shrink-0">
              <Bot size={15} className="text-white" />
            </div>
            <div className="glass border border-orange-700/20 px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-brand-main" />
              <span className="text-sm text-slate-400">TN Election Bot is thinking…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-900/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Ask about candidates, parties, voting process…"
            className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-main/60 transition-all"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-gradient-to-br from-brand-main to-brand-dark hover:from-brand-dark hover:to-orange-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-all duration-200 flex items-center gap-1.5 font-medium text-sm text-white shadow-lg shadow-orange-900/30"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            {!loading && <span className="hidden sm:inline">Send</span>}
          </button>
        </div>
        <p className="text-[10px] text-slate-600 mt-2 text-center">
          TN Election Bot · Powered by Gemini · Tamil Nadu Assembly Election 2026
        </p>
      </div>
    </div>
  );
}

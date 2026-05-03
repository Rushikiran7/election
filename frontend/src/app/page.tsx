"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import CountdownTimer from "@/components/CountdownTimer";
import { LogIn, MapPin, ChevronDown, Search } from "lucide-react";
import { getConstituencies } from "@/lib/api";
import GeminiAssistant from "@/components/GeminiAssistant";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [search, setSearch] = useState("");
  const [constituencies, setConstituencies] = useState<string[]>([]);
  const [filtered, setFiltered] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getConstituencies().then((list) => {
      setConstituencies(list);
      setFiltered(list);
    });
  }, []);

  useEffect(() => {
    if (!search) setFiltered(constituencies);
    else setFiltered(constituencies.filter((c) => c.toLowerCase().includes(search.toLowerCase())));
  }, [search, constituencies]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectArea = (c: string) => {
    setArea(c);
    setSearch(c);
    setShowDropdown(false);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !area) return;
    localStorage.setItem("user", JSON.stringify({ name, area }));
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 gap-10">

      {/* Hero */}
      <div className="text-center max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          Tamil Nadu Assembly Election 2026
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-300 text-transparent bg-clip-text leading-tight">
          Smart Election Assistant
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mx-auto">
          Know your candidates, understand the EVM process, and get AI-powered answers about Tamil Nadu&apos;s 2026 elections.
        </p>
      </div>

      <CountdownTimer />

      {/* Login Card */}
      <div className="glass rounded-2xl p-8 w-full max-w-md border-t-2 border-t-brand-main shadow-xl shadow-orange-900/10" id="login-form">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
          <LogIn className="text-brand-main" size={22} /> Voter Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-main transition-all hover:border-slate-600"
              placeholder="e.g. Rajinikanth"
              required
            />
          </div>

          {/* Area / Constituency — dropdown opens UPWARD to avoid pushing content down */}
          <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <MapPin size={15} className="text-brand-main" /> Your Constituency / Area
            </label>

            {/* Trigger */}
            <div
              ref={triggerRef}
              onClick={() => setShowDropdown((v) => !v)}
              className={`w-full bg-slate-800/60 border rounded-xl px-4 py-3 text-white flex justify-between items-center cursor-pointer transition-all hover:border-slate-600 ${
                showDropdown ? "border-brand-main ring-2 ring-brand-main/30" : "border-slate-700"
              }`}
            >
              <span className={area ? "text-white font-medium" : "text-slate-500"}>
                {area || "Select your constituency…"}
              </span>
              <ChevronDown
                size={18}
                className={`text-slate-400 transition-transform duration-200 ${showDropdown ? "rotate-180 text-brand-main" : ""}`}
              />
            </div>

            {/* Dropdown — opens UPWARD (bottom-full) */}
            {showDropdown && (
              <div className="absolute bottom-full left-0 z-[100] w-full mb-1 bg-slate-900 border border-orange-700/40 rounded-xl shadow-2xl shadow-orange-900/20 overflow-hidden">
                <div className="p-2 border-b border-slate-700/70 flex items-center gap-2 bg-slate-900/90">
                  <Search size={15} className="text-orange-400 shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-transparent text-white text-sm outline-none placeholder-slate-500"
                    placeholder="Search constituency…"
                  />
                </div>
                <ul className="max-h-52 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <li className="px-4 py-3 text-slate-500 text-sm">No results found</li>
                  ) : (
                    filtered.map((c) => (
                      <li
                        key={c}
                        onClick={() => selectArea(c)}
                        className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                          area === c
                            ? "bg-brand-main/20 text-brand-main font-semibold"
                            : "text-slate-300 hover:bg-slate-800 hover:text-orange-300"
                        }`}
                      >
                        {c}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}

            <p className="text-xs text-slate-500 mt-1.5">
              {constituencies.length > 0
                ? `${constituencies.length} constituencies from 2026 election data`
                : "Loading constituencies…"}
            </p>
          </div>

          <button
            type="submit"
            disabled={!name || !area}
            className="w-full bg-gradient-to-r from-brand-main to-brand-dark hover:from-brand-dark hover:to-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 shadow-lg shadow-orange-900/30 mt-2"
          >
            Access Dashboard →
          </button>
        </form>
      </div>

      {/* Gemini AI Assistant */}
      <div className="w-full max-w-2xl">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-main to-orange-700 flex items-center justify-center text-white text-xs shadow-lg">✦</span>
          Ask the TN Election Bot 🗳️
        </h3>
        <GeminiAssistant />
      </div>
    </div>
  );
}

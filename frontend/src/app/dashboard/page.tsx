"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GeminiAssistant from "@/components/GeminiAssistant";
import { getCandidatesByArea } from "@/lib/api";
import { User, MapPin, Shield, BookOpen, Award, IndianRupee, Search, Vote, GraduationCap } from "lucide-react";

const PARTY_COLORS: Record<string, string> = {
  DMK:      "from-red-600 to-red-800",
  AIADMK:   "from-green-600 to-green-800",
  BJP:      "from-orange-500 to-orange-700",
  INC:      "from-blue-600 to-blue-800",
  NTK:      "from-yellow-600 to-yellow-800",
  TVK:      "from-purple-600 to-purple-800",
  PMK:      "from-teal-600 to-teal-800",
  VCK:      "from-sky-600 to-sky-800",
  AIPTMMK:  "from-lime-600 to-lime-800",
  BSP:      "from-indigo-700 to-indigo-900",
};
const partyGrad = (p: string) => PARTY_COLORS[p] || "from-slate-600 to-slate-800";

export default function Dashboard() {
  const [user, setUser]       = useState<any>(null);
  const [data, setData]       = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { router.push("/"); return; }
    const u = JSON.parse(stored);
    setUser(u);
    getCandidatesByArea(u.area || u.pincode).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [router]);

  const candidates: any[] = data?.candidates ?? [];
  const filtered = search
    ? candidates.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.party.toLowerCase().includes(search.toLowerCase()) ||
        c.alliance?.toLowerCase().includes(search.toLowerCase())
      )
    : candidates;

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full border-4 border-brand-main border-t-transparent animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading candidates…</p>
        </div>
      </div>
    );

  return (
    <div className="w-full space-y-8">

      {/* User welcome banner */}
      <div className="glass-orange rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-3" id="navbar">
        <div>
          <p className="text-slate-400 text-xs mb-0.5">Welcome back,</p>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <User size={18} className="text-brand-main" /> {user?.name}
          </h2>
        </div>
        <span className="flex items-center gap-2 bg-brand-main/20 text-brand-main px-4 py-2 rounded-full border border-brand-main/30 text-sm font-semibold">
          <MapPin size={15} /> {user?.area || user?.pincode}
        </span>
      </div>

      {!data ? (
        <div className="glass rounded-2xl p-10 text-center">
          <Vote size={40} className="text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl text-red-400 mb-2 font-bold">Area Not Found</h3>
          <p className="text-slate-400 mb-5">
            Could not find candidates for &quot;{user?.area}&quot;.<br />
            Please go back and select a valid constituency.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-brand-main hover:bg-brand-dark text-white px-6 py-2.5 rounded-xl font-semibold transition-colors"
          >
            ← Go Back
          </button>
        </div>
      ) : (
        <>
          {/* Constituency stats bar */}
          <div className="glass rounded-2xl p-6 border-l-4 border-l-brand-main" id="dashboard-content">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-1">
              {data.constituency} Constituency
            </h1>
            <p className="text-slate-400 text-sm">
              <span className="text-brand-main font-bold text-lg">{data.total}</span> candidates contesting · Tamil Nadu Assembly Election 2026
            </p>

            {/* Quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              {[
                { label: "Total Candidates", value: data.total, color: "text-brand-main" },
                { label: "Incumbents", value: candidates.filter((c) => c.incumbent).length, color: "text-yellow-400" },
                { label: "Women", value: candidates.filter((c) => c.gender === "Female").length, color: "text-pink-400" },
                { label: "Ministers", value: candidates.filter((c) => c.minister).length, color: "text-orange-300" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-800/60 rounded-xl px-4 py-3 border border-slate-700/50">
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative" id="candidates-section">
            <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, party or alliance…"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-11 pr-5 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-main transition-all"
            />
          </div>

          {/* Candidate grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="candidate-list">
            {filtered.map((cand: any, idx: number) => (
              <div
                key={idx}
                className="glass rounded-2xl overflow-hidden hover:scale-[1.015] hover:shadow-lg hover:shadow-orange-900/20 transition-all duration-300 group"
              >
                {/* Party color top strip */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${partyGrad(cand.party)}`} />

                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-base font-bold text-white truncate flex items-center gap-1.5">
                        {cand.name}
                        {cand.incumbent && <Shield size={13} className="text-yellow-400 shrink-0" title="Incumbent MLA" />}
                        {cand.minister  && <Award  size={13} className="text-orange-400 shrink-0" title="Minister" />}
                      </h4>
                      <span className={`inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${partyGrad(cand.party)}`}>
                        {cand.party}
                      </span>
                    </div>
                    {/* Symbol box */}
                    <div className="w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] text-center text-slate-400 shrink-0 p-1 leading-tight">
                      {cand.symbol}
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-1.5 mt-3 pt-3 border-t border-slate-700/50 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><User size={10} /> Age {cand.age}</span>
                    <span className="flex items-center gap-1"><MapPin size={10} /> {cand.gender}</span>
                    <span className="flex items-center gap-1 col-span-2 truncate">
                      <GraduationCap size={10} className="shrink-0" /> {cand.education}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400 col-span-2 truncate">
                      <IndianRupee size={10} className="shrink-0" /> Assets: {cand.assets}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 uppercase tracking-wide">
                      {cand.alliance}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-14 text-slate-500">
              <Search size={36} className="mx-auto mb-3 opacity-40" />
              <p>No candidates match &quot;{search}&quot;</p>
            </div>
          )}

          {/* AI Assistant */}
          <div className="mt-4">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-main to-orange-700 flex items-center justify-center text-white text-sm shadow-lg shadow-orange-900/30">✦</span>
              Ask the TN Election Bot 🗳️
            </h3>
            <GeminiAssistant />
          </div>

          {/* Bottom nav */}
          <div className="flex flex-wrap justify-center gap-3 mt-4 pb-6" id="navigation-buttons">
            <button
              onClick={() => router.push("/education")}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl border border-slate-600 hover:border-brand-main/40 transition-all text-sm font-medium"
            >
              <BookOpen size={16} /> Learn about EVMs
            </button>
            <button
              onClick={() => router.push("/voting-day")}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl border border-slate-600 hover:border-brand-main/40 transition-all text-sm font-medium"
            >
              <MapPin size={16} /> Voting Day Info
            </button>
          </div>
        </>
      )}
    </div>
  );
}

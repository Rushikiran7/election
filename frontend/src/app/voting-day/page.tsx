"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Map, Navigation2, Info } from "lucide-react";

export default function VotingDay() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  if (!user) return null;

  return (
    <div className="w-full space-y-8" id="voting-day-container">
      <div className="glass p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Map className="text-brand-main" /> My Polling Booth
            </h1>
            <p className="text-slate-400">Based on your pincode: {user.pincode}</p>
        </div>
        <div className="bg-brand-main/20 text-brand-light px-4 py-2 rounded-lg border border-brand-main/30 flex items-center gap-2">
            <Info size={18} /> Mocked Map Data for Prototype
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 glass rounded-2xl overflow-hidden min-h-[400px] border border-slate-700 relative flex items-center justify-center bg-slate-900" id="map-container">
            {/* Mock Map Placeholder */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
            }}></div>
            <div className="text-center z-10 p-6">
                <Navigation2 size={48} className="mx-auto text-slate-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-300">Government High School</h3>
                <p className="text-slate-500 mt-2">1.2 km away from your registered address.</p>
            </div>
        </div>

        <div className="space-y-6" id="voting-checklist">
            <div className="glass p-6 rounded-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Voting Day Checklist</h3>
                <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-slate-300">
                        <input type="checkbox" className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-brand-main focus:ring-brand-main" />
                        Carry your original Voter ID Card.
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                        <input type="checkbox" className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-brand-main focus:ring-brand-main" />
                        Carry Voter Information Slip.
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                        <input type="checkbox" className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-brand-main focus:ring-brand-main" />
                        Check your booth number online.
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                        <input type="checkbox" className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-brand-main focus:ring-brand-main" />
                        Do not carry mobile phones inside.
                    </li>
                </ul>
            </div>
            
            <button className="w-full glass p-4 rounded-xl text-brand-light font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors border-brand-main/50">
                <Navigation2 size={20} /> Get Directions
            </button>
        </div>
      </div>
    </div>
  );
}

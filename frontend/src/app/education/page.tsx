"use client";
import { useRouter } from "next/navigation";
import { BookOpen, AlertTriangle } from "lucide-react";

export default function Education() {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto w-full space-y-12">
      <div className="text-center" id="edu-header">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-4">
          <BookOpen className="text-brand-main" size={48} /> Election Process Hub
        </h1>
        <p className="text-slate-400 text-lg">Your complete guide to understanding how to vote.</p>
      </div>

      <div className="glass p-8 rounded-2xl" id="evm-guide">
        <h2 className="text-3xl font-bold mb-6 text-brand-light">How to use the EVM</h2>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p>
            The Electronic Voting Machine (EVM) is a simple, secure device used to cast your vote.
          </p>
          <div className="grid md:grid-cols-2 gap-8 items-center">
             <div className="space-y-4">
                 <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-bold text-white mb-2">Step 1: Verification</h4>
                    <p className="text-sm">The presiding officer will verify your identity using your Voter ID and electoral roll.</p>
                 </div>
                 <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-bold text-white mb-2">Step 2: Cast your vote</h4>
                    <p className="text-sm">Press the blue button on the Ballot Unit against the name and symbol of the candidate of your choice.</p>
                 </div>
                 <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h4 className="font-bold text-white mb-2">Step 3: Verification (VVPAT)</h4>
                    <p className="text-sm">Check the VVPAT slip printed behind the glass window to verify your vote was recorded correctly.</p>
                 </div>
             </div>
             <div className="bg-slate-900 rounded-xl p-8 flex items-center justify-center border border-slate-800 h-full min-h-[300px]">
                 <p className="text-slate-500 italic text-center">EVM Infographic goes here</p>
             </div>
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-2xl border-l-4 border-l-yellow-500" id="malpractice">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-yellow-500">
          <AlertTriangle /> Report Malpractice
        </h2>
        <p className="text-slate-300 mb-6">
          Elections must be free and fair. If you notice any suspicious activity, bribery, or intimidation, report it immediately to the Election Commission.
        </p>
        <button className="bg-yellow-600 hover:bg-yellow-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Open Complaint Form
        </button>
      </div>

      <div className="flex justify-center pb-12">
        <button onClick={() => router.push("/dashboard")} className="text-brand-light underline">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

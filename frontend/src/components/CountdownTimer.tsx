"use client";
import { useEffect, useState } from "react";

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Target date: May 10, 2026 (or next year if past)
    const targetDate = new Date("May 10, 2026 00:00:00").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div id="countdown" className="glass p-6 rounded-2xl flex flex-col items-center max-w-fit mx-auto mb-12">
      <h2 className="text-xl text-slate-300 font-semibold mb-4 tracking-wide uppercase">Time until Election Day</h2>
      <div className="flex gap-4 sm:gap-8 text-center">
        <div className="flex flex-col">
          <span className="text-4xl sm:text-5xl font-bold text-brand-light">{timeLeft.days}</span>
          <span className="text-xs sm:text-sm text-slate-400 mt-2 uppercase tracking-widest">Days</span>
        </div>
        <span className="text-4xl sm:text-5xl font-bold text-slate-600">:</span>
        <div className="flex flex-col">
          <span className="text-4xl sm:text-5xl font-bold text-brand-light">{timeLeft.hours}</span>
          <span className="text-xs sm:text-sm text-slate-400 mt-2 uppercase tracking-widest">Hours</span>
        </div>
        <span className="text-4xl sm:text-5xl font-bold text-slate-600">:</span>
        <div className="flex flex-col">
          <span className="text-4xl sm:text-5xl font-bold text-brand-light">{timeLeft.minutes}</span>
          <span className="text-xs sm:text-sm text-slate-400 mt-2 uppercase tracking-widest">Mins</span>
        </div>
        <span className="text-4xl sm:text-5xl font-bold text-slate-600">:</span>
        <div className="flex flex-col">
          <span className="text-4xl sm:text-5xl font-bold text-brand-light">{timeLeft.seconds}</span>
          <span className="text-xs sm:text-sm text-slate-400 mt-2 uppercase tracking-widest">Secs</span>
        </div>
      </div>
    </div>
  );
}

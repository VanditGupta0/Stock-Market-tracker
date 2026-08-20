"use client";

import { ChevronDown, LogOut } from "lucide-react";

export default function UserDropdown() {
  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-1 hover:bg-white/5">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-black">S</span>
        <span className="hidden text-sm font-medium text-slate-200 sm:block">Sambhav</span>
        <ChevronDown size={16} className="text-slate-500" />
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-52 rounded-xl border border-white/10 bg-[#171717] p-2 shadow-2xl">
        <div className="px-3 py-2 text-xs text-slate-500">Demo account</div>
        {/* Logout/login button */}
        <button
          type="button"
          onClick={() => {
            document.cookie = "logged_in=; path=/; max-age=0";
            window.location.href = "/login";
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-white/5"
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </details>
  );
}

import { ReactNode } from "react";

export default function Background({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cinematic bg-gradient-to-br from-[#071026] via-[#2a1263] to-[#0aa6a0] text-white">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">{children}</div>
    </div>
  );
}

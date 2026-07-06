"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface HeaderProps {
  userName: string;
}

export default function Header({ userName }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(path: string) {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#e2e8f0] px-6 h-14 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-bold tracking-wide text-[#1e3a5f]">
          ROCO
        </Link>
        <nav className="flex gap-5">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors pb-0.5 border-b-2 ${
              isActive("/") ? "text-[#1e3a5f] border-[#1e3a5f]" : "text-[#64748b] border-transparent hover:text-[#1e3a5f]"
            }`}
          >
            Inicio
          </Link>
          <Link
            href="/admin"
            className={`text-sm font-medium transition-colors pb-0.5 border-b-2 ${
              isActive("/admin") ? "text-[#1e3a5f] border-[#1e3a5f]" : "text-[#64748b] border-transparent hover:text-[#1e3a5f]"
            }`}
          >
            Admin
          </Link>
          <Link
            href="/historial"
            className={`text-sm font-medium transition-colors pb-0.5 border-b-2 ${
              isActive("/historial") ? "text-[#1e3a5f] border-[#1e3a5f]" : "text-[#64748b] border-transparent hover:text-[#1e3a5f]"
            }`}
          >
            Historial
          </Link>
        </nav>
      </div>
      <div className="flex items-center gap-3 text-sm text-[#64748b]">
        <span>{userName}</span>
        <button
          onClick={handleLogout}
          className="text-xs border border-[#e2e8f0] rounded-md px-3 py-1.5 transition-colors hover:bg-[#f1f5f9] hover:text-red-500 hover:border-red-300"
        >
          Salir
        </button>
      </div>
    </header>
  );
}

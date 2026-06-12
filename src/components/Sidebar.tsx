"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, ClipboardList, User, LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: { name: string; email: string };
}

const navItems = [
  { href: "/rotinas", label: "Rotinas", icon: ClipboardList },
  { href: "/perfil", label: "Meu Perfil", icon: User },
];

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <Link href="/rotinas" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 leading-tight">Saúde Unida</p>
            <p className="text-xs text-slate-400">Cuidado familiar</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-4 h-4", active ? "text-brand-600" : "text-slate-400")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-brand-700">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}

import Link from "next/link";
import { Heart } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center mx-auto mb-6">
          <Heart className="w-8 h-8 text-brand-400" />
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 mb-3">404</h1>
        <p className="text-slate-500 mb-6">Página não encontrada.</p>
        <Link href="/rotinas" className="btn-primary">
          Voltar para Rotinas
        </Link>
      </div>
    </div>
  );
}

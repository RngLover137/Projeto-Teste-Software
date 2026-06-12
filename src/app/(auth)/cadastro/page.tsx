"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Mail, Lock, User, Loader2 } from "lucide-react";
import { registerAction } from "@/lib/actions/auth";

export default function CadastroPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);
    if (result && !result.success) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="font-bold text-xl text-slate-900">Saúde Unida</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Crie sua conta</h1>
          <p className="text-slate-500 text-sm mt-1">Comece a cuidar da saúde da sua família</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="name">Nome completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="input pl-9"
                  placeholder="Maria da Silva"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="email">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input pl-9"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="input pl-9"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Criando conta…" : "Criar conta"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-4">
          Já tem conta?{" "}
          <Link href="/login" className="text-brand-600 font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import { Heart, Users, ClipboardList, Shield } from "lucide-react";

export default async function HomePage() {
  const session = await getSession();
  if (session) redirect("/rotinas");

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-emerald-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-lg text-slate-900">Saúde Unida</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-secondary text-sm px-4 py-2">
            Entrar
          </Link>
          <Link href="/cadastro" className="btn-primary text-sm px-4 py-2">
            Começar grátis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-6">
          <Heart className="w-3 h-3 fill-brand-500 text-brand-500" />
          Cuidado familiar compartilhado
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
          Organize a saúde{" "}
          <span className="text-brand-600">da sua família</span>{" "}
          em conjunto
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
          Crie rotinas semanais de saúde e bem-estar, compartilhe com seus
          familiares e acompanhe as tarefas de cada um — tudo em um só lugar.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/cadastro" className="btn-primary px-8 py-3 text-base">
            Criar conta gratuita
          </Link>
          <Link href="/login" className="btn-secondary px-8 py-3 text-base">
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: ClipboardList,
              title: "Rotinas Semanais",
              desc: "Organize tarefas de saúde por dia da semana — medicamentos, consultas, exercícios e mais.",
              color: "bg-brand-100 text-brand-600",
            },
            {
              icon: Users,
              title: "Acesso Compartilhado",
              desc: "Convide familiares para participar das rotinas. Cada um com seu nível de acesso.",
              color: "bg-emerald-100 text-emerald-600",
            },
            {
              icon: Shield,
              title: "Controle de Permissões",
              desc: "Três níveis: visualizador, editor e administrador. Você decide quem faz o quê.",
              color: "bg-teal-100 text-teal-600",
            },
          ].map((f) => (
            <div key={f.title} className="card p-6">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}
              >
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

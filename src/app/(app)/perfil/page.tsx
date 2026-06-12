import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/queries";
import { redirect } from "next/navigation";
import DeleteAccountButton from "@/components/DeleteAccountButton";
import { User, Mail, Calendar, Shield } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function PerfilPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const user = await getUserById(session.userId);
  if (!user) redirect("/login");

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Meu Perfil</h1>
        <p className="text-slate-500 text-sm mt-0.5">Gerencie suas informações de conta</p>
      </div>

      {/* Profile card */}
      <div className="card p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-brand-700">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-slate-500 text-sm">{user.email}</p>
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-5">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Nome</p>
              <p className="font-medium text-slate-900">{user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Mail className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">E-mail</p>
              <p className="font-medium text-slate-900">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">Membro desde</p>
              <p className="font-medium text-slate-900">
                {format(new Date(user.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-red-100">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-red-400" />
          <h3 className="font-semibold text-slate-900 text-sm">Zona de perigo</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Ao excluir sua conta, todos os seus dados serão permanentemente removidos —
          incluindo suas rotinas criadas, associações como membro e tarefas. Esta ação
          não pode ser desfeita.
        </p>
        <DeleteAccountButton />
      </div>
    </div>
  );
}

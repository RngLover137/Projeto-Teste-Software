"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, X, Loader2, Crown, Eye, Pencil, UserMinus } from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, cn } from "@/lib/utils";
import { inviteMemberAction, removeMemberAction, updateMemberRoleAction } from "@/lib/actions/members";
import type { MemberRole } from "@/lib/db/schema";

interface MemberRow {
  id: string;
  role: MemberRole;
  userId: string;
  userName: string;
  userEmail: string;
  joinedAt: Date;
}

interface Props {
  routineId: string;
  members: MemberRow[];
  isAdmin: boolean;
  currentUserId: string;
}

const ROLE_ICONS: Record<MemberRole, React.ReactNode> = {
  admin:  <Crown className="w-3 h-3" />,
  editor: <Pencil className="w-3 h-3" />,
  viewer: <Eye className="w-3 h-3" />,
};

export default function MembersPanel({ routineId, members, isAdmin, currentUserId }: Props) {
  const router = useRouter();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await inviteMemberAction(routineId, fd);
      if (result.success) {
        setSuccess(result.message ?? "Membro adicionado.");
        (e.target as HTMLFormElement).reset();
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleRoleChange(memberId: string, newRole: MemberRole) {
    startTransition(async () => {
      await updateMemberRoleAction(memberId, routineId, newRole);
      router.refresh();
    });
  }

  function handleRemove(memberId: string) {
    startTransition(async () => {
      await removeMemberAction(memberId, routineId);
      router.refresh();
    });
  }

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-slate-900 text-sm">Membros</h2>
        {isAdmin && (
          <button
            onClick={() => setInviteOpen(!inviteOpen)}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 hover:bg-brand-50 px-2 py-1 rounded-lg transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            Convidar
          </button>
        )}
      </div>

      {/* Invite form */}
      {inviteOpen && isAdmin && (
        <form onSubmit={handleInvite} className="space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <label className="label text-xs">E-mail do usuário</label>
            <input name="email" type="email" required className="input text-sm" placeholder="usuario@email.com" />
          </div>
          <div>
            <label className="label text-xs">Função</label>
            <select name="role" className="input text-sm">
              <option value="viewer">Visualizador</option>
              <option value="editor">Editor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {success && <p className="text-xs text-emerald-600">{success}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => { setInviteOpen(false); setError(""); setSuccess(""); }} className="btn-secondary text-xs flex-1 py-2">Cancelar</button>
            <button type="submit" disabled={isPending} className="btn-primary text-xs flex-1 py-2">
              {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Adicionar"}
            </button>
          </div>
        </form>
      )}

      {/* Members list */}
      <div className="space-y-2">
        {members.map((member) => {
          const isCurrentUser = member.userId === currentUserId;
          return (
            <div key={member.id} className="flex items-center gap-3 group">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-brand-700">
                  {member.userName.charAt(0).toUpperCase()}
                </span>
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {member.userName}
                  {isCurrentUser && <span className="text-slate-400 font-normal"> (você)</span>}
                </p>
                <p className="text-xs text-slate-400 truncate">{member.userEmail}</p>
              </div>
              {/* Role */}
              {isAdmin && !isCurrentUser ? (
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value as MemberRole)}
                  disabled={isPending}
                  className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-brand-400"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="admin">Admin</option>
                </select>
              ) : (
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1", ROLE_COLORS[member.role])}>
                  {ROLE_ICONS[member.role]}
                  {ROLE_LABELS[member.role]}
                </span>
              )}
              {/* Remove button */}
              {isAdmin && !isCurrentUser && (
                <button
                  onClick={() => handleRemove(member.id)}
                  disabled={isPending}
                  className="hidden group-hover:flex w-7 h-7 items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors"
                  title="Remover membro"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

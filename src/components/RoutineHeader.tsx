"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Settings, Trash2, X, Loader2, Users, CheckSquare,
} from "lucide-react";
import Link from "next/link";
import { updateRoutineAction, deleteRoutineAction } from "@/lib/actions/routines";
import { leaveRoutineAction } from "@/lib/actions/members";
import { ROLE_LABELS, ROLE_COLORS, cn } from "@/lib/utils";
import type { Routine, MemberRole } from "@/lib/db/schema";

interface Props {
  routine: Routine;
  role: MemberRole;
  isAdmin: boolean;
  memberCount: number;
}

export default function RoutineHeader({ routine, role, isAdmin, memberCount }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateRoutineAction(routine.id, fd);
      if (result.success) {
        setEditOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteRoutineAction(routine.id);
    });
  }

  function handleLeave() {
    startTransition(async () => {
      const result = await leaveRoutineAction(routine.id);
      if (result.success) router.push("/rotinas");
      else setError(result.error);
    });
  }

  return (
    <>
      <div className="card p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link
              href="/rotinas"
              className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-slate-900">{routine.name}</h1>
                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", ROLE_COLORS[role])}>
                  {ROLE_LABELS[role]}
                </span>
              </div>
              {routine.description && (
                <p className="text-sm text-slate-500">{routine.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {memberCount} membro{memberCount !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <CheckSquare className="w-3 h-3" />
                  Rotina semanal
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => setEditOpen(true)}
                  className="btn-secondary text-xs px-3 py-2"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Editar
                </button>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="btn-danger text-xs px-3 py-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Apagar
                </button>
              </>
            )}
            {!isAdmin && (
              <button
                onClick={() => setLeaveOpen(true)}
                className="btn-secondary text-xs px-3 py-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
              >
                Sair da rotina
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Editar rotina</h2>
              <button onClick={() => setEditOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="label">Nome</label>
                <input name="name" defaultValue={routine.name} required className="input" />
              </div>
              <div>
                <label className="label">Descrição</label>
                <textarea name="description" defaultValue={routine.description ?? ""} rows={3} className="input resize-none" />
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setEditOpen(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={isPending} className="btn-primary flex-1">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isPending ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDeleteOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Apagar rotina?</h2>
            <p className="text-sm text-slate-500 mb-6">
              Isso removerá permanentemente a rotina <strong>{routine.name}</strong>, todos os membros e tarefas. Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteOpen(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleDelete} disabled={isPending} className="btn-danger flex-1">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apagar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Confirm */}
      {leaveOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setLeaveOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Sair da rotina?</h2>
            <p className="text-sm text-slate-500 mb-6">
              Você perderá o acesso a esta rotina. Um administrador precisará te convidar novamente.
            </p>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
            <div className="flex gap-3">
              <button onClick={() => setLeaveOpen(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleLeave} disabled={isPending} className="btn-danger flex-1">
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sair"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Trash2, X, Loader2 } from "lucide-react";
import { deleteAccountAction } from "@/lib/actions/auth";

export default function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();

  const CONFIRM_TEXT = "EXCLUIR CONTA";

  function handleDelete() {
    startTransition(async () => {
      await deleteAccountAction();
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-danger text-sm"
      >
        <Trash2 className="w-4 h-4" />
        Excluir minha conta
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Excluir conta</h2>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <p className="text-sm text-red-700 font-medium mb-1">Esta ação é irreversível.</p>
              <p className="text-sm text-red-600">
                Todos os seus dados, rotinas e associações serão excluídos permanentemente.
              </p>
            </div>

            <div className="mb-5">
              <label className="label text-sm">
                Digite <strong>{CONFIRM_TEXT}</strong> para confirmar
              </label>
              <input
                type="text"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input"
                placeholder={CONFIRM_TEXT}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} className="btn-secondary flex-1">Cancelar</button>
              <button
                onClick={handleDelete}
                disabled={confirm !== CONFIRM_TEXT || isPending}
                className="btn-danger flex-1"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {isPending ? "Excluindo…" : "Excluir conta"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

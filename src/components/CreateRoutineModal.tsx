"use client";

import { useState, useTransition } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createRoutineAction } from "@/lib/actions/routines";

interface Props {
  variant?: "default" | "inline";
}

export default function CreateRoutineModal({ variant = "default" }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createRoutineAction(formData);
      if (result && !result.success) {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={variant === "inline" ? "btn-primary" : "btn-primary"}
      >
        <Plus className="w-4 h-4" />
        Nova Rotina
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900">Nova rotina</h2>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="routine-name">
                  Nome da rotina
                </label>
                <input
                  id="routine-name"
                  name="name"
                  type="text"
                  required
                  className="input"
                  placeholder="Ex: Rotina da Vovó, Saúde do João…"
                />
              </div>
              <div>
                <label className="label" htmlFor="routine-desc">
                  Descrição <span className="text-slate-400 font-normal">(opcional)</span>
                </label>
                <textarea
                  id="routine-desc"
                  name="description"
                  rows={3}
                  className="input resize-none"
                  placeholder="Do que se trata essa rotina?"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="btn-primary flex-1">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isPending ? "Criando…" : "Criar rotina"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

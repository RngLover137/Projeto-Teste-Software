"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, X, Loader2, Clock, CheckCircle2, Circle, Timer } from "lucide-react";
import { WEEKDAYS, STATUS_LABELS, STATUS_COLORS, cn } from "@/lib/utils";
import { createTaskAction, deleteTaskAction, updateTaskStatusAction, updateTaskAction } from "@/lib/actions/tasks";
import type { Task, TaskStatus, Weekday } from "@/lib/db/schema";

interface Props {
  routineId: string;
  tasks: Task[];
  canEdit: boolean;
}

const STATUS_ICONS: Record<TaskStatus, React.ReactNode> = {
  pending:     <Circle className="w-4 h-4 text-amber-400" />,
  in_progress: <Timer className="w-4 h-4 text-blue-500" />,
  done:        <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
};

const NEXT_STATUS: Record<TaskStatus, TaskStatus> = {
  pending: "in_progress",
  in_progress: "done",
  done: "pending",
};

export default function WeeklyBoard({ routineId, tasks, canEdit }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [addingDay, setAddingDay] = useState<Weekday | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState("");

  function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createTaskAction(routineId, fd);
      if (result.success) {
        setAddingDay(null);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleUpdateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingTask) return;
    setError("");
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateTaskAction(editingTask.id, routineId, fd);
      if (result.success) {
        setEditingTask(null);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  function handleDelete(taskId: string) {
    startTransition(async () => {
      await deleteTaskAction(taskId, routineId);
      router.refresh();
    });
  }

  function handleStatusCycle(task: Task) {
    if (!canEdit) return;
    const next = NEXT_STATUS[task.status];
    startTransition(async () => {
      await updateTaskStatusAction(task.id, routineId, next);
      router.refresh();
    });
  }

  return (
    <>
      <div className="space-y-4">
        {WEEKDAYS.map(({ key, label, short }) => {
          const dayTasks = tasks.filter((t) => t.weekday === key);
          const doneCount = dayTasks.filter((t) => t.status === "done").length;

          return (
            <div key={key} className="card overflow-hidden">
              {/* Day header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-sm text-slate-900">{label}</span>
                  {dayTasks.length > 0 && (
                    <span className="text-xs text-slate-400">
                      {doneCount}/{dayTasks.length} concluídas
                    </span>
                  )}
                  {dayTasks.length > 0 && (
                    <div className="flex gap-0.5">
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          className={cn(
                            "w-2 h-2 rounded-full",
                            t.status === "done"
                              ? "bg-emerald-400"
                              : t.status === "in_progress"
                              ? "bg-blue-400"
                              : "bg-slate-200"
                          )}
                        />
                      ))}
                    </div>
                  )}
                </div>
                {canEdit && (
                  <button
                    onClick={() => setAddingDay(key)}
                    className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 hover:bg-brand-50 px-2 py-1 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Tarefa
                  </button>
                )}
              </div>

              {/* Tasks */}
              <div className="divide-y divide-slate-50">
                {dayTasks.length === 0 && (
                  <p className="px-5 py-4 text-sm text-slate-400 italic">
                    Nenhuma tarefa para {label.toLowerCase()}.
                  </p>
                )}
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 group transition-colors"
                  >
                    <button
                      onClick={() => handleStatusCycle(task)}
                      disabled={!canEdit || isPending}
                      className={cn("flex-shrink-0 transition-opacity", !canEdit && "cursor-default")}
                      title={canEdit ? `Marcar como: ${STATUS_LABELS[NEXT_STATUS[task.status]]}` : STATUS_LABELS[task.status]}
                    >
                      {STATUS_ICONS[task.status]}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm font-medium text-slate-900", task.status === "done" && "line-through text-slate-400")}>
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{task.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {task.estimatedMinutes && (
                        <span className="hidden group-hover:flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          {task.estimatedMinutes}min
                        </span>
                      )}
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", STATUS_COLORS[task.status])}>
                        {STATUS_LABELS[task.status]}
                      </span>
                      {canEdit && (
                        <div className="hidden group-hover:flex gap-1">
                          <button
                            onClick={() => setEditingTask(task)}
                            className="text-xs text-slate-400 hover:text-brand-600 px-1.5 py-1 rounded-lg hover:bg-brand-50 transition-colors font-medium"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(task.id)}
                            disabled={isPending}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {addingDay && (
        <TaskFormModal
          title="Nova tarefa"
          defaultWeekday={addingDay}
          onClose={() => { setAddingDay(null); setError(""); }}
          onSubmit={handleCreateTask}
          isPending={isPending}
          error={error}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <TaskFormModal
          title="Editar tarefa"
          defaultWeekday={editingTask.weekday}
          defaultValues={editingTask}
          onClose={() => { setEditingTask(null); setError(""); }}
          onSubmit={handleUpdateTask}
          isPending={isPending}
          error={error}
        />
      )}
    </>
  );
}

// ─── Task Form Modal ──────────────────────────────────────────────────────────

interface TaskFormModalProps {
  title: string;
  defaultWeekday: Weekday;
  defaultValues?: Partial<Task>;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
  error: string;
}

function TaskFormModal({ title, defaultWeekday, defaultValues, onClose, onSubmit, isPending, error }: TaskFormModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Título</label>
            <input name="title" defaultValue={defaultValues?.title ?? ""} required className="input" placeholder="Ex: Tomar remédio da pressão" />
          </div>
          <div>
            <label className="label">Descrição <span className="text-slate-400 font-normal">(opcional)</span></label>
            <textarea name="description" defaultValue={defaultValues?.description ?? ""} rows={2} className="input resize-none" placeholder="Detalhes adicionais…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Dia da semana</label>
              <select name="weekday" defaultValue={defaultValues?.weekday ?? defaultWeekday} className="input">
                {WEEKDAYS.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Tempo estimado <span className="text-slate-400 font-normal">(min)</span></label>
              <input name="estimatedMinutes" type="number" min={1} defaultValue={defaultValues?.estimatedMinutes ?? ""} className="input" placeholder="Ex: 30" />
            </div>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" disabled={isPending} className="btn-primary flex-1">
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isPending ? "Salvando…" : "Salvar tarefa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

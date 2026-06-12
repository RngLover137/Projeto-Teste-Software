import { getSession } from "@/lib/auth";
import { getRoutinesForUser } from "@/lib/queries";
import Link from "next/link";
import { Plus, ClipboardList, Heart } from "lucide-react";
import { ROLE_LABELS, ROLE_COLORS, WEEKDAYS, cn } from "@/lib/utils";
import CreateRoutineModal from "@/components/CreateRoutineModal";

export default async function RotinasPage() {
  const session = await getSession();
  const routines = await getRoutinesForUser(session!.userId);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Minhas Rotinas</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Gerencie suas rotinas semanais de saúde e bem-estar
          </p>
        </div>
        <CreateRoutineModal />
      </div>

      {/* Empty state */}
      {routines.length === 0 && (
        <div className="card p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Nenhuma rotina ainda
          </h2>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Crie sua primeira rotina semanal ou peça para um familiar te adicionar em uma já existente.
          </p>
          <CreateRoutineModal variant="inline" />
        </div>
      )}

      {/* Grid */}
      {routines.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routines.map((routine) => (
            <Link
              key={routine.id}
              href={`/rotinas/${routine.id}`}
              className="card p-5 hover:shadow-md hover:border-brand-200 transition-all group"
            >
              {/* Top */}
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  <Heart className="w-5 h-5 text-brand-500" />
                </div>
                <span
                  className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-full",
                    ROLE_COLORS[routine.role]
                  )}
                >
                  {ROLE_LABELS[routine.role]}
                </span>
              </div>

              {/* Info */}
              <h2 className="font-bold text-slate-900 mb-1 group-hover:text-brand-700 transition-colors">
                {routine.name}
              </h2>
              {routine.description && (
                <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                  {routine.description}
                </p>
              )}

              {/* Week indicator */}
              <div className="flex gap-1 mt-3">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d.key}
                    className="flex-1 h-1.5 rounded-full bg-brand-100 group-hover:bg-brand-200 transition-colors"
                  />
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-2">Rotina semanal</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  getRoutineById,
  getMemberForRoutine,
  getMembersForRoutine,
  getTasksForRoutine,
} from "@/lib/queries";
import { WEEKDAYS, ROLE_LABELS, ROLE_COLORS, cn } from "@/lib/utils";
import WeeklyBoard from "@/components/WeeklyBoard";
import MembersPanel from "@/components/MembersPanel";
import RoutineHeader from "@/components/RoutineHeader";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RoutinePage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const resolvedParams = await params;
  const routineId = resolvedParams.id;

  const [routine, currentMember] = await Promise.all([
    getRoutineById(routineId),
    getMemberForRoutine(routineId, session.userId),
  ]);

  if (!routine || !currentMember) notFound();

  const [allMembers, allTasks] = await Promise.all([
    getMembersForRoutine(routineId),
    getTasksForRoutine(routineId),
  ]);

  const role = currentMember.role;
  const canEdit = role === "editor" || role === "admin";
  const isAdmin = role === "admin";

  return (
    <div className="space-y-6">
      <RoutineHeader
        routine={routine}
        role={role}
        isAdmin={isAdmin}
        memberCount={allMembers.length}
      />

      <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
        <WeeklyBoard
          routineId={routine.id}
          tasks={allTasks}
          canEdit={canEdit}
        />
        <MembersPanel
          routineId={routine.id}
          members={allMembers}
          isAdmin={isAdmin}
          currentUserId={session.userId}
        />
      </div>
    </div>
  );
}

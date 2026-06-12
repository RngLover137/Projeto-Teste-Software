import { db } from "@/lib/db";
import { routines, members, tasks, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

// ─── User ─────────────────────────────────────────────────────────────────────

export async function getUserById(userId: string) {
  const [user] = await db
    .select({ id: users.id, name: users.name, email: users.email, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return user ?? null;
}

// ─── Routines ─────────────────────────────────────────────────────────────────

export async function getRoutinesForUser(userId: string) {
  const rows = await db
    .select({
      routine: routines,
      member: members,
    })
    .from(members)
    .innerJoin(routines, eq(members.routineId, routines.id))
    .where(eq(members.userId, userId));

  return rows.map((r) => ({ ...r.routine, role: r.member.role }));
}

export async function getRoutineById(routineId: string) {
  const [routine] = await db
    .select()
    .from(routines)
    .where(eq(routines.id, routineId))
    .limit(1);
  return routine ?? null;
}

// ─── Members ──────────────────────────────────────────────────────────────────

export async function getMembersForRoutine(routineId: string) {
  return db
    .select({
      id: members.id,
      role: members.role,
      joinedAt: members.joinedAt,
      userId: users.id,
      userName: users.name,
      userEmail: users.email,
    })
    .from(members)
    .innerJoin(users, eq(members.userId, users.id))
    .where(eq(members.routineId, routineId));
}

export async function getMemberForRoutine(routineId: string, userId: string) {
  const [member] = await db
    .select()
    .from(members)
    .where(and(eq(members.routineId, routineId), eq(members.userId, userId)))
    .limit(1);
  return member ?? null;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export async function getTasksForRoutine(routineId: string) {
  return db
    .select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      weekday: tasks.weekday,
      status: tasks.status,
      estimatedMinutes: tasks.estimatedMinutes,
      createdAt: tasks.createdAt,
      createdByMemberId: tasks.createdByMemberId,
    })
    .from(tasks)
    .where(eq(tasks.routineId, routineId))
    .orderBy(tasks.createdAt);
}

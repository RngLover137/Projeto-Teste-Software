"use server";

import { db } from "@/lib/db";
import { members, users } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import type { MemberRole } from "@/lib/db/schema";
import type { ActionResult } from "./auth";
import { checkAndCleanOrphanedRoutine } from "./routines";
import { z } from "zod";

const InviteSchema = z.object({
  email: z.string().email("E-mail inválido"),
  role: z.enum(["viewer", "editor", "admin"]),
});

// ─── Invite Member ─────────────────────────────────────────────────────────────

export async function inviteMemberAction(
  routineId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado." };

  // Check if current user is admin
  const [currentMember] = await db
    .select()
    .from(members)
    .where(
      and(eq(members.routineId, routineId), eq(members.userId, session.userId))
    )
    .limit(1);

  if (!currentMember || currentMember.role !== "admin") {
    return { success: false, error: "Apenas administradores podem convidar membros." };
  }

  const raw = {
    email: formData.get("email") as string,
    role: formData.get("role") as string,
  };

  const parsed = InviteSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  // Find target user
  const [targetUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (!targetUser) {
    return { success: false, error: "Usuário não encontrado com este e-mail." };
  }

  // Check if already a member
  const [existing] = await db
    .select()
    .from(members)
    .where(
      and(eq(members.routineId, routineId), eq(members.userId, targetUser.id))
    )
    .limit(1);

  if (existing) {
    return { success: false, error: "Este usuário já é membro desta rotina." };
  }

  await db.insert(members).values({
    userId: targetUser.id,
    routineId,
    role: parsed.data.role,
  });

  return { success: true, message: `${targetUser.name} adicionado como ${parsed.data.role}.` };
}

// ─── Update Member Role ────────────────────────────────────────────────────────

export async function updateMemberRoleAction(
  memberId: string,
  routineId: string,
  newRole: MemberRole
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado." };

  const [currentMember] = await db
    .select()
    .from(members)
    .where(
      and(eq(members.routineId, routineId), eq(members.userId, session.userId))
    )
    .limit(1);

  if (!currentMember || currentMember.role !== "admin") {
    return { success: false, error: "Apenas administradores podem alterar funções." };
  }

  await db
    .update(members)
    .set({ role: newRole })
    .where(eq(members.id, memberId));

  await checkAndCleanOrphanedRoutine(routineId);
  return { success: true };
}

// ─── Remove Member ─────────────────────────────────────────────────────────────

export async function removeMemberAction(
  memberId: string,
  routineId: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado." };

  const [currentMember] = await db
    .select()
    .from(members)
    .where(
      and(eq(members.routineId, routineId), eq(members.userId, session.userId))
    )
    .limit(1);

  if (!currentMember || currentMember.role !== "admin") {
    return { success: false, error: "Apenas administradores podem remover membros." };
  }

  // Cannot remove yourself if you're the last admin
  const [targetMember] = await db
    .select()
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);

  await db.delete(members).where(eq(members.id, memberId));
  await checkAndCleanOrphanedRoutine(routineId);

  return { success: true };
}

// ─── Leave Routine ─────────────────────────────────────────────────────────────

export async function leaveRoutineAction(
  routineId: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado." };

  const [member] = await db
    .select()
    .from(members)
    .where(
      and(eq(members.routineId, routineId), eq(members.userId, session.userId))
    )
    .limit(1);

  if (!member) return { success: false, error: "Você não é membro desta rotina." };

  await db.delete(members).where(eq(members.id, member.id));
  await checkAndCleanOrphanedRoutine(routineId);

  return { success: true };
}

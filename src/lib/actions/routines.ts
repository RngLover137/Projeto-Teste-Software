"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { routines, members, tasks } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and, count } from "drizzle-orm";
import { z } from "zod";
import type { ActionResult } from "./auth";

const RoutineSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  description: z.string().optional(),
});

// ─── Create Routine ───────────────────────────────────────────────────────────

export async function createRoutineAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado." };

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = RoutineSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const [routine] = await db
    .insert(routines)
    .values({
      name: parsed.data.name,
      description: parsed.data.description,
      createdByUserId: session.userId,
    })
    .returning();

  // Creator automatically becomes admin
  await db.insert(members).values({
    userId: session.userId,
    routineId: routine.id,
    role: "admin",
  });

  redirect(`/rotinas/${routine.id}`);
}

// ─── Update Routine ───────────────────────────────────────────────────────────

export async function updateRoutineAction(
  routineId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado." };

  const member = await db
    .select()
    .from(members)
    .where(
      and(
        eq(members.routineId, routineId),
        eq(members.userId, session.userId)
      )
    )
    .limit(1);

  if (!member[0] || member[0].role !== "admin") {
    return { success: false, error: "Apenas administradores podem editar a rotina." };
  }

  const raw = {
    name: formData.get("name") as string,
    description: (formData.get("description") as string) || undefined,
  };

  const parsed = RoutineSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  await db
    .update(routines)
    .set({ name: parsed.data.name, description: parsed.data.description, updatedAt: new Date() })
    .where(eq(routines.id, routineId));

  return { success: true, message: "Rotina atualizada." };
}

// ─── Delete Routine ───────────────────────────────────────────────────────────

export async function deleteRoutineAction(
  routineId: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado." };

  const member = await db
    .select()
    .from(members)
    .where(
      and(
        eq(members.routineId, routineId),
        eq(members.userId, session.userId)
      )
    )
    .limit(1);

  if (!member[0] || member[0].role !== "admin") {
    return { success: false, error: "Apenas administradores podem apagar a rotina." };
  }

  await db.delete(routines).where(eq(routines.id, routineId));
  redirect("/rotinas");
}

// ─── Check & auto-delete if no admins ─────────────────────────────────────────

export async function checkAndCleanOrphanedRoutine(
  routineId: string
): Promise<void> {
  const adminCount = await db
    .select({ count: count() })
    .from(members)
    .where(
      and(eq(members.routineId, routineId), eq(members.role, "admin"))
    );

  if (adminCount[0].count === 0) {
    await db.delete(routines).where(eq(routines.id, routineId));
  }
}

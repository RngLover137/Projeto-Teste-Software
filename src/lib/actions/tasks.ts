"use server";

import { db } from "@/lib/db";
import { tasks, members } from "@/lib/db/schema";
import { getSession } from "@/lib/auth";
import { eq, and } from "drizzle-orm";
import type { Weekday, TaskStatus } from "@/lib/db/schema";
import type { ActionResult } from "./auth";
import { z } from "zod";

const TaskSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  weekday: z.enum([
    "monday","tuesday","wednesday","thursday","friday","saturday","sunday",
  ]),
  estimatedMinutes: z.coerce.number().optional(),
});

async function getMemberWithEditorAccess(routineId: string, userId: string) {
  const [member] = await db
    .select()
    .from(members)
    .where(and(eq(members.routineId, routineId), eq(members.userId, userId)))
    .limit(1);

  if (!member || member.role === "viewer") return null;
  return member;
}

// ─── Create Task ──────────────────────────────────────────────────────────────

export async function createTaskAction(
  routineId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado." };

  const member = await getMemberWithEditorAccess(routineId, session.userId);
  if (!member) return { success: false, error: "Você não tem permissão para criar tarefas." };

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    weekday: formData.get("weekday") as string,
    estimatedMinutes: formData.get("estimatedMinutes") || undefined,
  };

  const parsed = TaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  await db.insert(tasks).values({
    routineId,
    createdByMemberId: member.id,
    title: parsed.data.title,
    description: parsed.data.description,
    weekday: parsed.data.weekday,
    estimatedMinutes: parsed.data.estimatedMinutes,
  });

  return { success: true, message: "Tarefa criada." };
}

// ─── Update Task ──────────────────────────────────────────────────────────────

export async function updateTaskAction(
  taskId: string,
  routineId: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado." };

  const member = await getMemberWithEditorAccess(routineId, session.userId);
  if (!member) return { success: false, error: "Você não tem permissão para editar tarefas." };

  const raw = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    weekday: formData.get("weekday") as string,
    estimatedMinutes: formData.get("estimatedMinutes") || undefined,
  };

  const parsed = TaskSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  await db
    .update(tasks)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));

  return { success: true, message: "Tarefa atualizada." };
}

// ─── Update Task Status ───────────────────────────────────────────────────────

export async function updateTaskStatusAction(
  taskId: string,
  routineId: string,
  status: TaskStatus
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado." };

  const member = await getMemberWithEditorAccess(routineId, session.userId);
  if (!member) return { success: false, error: "Visualizadores não podem atualizar status." };

  await db
    .update(tasks)
    .set({ status, updatedAt: new Date() })
    .where(eq(tasks.id, taskId));

  return { success: true };
}

// ─── Delete Task ──────────────────────────────────────────────────────────────

export async function deleteTaskAction(
  taskId: string,
  routineId: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado." };

  const member = await getMemberWithEditorAccess(routineId, session.userId);
  if (!member) return { success: false, error: "Você não tem permissão para apagar tarefas." };

  await db.delete(tasks).where(eq(tasks.id, taskId));
  return { success: true, message: "Tarefa removida." };
}

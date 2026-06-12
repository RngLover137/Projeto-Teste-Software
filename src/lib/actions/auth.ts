"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, members } from "@/lib/db/schema";
import {
  hashPassword,
  verifyPassword,
  createToken,
  setSessionCookie,
  clearSessionCookie,
  getSession,
} from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const RegisterSchema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

const LoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export type ActionResult =
  | { success: true; message?: string }
  | { success: false; error: string };

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(
  formData: FormData
): Promise<ActionResult> {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: "Este e-mail já está cadastrado." };
  }

  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .returning();

  const token = await createToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  await setSessionCookie(token);
  redirect("/rotinas");
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = LoginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const { email, password } = parsed.data;

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return { success: false, error: "E-mail ou senha incorretos." };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: "E-mail ou senha incorretos." };
  }

  const token = await createToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });

  await setSessionCookie(token);
  redirect("/rotinas");
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}

// ─── Delete Account ───────────────────────────────────────────────────────────

export async function deleteAccountAction(): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Não autenticado." };

  // ON CASCADE handles members, routines created, tasks
  await db.delete(users).where(eq(users.id, session.userId));
  await clearSessionCookie();
  redirect("/login");
}

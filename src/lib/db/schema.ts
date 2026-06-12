import {
  pgTable,
  text,
  varchar,
  timestamp,
  uuid,
  pgEnum,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const memberRoleEnum = pgEnum("member_role", [
  "viewer",
  "editor",
  "admin",
]);

export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "done",
]);

export const weekdayEnum = pgEnum("weekday", [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const routines = pgTable("routines", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description"),
  createdByUserId: uuid("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  routineId: uuid("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  role: memberRoleEnum("role").notNull().default("viewer"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  routineId: uuid("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  createdByMemberId: uuid("created_by_member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  weekday: weekdayEnum("weekday").notNull(),
  status: taskStatusEnum("status").notNull().default("pending"),
  estimatedMinutes: integer("estimated_minutes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  members: many(members),
  routinesCreated: many(routines),
}));

export const routinesRelations = relations(routines, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [routines.createdByUserId],
    references: [users.id],
  }),
  members: many(members),
  tasks: many(tasks),
}));

export const membersRelations = relations(members, ({ one, many }) => ({
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  routine: one(routines, {
    fields: [members.routineId],
    references: [routines.id],
  }),
  tasksCreated: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  routine: one(routines, {
    fields: [tasks.routineId],
    references: [routines.id],
  }),
  createdBy: one(members, {
    fields: [tasks.createdByMemberId],
    references: [members.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Routine = typeof routines.$inferSelect;
export type NewRoutine = typeof routines.$inferInsert;
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type MemberRole = "viewer" | "editor" | "admin";
export type TaskStatus = "pending" | "in_progress" | "done";
export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

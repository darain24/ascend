import { index, integer, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  timezone: text("timezone").notNull().default("UTC"),
  title: text("title").notNull().default("Novice Hunter"),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

export const userStats = sqliteTable("user_stats", {
  userId: text("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
  level: integer("level").notNull().default(1),
  currentXp: integer("current_xp").notNull().default(0),
  xpToNext: integer("xp_to_next").notNull().default(100),
  rank: text("rank").notNull().default("E"),
  str: integer("str").notNull().default(1),
  vit: integer("vit").notNull().default(1),
  int: integer("int").notNull().default(1),
  agi: integer("agi").notNull().default(1),
  per: integer("per").notNull().default(1),
  discipline: integer("discipline").notNull().default(100),
});

export const quests = sqliteTable("quests", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  detail: text("detail").notNull().default(""),
  stat: text("stat").notNull(),
  type: text("type").notNull(),
  difficulty: text("difficulty").notNull(),
  xpReward: integer("xp_reward").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("quests_user_id_idx").on(table.userId)]);

export const questLogs = sqliteTable("quest_logs", {
  id: text("id").primaryKey(),
  questId: text("quest_id").notNull().references(() => quests.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  completedAt: integer("completed_at", { mode: "timestamp_ms" }).notNull(),
  xpAwarded: integer("xp_awarded").notNull(),
  wasOnTime: integer("was_on_time", { mode: "boolean" }).notNull().default(true),
}, (table) => [
  index("quest_logs_user_id_idx").on(table.userId),
  index("quest_logs_completed_at_idx").on(table.completedAt),
]);

export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  iconKey: text("icon_key").notNull(),
});

export const userAchievements = sqliteTable("user_achievements", {
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementId: text("achievement_id").notNull().references(() => achievements.id, { onDelete: "cascade" }),
  unlockedAt: integer("unlocked_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [primaryKey({ columns: [table.userId, table.achievementId] })]);

export const penaltyLogs = sqliteTable("penalty_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(),
  appliedAt: integer("applied_at", { mode: "timestamp_ms" }).notNull(),
  clearedAt: integer("cleared_at", { mode: "timestamp_ms" }),
}, (table) => [index("penalty_logs_user_id_idx").on(table.userId)]);

export const statHistory = sqliteTable("stat_history", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  stat: text("stat").notNull(),
  value: integer("value").notNull(),
  recordedAt: integer("recorded_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [index("stat_history_user_id_idx").on(table.userId)]);

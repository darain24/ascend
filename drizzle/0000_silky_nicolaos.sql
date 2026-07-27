CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon_key` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `achievements_key_unique` ON `achievements` (`key`);--> statement-breakpoint
CREATE TABLE `penalty_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`reason` text NOT NULL,
	`applied_at` integer NOT NULL,
	`cleared_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `penalty_logs_user_id_idx` ON `penalty_logs` (`user_id`);--> statement-breakpoint
CREATE TABLE `quest_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`quest_id` text NOT NULL,
	`user_id` text NOT NULL,
	`completed_at` integer NOT NULL,
	`xp_awarded` integer NOT NULL,
	`was_on_time` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`quest_id`) REFERENCES `quests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `quest_logs_user_id_idx` ON `quest_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `quest_logs_completed_at_idx` ON `quest_logs` (`completed_at`);--> statement-breakpoint
CREATE TABLE `quests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`stat` text NOT NULL,
	`type` text NOT NULL,
	`difficulty` text NOT NULL,
	`xp_reward` integer NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `quests_user_id_idx` ON `quests` (`user_id`);--> statement-breakpoint
CREATE TABLE `stat_history` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`stat` text NOT NULL,
	`value` integer NOT NULL,
	`recorded_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `stat_history_user_id_idx` ON `stat_history` (`user_id`);--> statement-breakpoint
CREATE TABLE `user_achievements` (
	`user_id` text NOT NULL,
	`achievement_id` text NOT NULL,
	`unlocked_at` integer NOT NULL,
	PRIMARY KEY(`user_id`, `achievement_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_stats` (
	`user_id` text PRIMARY KEY NOT NULL,
	`level` integer DEFAULT 1 NOT NULL,
	`current_xp` integer DEFAULT 0 NOT NULL,
	`xp_to_next` integer DEFAULT 100 NOT NULL,
	`rank` text DEFAULT 'E' NOT NULL,
	`str` integer DEFAULT 1 NOT NULL,
	`vit` integer DEFAULT 1 NOT NULL,
	`int` integer DEFAULT 1 NOT NULL,
	`agi` integer DEFAULT 1 NOT NULL,
	`per` integer DEFAULT 1 NOT NULL,
	`discipline` integer DEFAULT 100 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`display_name` text NOT NULL,
	`timezone` text DEFAULT 'UTC' NOT NULL,
	`title` text DEFAULT 'Novice Hunter' NOT NULL,
	`avatar_url` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
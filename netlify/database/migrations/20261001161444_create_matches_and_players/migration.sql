CREATE TABLE "matches" (
	"id" serial PRIMARY KEY,
	"title" text NOT NULL,
	"stadium" text NOT NULL,
	"location" text NOT NULL,
	"match_date" text NOT NULL,
	"match_time" text NOT NULL,
	"max_players" integer DEFAULT 14 NOT NULL,
	"team_count" integer DEFAULT 2 NOT NULL,
	"status" text DEFAULT 'OPEN' NOT NULL,
	"notes" text DEFAULT '',
	"admin_password" text DEFAULT 'admin123' NOT NULL,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" text PRIMARY KEY,
	"match_id" integer,
	"name" text NOT NULL,
	"note" text DEFAULT '',
	"team" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_match_id_matches_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE;
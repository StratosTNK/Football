import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  stadium: text("stadium").notNull(),
  location: text("location").notNull(),
  matchDate: text("match_date").notNull(),
  matchTime: text("match_time").notNull(),
  maxPlayers: integer("max_players").notNull().default(14),
  teamCount: integer("team_count").notNull().default(2),
  status: text("status").notNull().default("OPEN"),
  notes: text("notes").default(""),
  adminPassword: text("admin_password").notNull().default("admin123"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const players = pgTable("players", {
  id: text("id").primaryKey(),
  matchId: integer("match_id").references(() => matches.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  note: text("note").default(""),
  team: integer("team").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

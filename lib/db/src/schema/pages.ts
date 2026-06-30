import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const sitePagesTable = pgTable("site_pages", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type SitePage = typeof sitePagesTable.$inferSelect;

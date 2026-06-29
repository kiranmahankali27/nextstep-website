import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { companiesTable } from "./companies";
import { categoriesTable } from "./categories";

export const jobsTable = pgTable("jobs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  companyId: integer("company_id").notNull().references(() => companiesTable.id, { onDelete: "cascade" }),
  location: text("location").notNull(),
  remote: boolean("remote").notNull().default(false),
  jobType: text("job_type").notNull(), // full-time, part-time, internship, contract, walkin, government
  category: text("category").notNull(),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryDisplay: text("salary_display"),
  experience: text("experience").notNull(),
  education: text("education").notNull(),
  description: text("description").notNull(),
  skills: text("skills").array().notNull().default([]),
  selectionProcess: text("selection_process"),
  applyLink: text("apply_link").notNull(),
  deadline: text("deadline"),
  tags: text("tags").array().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  status: text("status").notNull().default("draft"), // published, draft
  views: integer("views").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertJobSchema = createInsertSchema(jobsTable).omit({ id: true, slug: true, views: true, createdAt: true, updatedAt: true });
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Job = typeof jobsTable.$inferSelect;

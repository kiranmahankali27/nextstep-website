import { Router } from "express";
import { db } from "@workspace/db";
import { jobsTable, companiesTable, insertJobSchema } from "@workspace/db";
import { eq, desc, ilike, and, or, sql, gte, lte } from "drizzle-orm";
import { z } from "zod/v4";

const router = Router();

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function buildJobResponse(job: typeof jobsTable.$inferSelect, company: typeof companiesTable.$inferSelect | null) {
  return {
    id: job.id,
    title: job.title,
    slug: job.slug,
    companyId: job.companyId,
    companyName: company?.name ?? "",
    companyLogo: company?.logo ?? null,
    companyWebsite: company?.website ?? null,
    location: job.location,
    remote: job.remote,
    jobType: job.jobType,
    category: job.category,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryDisplay: job.salaryDisplay,
    experience: job.experience,
    education: job.education,
    description: job.description,
    skills: job.skills,
    selectionProcess: job.selectionProcess,
    applyLink: job.applyLink,
    deadline: job.deadline,
    tags: job.tags,
    featured: job.featured,
    status: job.status,
    views: job.views,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

// GET /api/jobs - list with filters
router.get("/jobs", async (req, res) => {
  try {
    const { keyword, company: companyName, location, category, experience, salaryMin, salaryMax, remote, type, featured, status, page = "1", limit = "12" } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const offset = (pageNum - 1) * limitNum;

    const conditions: ReturnType<typeof eq>[] = [];

    if (status) {
      conditions.push(eq(jobsTable.status, status as string));
    } else {
      conditions.push(eq(jobsTable.status, "published"));
    }

    if (keyword) {
      conditions.push(
        or(
          ilike(jobsTable.title, `%${keyword}%`),
          ilike(jobsTable.description, `%${keyword}%`)
        ) as ReturnType<typeof eq>
      );
    }

    if (location) {
      conditions.push(ilike(jobsTable.location, `%${location}%`) as ReturnType<typeof eq>);
    }

    if (category) {
      conditions.push(ilike(jobsTable.category, `%${category}%`) as ReturnType<typeof eq>);
    }

    if (experience) {
      conditions.push(ilike(jobsTable.experience, `%${experience}%`) as ReturnType<typeof eq>);
    }

    if (remote === "true") {
      conditions.push(eq(jobsTable.remote, true));
    }

    if (type) {
      conditions.push(eq(jobsTable.jobType, type as string));
    }

    if (featured === "true") {
      conditions.push(eq(jobsTable.featured, true));
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [jobs, countResult] = await Promise.all([
      db.select().from(jobsTable).where(where).orderBy(desc(jobsTable.createdAt)).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(jobsTable).where(where),
    ]);

    const total = countResult[0]?.count ?? 0;

    const companyIds = [...new Set(jobs.map((j) => j.companyId))];
    const companies = companyIds.length > 0
      ? await db.select().from(companiesTable).where(sql`${companiesTable.id} = ANY(${sql.raw(`ARRAY[${companyIds.join(",")}]::int[]`)})`)
      : [];
    const companyMap = new Map(companies.map((c) => [c.id, c]));

    res.json({
      jobs: jobs.map((j) => buildJobResponse(j, companyMap.get(j.companyId) ?? null)),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    req.log.error({ err }, "listJobs failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/jobs
router.post("/jobs", async (req, res) => {
  try {
    const parsed = insertJobSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }

    const data = parsed.data;
    const baseSlug = toSlug(data.title);
    const uniqueSlug = `${baseSlug}-${Date.now()}`;

    const [job] = await db.insert(jobsTable).values({ ...data, slug: uniqueSlug }).returning();
    const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, job.companyId));
    res.status(201).json(buildJobResponse(job, company ?? null));
  } catch (err) {
    req.log.error({ err }, "createJob failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/jobs/featured
router.get("/jobs/featured", async (req, res) => {
  try {
    const limit = Math.min(20, parseInt((req.query.limit as string) || "6", 10));
    const jobs = await db.select().from(jobsTable)
      .where(and(eq(jobsTable.featured, true), eq(jobsTable.status, "published")))
      .orderBy(desc(jobsTable.createdAt))
      .limit(limit);

    const companyIds = [...new Set(jobs.map((j) => j.companyId))];
    const companies = companyIds.length > 0
      ? await db.select().from(companiesTable).where(sql`${companiesTable.id} = ANY(${sql.raw(`ARRAY[${companyIds.join(",")}]::int[]`)})`)
      : [];
    const companyMap = new Map(companies.map((c) => [c.id, c]));

    res.json(jobs.map((j) => buildJobResponse(j, companyMap.get(j.companyId) ?? null)));
  } catch (err) {
    req.log.error({ err }, "listFeaturedJobs failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/jobs/trending
router.get("/jobs/trending", async (req, res) => {
  try {
    const limit = Math.min(20, parseInt((req.query.limit as string) || "8", 10));
    const jobs = await db.select().from(jobsTable)
      .where(eq(jobsTable.status, "published"))
      .orderBy(desc(jobsTable.views), desc(jobsTable.createdAt))
      .limit(limit);

    const companyIds = [...new Set(jobs.map((j) => j.companyId))];
    const companies = companyIds.length > 0
      ? await db.select().from(companiesTable).where(sql`${companiesTable.id} = ANY(${sql.raw(`ARRAY[${companyIds.join(",")}]::int[]`)})`)
      : [];
    const companyMap = new Map(companies.map((c) => [c.id, c]));

    res.json(jobs.map((j) => buildJobResponse(j, companyMap.get(j.companyId) ?? null)));
  } catch (err) {
    req.log.error({ err }, "listTrendingJobs failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/jobs/latest
router.get("/jobs/latest", async (req, res) => {
  try {
    const limit = Math.min(20, parseInt((req.query.limit as string) || "10", 10));
    const jobs = await db.select().from(jobsTable)
      .where(eq(jobsTable.status, "published"))
      .orderBy(desc(jobsTable.createdAt))
      .limit(limit);

    const companyIds = [...new Set(jobs.map((j) => j.companyId))];
    const companies = companyIds.length > 0
      ? await db.select().from(companiesTable).where(sql`${companiesTable.id} = ANY(${sql.raw(`ARRAY[${companyIds.join(",")}]::int[]`)})`)
      : [];
    const companyMap = new Map(companies.map((c) => [c.id, c]));

    res.json(jobs.map((j) => buildJobResponse(j, companyMap.get(j.companyId) ?? null)));
  } catch (err) {
    req.log.error({ err }, "listLatestJobs failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/jobs/:id
router.get("/jobs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, id));
    if (!job) { res.status(404).json({ error: "Job not found" }); return; }

    const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, job.companyId));
    res.json(buildJobResponse(job, company ?? null));
  } catch (err) {
    req.log.error({ err }, "getJob failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/jobs/:id
router.patch("/jobs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    const [updated] = await db.update(jobsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(jobsTable.id, id))
      .returning();

    if (!updated) { res.status(404).json({ error: "Job not found" }); return; }

    const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, updated.companyId));
    res.json(buildJobResponse(updated, company ?? null));
  } catch (err) {
    req.log.error({ err }, "updateJob failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/jobs/:id
router.delete("/jobs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    await db.delete(jobsTable).where(eq(jobsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "deleteJob failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/jobs/:id/view
router.post("/jobs/:id/view", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

    await db.update(jobsTable)
      .set({ views: sql`${jobsTable.views} + 1` })
      .where(eq(jobsTable.id, id));

    res.json({ success: true, message: "View recorded" });
  } catch (err) {
    req.log.error({ err }, "recordJobView failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

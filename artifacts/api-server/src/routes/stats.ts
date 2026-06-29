import { Router } from "express";
import { db } from "@workspace/db";
import { jobsTable, companiesTable, categoriesTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

function buildJobResponse(job: typeof jobsTable.$inferSelect, companyName: string, companyLogo: string | null, companyWebsite: string | null) {
  return {
    id: job.id,
    title: job.title,
    slug: job.slug,
    companyId: job.companyId,
    companyName,
    companyLogo,
    companyWebsite,
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

// GET /api/stats/platform
router.get("/stats/platform", async (req, res) => {
  try {
    const [totalJobs, totalCompanies, totalCategories, totalViews, activeJobs] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(jobsTable),
      db.select({ count: sql<number>`count(*)::int` }).from(companiesTable),
      db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable),
      db.select({ total: sql<number>`coalesce(sum(views), 0)::int` }).from(jobsTable),
      db.select({ count: sql<number>`count(*)::int` }).from(jobsTable).where(eq(jobsTable.status, "published")),
    ]);

    res.json({
      totalJobs: totalJobs[0]?.count ?? 0,
      totalCompanies: totalCompanies[0]?.count ?? 0,
      totalCategories: totalCategories[0]?.count ?? 0,
      totalViews: totalViews[0]?.total ?? 0,
      activeJobs: activeJobs[0]?.count ?? 0,
    });
  } catch (err) {
    req.log.error({ err }, "getPlatformStats failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/stats/admin
router.get("/stats/admin", async (req, res) => {
  try {
    const [totalJobs, publishedJobs, draftJobs, totalCompanies, totalCategories, totalViews] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(jobsTable),
      db.select({ count: sql<number>`count(*)::int` }).from(jobsTable).where(eq(jobsTable.status, "published")),
      db.select({ count: sql<number>`count(*)::int` }).from(jobsTable).where(eq(jobsTable.status, "draft")),
      db.select({ count: sql<number>`count(*)::int` }).from(companiesTable),
      db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable),
      db.select({ total: sql<number>`coalesce(sum(views), 0)::int` }).from(jobsTable),
    ]);

    const jobsByCategory = await db
      .select({ category: jobsTable.category, count: sql<number>`count(*)::int` })
      .from(jobsTable)
      .groupBy(jobsTable.category)
      .orderBy(desc(sql`count(*)`))
      .limit(10);

    const jobsByType = await db
      .select({ type: jobsTable.jobType, count: sql<number>`count(*)::int` })
      .from(jobsTable)
      .groupBy(jobsTable.jobType)
      .orderBy(desc(sql`count(*)`));

    const recentJobsRaw = await db
      .select({ job: jobsTable, company: companiesTable })
      .from(jobsTable)
      .leftJoin(companiesTable, eq(jobsTable.companyId, companiesTable.id))
      .orderBy(desc(jobsTable.createdAt))
      .limit(5);

    const recentJobs = recentJobsRaw.map(({ job, company }) =>
      buildJobResponse(job, company?.name ?? "", company?.logo ?? null, company?.website ?? null)
    );

    res.json({
      totalJobs: totalJobs[0]?.count ?? 0,
      publishedJobs: publishedJobs[0]?.count ?? 0,
      draftJobs: draftJobs[0]?.count ?? 0,
      totalCompanies: totalCompanies[0]?.count ?? 0,
      totalCategories: totalCategories[0]?.count ?? 0,
      totalViews: totalViews[0]?.total ?? 0,
      jobsByCategory: jobsByCategory.map((r) => ({ category: r.category, count: r.count })),
      jobsByType: jobsByType.map((r) => ({ type: r.type, count: r.count })),
      recentJobs,
    });
  } catch (err) {
    req.log.error({ err }, "getAdminStats failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/stats/top-jobs
router.get("/stats/top-jobs", async (req, res) => {
  try {
    const limit = Math.min(20, parseInt((req.query.limit as string) || "5", 10));

    const topJobsRaw = await db
      .select({ job: jobsTable, company: companiesTable })
      .from(jobsTable)
      .leftJoin(companiesTable, eq(jobsTable.companyId, companiesTable.id))
      .where(eq(jobsTable.status, "published"))
      .orderBy(desc(jobsTable.views))
      .limit(limit);

    const topJobs = topJobsRaw.map(({ job, company }) =>
      buildJobResponse(job, company?.name ?? "", company?.logo ?? null, company?.website ?? null)
    );

    res.json(topJobs);
  } catch (err) {
    req.log.error({ err }, "getTopViewedJobs failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

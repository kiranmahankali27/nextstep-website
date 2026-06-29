import { Router } from "express";
import { db } from "@workspace/db";
import { companiesTable, jobsTable, insertCompanySchema } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";

const router = Router();

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

async function buildCompanyResponse(company: typeof companiesTable.$inferSelect) {
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(jobsTable)
    .where(eq(jobsTable.companyId, company.id));

  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    logo: company.logo,
    website: company.website,
    description: company.description,
    industry: company.industry,
    size: company.size,
    location: company.location,
    featured: company.featured,
    jobCount: countResult?.count ?? 0,
    createdAt: company.createdAt.toISOString(),
  };
}

// GET /api/companies
router.get("/companies", async (req, res) => {
  try {
    const { featured, limit = "12", page = "1" } = req.query;
    const limitNum = Math.min(50, parseInt(limit as string, 10) || 12);
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const offset = (pageNum - 1) * limitNum;

    const where = featured === "true" ? eq(companiesTable.featured, true) : undefined;

    const companies = await db.select().from(companiesTable).where(where)
      .orderBy(desc(companiesTable.featured), desc(companiesTable.createdAt))
      .limit(limitNum).offset(offset);

    const results = await Promise.all(companies.map(buildCompanyResponse));
    res.json(results);
  } catch (err) {
    req.log.error({ err }, "listCompanies failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/companies
router.post("/companies", async (req, res) => {
  try {
    const parsed = insertCompanySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }
    const data = parsed.data;
    const baseSlug = toSlug(data.name);
    const slug = `${baseSlug}-${Date.now()}`;
    const [company] = await db.insert(companiesTable).values({ ...data, slug }).returning();
    res.status(201).json(await buildCompanyResponse(company));
  } catch (err) {
    req.log.error({ err }, "createCompany failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/companies/:id
router.get("/companies/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, id));
    if (!company) { res.status(404).json({ error: "Company not found" }); return; }
    res.json(await buildCompanyResponse(company));
  } catch (err) {
    req.log.error({ err }, "getCompany failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/companies/:id
router.patch("/companies/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const [updated] = await db.update(companiesTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(companiesTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Company not found" }); return; }
    res.json(await buildCompanyResponse(updated));
  } catch (err) {
    req.log.error({ err }, "updateCompany failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/companies/:id
router.delete("/companies/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    await db.delete(companiesTable).where(eq(companiesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "deleteCompany failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

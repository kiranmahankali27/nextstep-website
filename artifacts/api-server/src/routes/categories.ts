import { Router } from "express";
import { db } from "@workspace/db";
import { categoriesTable, jobsTable, insertCategorySchema } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router = Router();

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
}

async function buildCategoryResponse(cat: typeof categoriesTable.$inferSelect) {
  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(jobsTable)
    .where(eq(jobsTable.category, cat.name));

  return {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    icon: cat.icon,
    description: cat.description,
    jobCount: countResult?.count ?? 0,
    createdAt: cat.createdAt.toISOString(),
  };
}

// GET /api/categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await db.select().from(categoriesTable).orderBy(desc(categoriesTable.createdAt));
    const results = await Promise.all(categories.map(buildCategoryResponse));
    res.json(results);
  } catch (err) {
    req.log.error({ err }, "listCategories failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/categories
router.post("/categories", async (req, res) => {
  try {
    const parsed = insertCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Validation failed", details: parsed.error.issues });
      return;
    }
    const data = parsed.data;
    const slug = toSlug(data.name);
    const [cat] = await db.insert(categoriesTable).values({ ...data, slug }).returning();
    res.status(201).json(await buildCategoryResponse(cat));
  } catch (err) {
    req.log.error({ err }, "createCategory failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/categories/:id
router.patch("/categories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    const [updated] = await db.update(categoriesTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(categoriesTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Category not found" }); return; }
    res.json(await buildCategoryResponse(updated));
  } catch (err) {
    req.log.error({ err }, "updateCategory failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/categories/:id
router.delete("/categories/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
    await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "deleteCategory failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

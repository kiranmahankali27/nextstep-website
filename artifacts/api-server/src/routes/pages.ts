import { Router } from "express";
import { db } from "@workspace/db";
import { sitePagesTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const DEFAULT_PAGES: Record<string, { title: string; content: string }> = {
  about: {
    title: "About Us",
    content: "Welcome to NextStep — India's modern career platform for students and fresh graduates.\n\nThis page is managed by the admin. Please log in to the admin portal and update the content.",
  },
  contact: {
    title: "Contact Us",
    content: "For any queries, reach out to us.\n\nThis page is managed by the admin. Please log in to the admin portal and update the content.",
  },
  "privacy-policy": {
    title: "Privacy Policy",
    content: "Your privacy is important to us.\n\nThis page is managed by the admin. Please log in to the admin portal and update the content.",
  },
  "terms-of-service": {
    title: "Terms of Service",
    content: "By using NextStep, you agree to our terms and conditions.\n\nThis page is managed by the admin. Please log in to the admin portal and update the content.",
  },
};

async function getOrCreatePage(slug: string) {
  const [existing] = await db.select().from(sitePagesTable).where(eq(sitePagesTable.slug, slug));
  if (existing) return existing;

  const defaults = DEFAULT_PAGES[slug];
  if (!defaults) return null;

  const [created] = await db.insert(sitePagesTable).values({
    slug,
    title: defaults.title,
    content: defaults.content,
  }).returning();
  return created;
}

// GET /api/pages — list all pages (for admin)
router.get("/pages", async (req, res) => {
  try {
    const pages = await db.select().from(sitePagesTable);
    if (pages.length === 0) {
      const created = await Promise.all(
        Object.keys(DEFAULT_PAGES).map(slug => getOrCreatePage(slug))
      );
      res.json(created.filter(Boolean));
      return;
    }
    res.json(pages);
  } catch (err) {
    req.log.error({ err }, "listPages failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/pages/:slug — public
router.get("/pages/:slug", async (req, res) => {
  try {
    const page = await getOrCreatePage(req.params.slug);
    if (!page) { res.status(404).json({ error: "Page not found" }); return; }
    res.json(page);
  } catch (err) {
    req.log.error({ err }, "getPage failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/admin/pages/:slug — admin update
router.patch("/admin/pages/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content } = req.body as { title?: string; content?: string };

    const existing = await getOrCreatePage(slug);
    if (!existing) { res.status(404).json({ error: "Page not found" }); return; }

    const [updated] = await db
      .update(sitePagesTable)
      .set({ title: title ?? existing.title, content: content ?? existing.content, updatedAt: new Date() })
      .where(eq(sitePagesTable.slug, slug))
      .returning();

    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "updatePage failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

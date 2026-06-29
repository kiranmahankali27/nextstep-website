import { Router } from "express";
import { db } from "@workspace/db";
import { newsletterSubscribersTable, insertNewsletterSchema } from "@workspace/db";

const router = Router();

// POST /api/newsletter/subscribe
router.post("/newsletter/subscribe", async (req, res) => {
  try {
    const parsed = insertNewsletterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Valid email required" });
      return;
    }
    await db.insert(newsletterSubscribersTable).values(parsed.data).onConflictDoNothing();
    res.json({ success: true, message: "Subscribed successfully!" });
  } catch (err) {
    req.log.error({ err }, "subscribeNewsletter failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

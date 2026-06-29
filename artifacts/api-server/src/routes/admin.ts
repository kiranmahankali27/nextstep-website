import { Router } from "express";

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "career@admin2024";

// Simple token store (in-memory for development; replace with DB/JWT in production)
const validTokens = new Set<string>();

function generateToken(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// POST /api/admin/login
router.post("/admin/login", (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const token = generateToken();
  validTokens.add(token);
  res.json({ success: true, message: "Login successful", token });
});

// POST /api/admin/logout
router.post("/admin/logout", (req, res) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (token) validTokens.delete(token);
  res.json({ success: true, message: "Logged out" });
});

// GET /api/admin/me
router.get("/admin/me", (req, res) => {
  const auth = req.headers.authorization;
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || !validTokens.has(token)) {
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true, username: ADMIN_USERNAME });
});

export { validTokens };
export default router;

import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { adminCreateUserSchema, createStoreSchema } from "../validators/schemas.js";

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole("ADMIN"));

adminRouter.get("/dashboard", async (_req, res) => {
  const [userCount, storeCount, ratingCount] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count(),
  ]);
  res.json({ userCount, storeCount, ratingCount });
});

adminRouter.post("/users", async (req, res) => {
  const parsed = adminCreateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { name, email, address, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, address, passwordHash, role },
    select: { id: true, name: true, email: true, role: true, address: true },
  });
  res.status(201).json({ user });
});

adminRouter.post("/stores", async (req, res) => {
  const parsed = createStoreSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { name, email, address, ownerEmail } = parsed.data;

  let ownerId = null;
  if (ownerEmail) {
    const owner = await prisma.user.findUnique({ where: { email: ownerEmail } });
    if (!owner) return res.status(404).json({ error: "Owner email not found" });
    if (owner.role !== "OWNER") {
      await prisma.user.update({ where: { id: owner.id }, data: { role: "OWNER" } });
    }
    ownerId = owner.id;
  }

  const exists = await prisma.store.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: "Store email already in use" });

  const store = await prisma.store.create({ data: { name, email, address, ownerId } });
  res.status(201).json({ store });
});

adminRouter.get("/users", async (req, res) => {
  const { name, email, address, role, sortBy = "name", order = "asc" } = req.query;
  const where = {};
  if (typeof name === "string") where.name = { contains: name, mode: "insensitive" };
  if (typeof email === "string") where.email = { contains: email, mode: "insensitive" };
  if (typeof address === "string") where.address = { contains: address, mode: "insensitive" };
  if (typeof role === "string" && ["ADMIN", "USER", "OWNER"].includes(role)) {
    where.role = role;
  }

  const allowedSort = ["name", "email", "address", "role", "createdAt"];
  const sortField = allowedSort.includes(sortBy) ? sortBy : "name";
  const sortOrder = order === "desc" ? "desc" : "asc";

  const users = await prisma.user.findMany({
    where,
    orderBy: { [sortField]: sortOrder },
    select: { id: true, name: true, email: true, address: true, role: true, createdAt: true },
  });
  res.json({ users });
});

adminRouter.get("/users/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      stores: {
        select: { id: true, name: true, ratings: { select: { value: true } } },
      },
    },
  });
  if (!user) return res.status(404).json({ error: "User not found" });

  let ownerRating = null;
  if (user.role === "OWNER" && user.stores.length > 0) {
    const allValues = user.stores.flatMap((s) => s.ratings.map((r) => r.value));
    if (allValues.length > 0) {
      ownerRating = allValues.reduce((a, b) => a + b, 0) / allValues.length;
    }
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
      ownerRating,
      stores: user.stores.map((s) => ({ id: s.id, name: s.name })),
    },
  });
});

adminRouter.get("/stores", async (req, res) => {
  const { name, email, address, sortBy = "name", order = "asc" } = req.query;
  const where = {};
  if (typeof name === "string") where.name = { contains: name, mode: "insensitive" };
  if (typeof email === "string") where.email = { contains: email, mode: "insensitive" };
  if (typeof address === "string") where.address = { contains: address, mode: "insensitive" };

  const allowedSort = ["name", "email", "address", "createdAt"];
  const sortField = allowedSort.includes(sortBy) ? sortBy : "name";
  const sortOrder = order === "desc" ? "desc" : "asc";

  const stores = await prisma.store.findMany({
    where,
    orderBy: { [sortField]: sortOrder },
    include: {
      ratings: { select: { value: true } },
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  const result = stores.map((s) => {
    const avg =
      s.ratings.length === 0
        ? null
        : s.ratings.reduce((a, b) => a + b.value, 0) / s.ratings.length;
    return { id: s.id, name: s.name, email: s.email, address: s.address, owner: s.owner, rating: avg, ratingCount: s.ratings.length };
  });
  res.json({ stores: result });
});

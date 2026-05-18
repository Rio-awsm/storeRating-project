import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { ratingSchema } from "../validators/schemas.js";

export const storesRouter = Router();

storesRouter.get("/", authenticate, requireRole("USER", "ADMIN"), async (req, res) => {
  const { search, sortBy = "name", order = "asc" } = req.query;
  const where = {};
  if (typeof search === "string" && search.length > 0) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { address: { contains: search, mode: "insensitive" } },
    ];
  }

  const allowedSort = ["name", "address", "createdAt"];
  const sortField = allowedSort.includes(sortBy) ? sortBy : "name";
  const sortOrder = order === "desc" ? "desc" : "asc";

  const stores = await prisma.store.findMany({
    where,
    orderBy: { [sortField]: sortOrder },
    include: { ratings: { select: { value: true, userId: true } } },
  });

  const userId = req.user.sub;
  const result = stores.map((s) => {
    const avg =
      s.ratings.length === 0
        ? null
        : s.ratings.reduce((a, b) => a + b.value, 0) / s.ratings.length;
    const mine = s.ratings.find((r) => r.userId === userId);
    return { id: s.id, name: s.name, address: s.address, rating: avg, ratingCount: s.ratings.length, myRating: mine?.value ?? null };
  });
  res.json({ stores: result });
});

storesRouter.put("/:id/rating", authenticate, requireRole("USER"), async (req, res) => {
  const parsed = ratingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const storeId = req.params.id;
  const userId = req.user.sub;

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) return res.status(404).json({ error: "Store not found" });

  const rating = await prisma.rating.upsert({
    where: { userId_storeId: { userId, storeId } },
    create: { userId, storeId, value: parsed.data.value },
    update: { value: parsed.data.value },
  });
  res.json({ rating });
});

import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticate, requireRole } from "../middleware/auth";

export const ownerRouter = Router();

ownerRouter.use(authenticate, requireRole("OWNER"));

ownerRouter.get("/dashboard", async (req, res) => {
  const ownerId = req.user!.sub;
  const stores = await prisma.store.findMany({
    where: { ownerId },
    include: {
      ratings: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  const result = stores.map((s) => {
    const values = s.ratings.map((r) => r.value);
    const avg =
      values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length;
    return {
      id: s.id,
      name: s.name,
      address: s.address,
      averageRating: avg,
      ratingCount: values.length,
      raters: s.ratings.map((r) => ({
        userId: r.user.id,
        name: r.user.name,
        email: r.user.email,
        value: r.value,
        ratedAt: r.updatedAt,
      })),
    };
  });

  res.json({ stores: result });
});

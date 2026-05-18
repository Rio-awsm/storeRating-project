import "dotenv/config";

function required(name) {
  const v = process.env[name];
  if (!v || v.length === 0) throw new Error(`Missing env var: ${name}`);
  return v;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
};

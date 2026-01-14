import "dotenv/config";
import { defineConfig } from "prisma/config";

const getEnv = (key: string): string => {
  const v = process.env[key as keyof NodeJS.ProcessEnv];
  if (!v) throw new Error(`Missing required env var ${key}`);
  return v;
};

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Use direct connection for schema operations (db push/migrate).
    url: getEnv("DIRECT_URL"),
  },
});

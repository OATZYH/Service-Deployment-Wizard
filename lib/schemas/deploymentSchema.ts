import { z } from "zod";

const baseFields = {
  projectName: z.string().min(1, "Project name is required"),
  owner: z.string().min(1, "Owner is required"),
  environment: z.enum(["dev", "staging", "prod"]),
};

const databaseSchema = z.object({
  ...baseFields,
  serviceType: z.literal("database"),
  engine: z.enum(["postgres", "mysql"]),
  storageSize: z
    .number({ error: "Storage size must be a number" })
    .positive("Storage size must be greater than 0"),
  // web app fields — optional so the discriminated union stays flat
  framework: z.enum(["nextjs", "nuxt", "python"]).optional(),
  publicAccess: z.boolean().optional(),
});

const webAppSchema = z.object({
  ...baseFields,
  serviceType: z.literal("webapp"),
  framework: z.enum(["nextjs", "nuxt", "python"]),
  publicAccess: z.boolean(),
  // database fields — optional so the discriminated union stays flat
  engine: z.enum(["postgres", "mysql"]).optional(),
  storageSize: z.number().optional(),
});

export const deploymentSchema = z.discriminatedUnion("serviceType", [
  databaseSchema,
  webAppSchema,
]);

export type DeploymentFormValues = z.infer<typeof deploymentSchema>;

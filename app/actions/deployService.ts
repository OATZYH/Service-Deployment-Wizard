"use server";

import {
  deploymentSchema,
  type DeploymentFormValues,
} from "@/lib/schemas/deploymentSchema";

export async function validateDeployment(data: DeploymentFormValues) {
  const parsed = deploymentSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Validation failed. Please check your input.",
    };
  }

  return {
    success: true as const,
    data: parsed.data,
    message: `Service "${parsed.data.projectName}" has been successfully deployed to ${parsed.data.environment}!`,
  };
}

export async function deployToMongoDB(data: DeploymentFormValues) {
  const parsed = deploymentSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false as const,
      message: "Validation failed. Please check your input.",
    };
  }

  try {
    // Dynamic import to avoid loading mongodb on the client
    const clientPromise = (await import("@/lib/mongodb")).default;
    const client = await clientPromise;
    const db = client.db("service-deployment-wizard");

    // Strip undefined values
    const cleanData = Object.fromEntries(
      Object.entries(parsed.data).filter(([, v]) => v !== undefined)
    );

    await db.collection("deployments").insertOne({
      ...cleanData,
      createdAt: new Date(),
    });

    return {
      success: true as const,
      message: `Service "${parsed.data.projectName}" has been successfully deployed to ${parsed.data.environment}! (saved to MongoDB)`,
    };
  } catch (error) {
    console.error("MongoDB error:", error);
    return {
      success: false as const,
      message: "Failed to save to MongoDB Atlas. Check your connection string.",
    };
  }
}

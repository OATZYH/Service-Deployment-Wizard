"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DeploymentFormValues } from "@/lib/schemas/deploymentSchema";
import {
  validateDeployment,
  deployToMongoDB,
} from "@/app/actions/deployService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckIcon,
  Loader2Icon,
  RocketIcon,
  FlameIcon,
  DatabaseIcon,
  CodeIcon,
} from "lucide-react";

// ── Lookups ──

const LABEL_MAP: Record<string, string> = {
  projectName: "Project Name",
  owner: "Owner",
  environment: "Environment",
  serviceType: "Service Type",
  engine: "Database Engine",
  storageSize: "Storage Size",
  framework: "Framework",
  publicAccess: "Public Access",
};

const VALUE_MAP: Record<string, string> = {
  dev: "Development",
  staging: "Staging",
  prod: "Production",
  database: "Database",
  webapp: "Web App",
  postgres: "PostgreSQL",
  mysql: "MySQL",
  nextjs: "Next.js",
  nuxt: "Nuxt",
  python: "Python",
};

function formatValue(key: string, value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return `${value} GB`;
  if (typeof value === "string") return VALUE_MAP[value] ?? value;
  return String(value);
}

// ── Submit methods ──

type SubmitMethod = "firestore" | "mongodb" | "raw";

const METHODS: { id: SubmitMethod; label: string; icon: React.ReactNode }[] = [
  { id: "firestore", label: "Firestore", icon: <FlameIcon className="size-3.5" /> },
  { id: "mongodb", label: "MongoDB", icon: <DatabaseIcon className="size-3.5" /> },
  { id: "raw", label: "Raw Result", icon: <CodeIcon className="size-3.5" /> },
];

// ── Component ──

export function StepReview() {
  const { getValues } = useFormContext<DeploymentFormValues>();
  const [method, setMethod] = useState<SubmitMethod>("firestore");
  const [status, setStatus] = useState<
    "idle" | "deploying" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [rawJson, setRawJson] = useState<string | null>(null);

  const values = getValues();

  // Build display fields
  const displayFields: { key: string; label: string; value: string }[] = [];
  const baseKeys = ["projectName", "owner", "environment", "serviceType"];
  const dynamicKeys =
    values.serviceType === "database"
      ? ["engine", "storageSize"]
      : ["framework", "publicAccess"];

  for (const key of [...baseKeys, ...dynamicKeys]) {
    const val = values[key as keyof typeof values];
    if (val !== undefined && val !== null) {
      displayFields.push({
        key,
        label: LABEL_MAP[key] ?? key,
        value: formatValue(key, val),
      });
    }
  }

  // ── Handlers ──

  const handleSwitchMethod = (newMethod: SubmitMethod) => {
    setMethod(newMethod);
    setStatus("idle");
    setMessage("");
    setRawJson(null);
  };

  const handleDeployFirestore = async () => {
    setStatus("deploying");
    setMessage("");
    try {
      const result = await validateDeployment(values);
      if (!result.success) {
        setStatus("error");
        setMessage(result.message);
        return;
      }

      const cleanValues = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== undefined)
      );
      await addDoc(collection(db, "deployments"), {
        ...cleanValues,
        createdAt: serverTimestamp(),
      });

      setStatus("success");
      setMessage(result.message);
    } catch (error) {
      console.error("Firestore error:", error);
      const errMsg = error instanceof Error ? error.message : String(error);
      setStatus("error");
      setMessage(`Failed to save to Firestore: ${errMsg}`);
    }
  };

  const handleDeployMongoDB = async () => {
    setStatus("deploying");
    setMessage("");
    try {
      const result = await deployToMongoDB(values);
      if (result.success) {
        setStatus("success");
      } else {
        setStatus("error");
      }
      setMessage(result.message);
    } catch (error) {
      console.error("MongoDB error:", error);
      const errMsg = error instanceof Error ? error.message : String(error);
      setStatus("error");
      setMessage(`Failed to connect to MongoDB Atlas: ${errMsg}`);
    }
  };

  const handleRawResult = async () => {
    setStatus("deploying");
    setMessage("");
    try {
      const result = await validateDeployment(values);
      if (!result.success) {
        setStatus("error");
        setMessage(result.message);
        return;
      }

      const cleanValues = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== undefined)
      );
      setRawJson(JSON.stringify({ ...cleanValues, createdAt: new Date().toISOString() }, null, 2));
      setStatus("success");
      setMessage("Validated successfully. Raw payload shown below.");
    } catch (error) {
      console.error("Validation error:", error);
      const errMsg = error instanceof Error ? error.message : String(error);
      setStatus("error");
      setMessage(`Validation failed: ${errMsg}`);
    }
  };

  const handleDeploy = () => {
    if (method === "firestore") return handleDeployFirestore();
    if (method === "mongodb") return handleDeployMongoDB();
    return handleRawResult();
  };

  // ── Status UI ──

  let statusBanner: React.ReactNode = null;
  if (status === "success") {
    statusBanner = (
      <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-2 border border-emerald-500/20 p-3 text-xs">
        <CheckIcon className="size-4 shrink-0" />
        {message}
      </div>
    );
  } else if (status === "error") {
    statusBanner = (
      <div className="bg-destructive/10 text-destructive flex items-center gap-2 border border-destructive/20 p-3 text-xs">
        {message}
      </div>
    );
  }

  let buttonContent: React.ReactNode;
  if (status === "deploying") {
    buttonContent = (
      <>
        <Loader2Icon className="animate-spin" />
        {method === "raw" ? "Validating…" : "Deploying…"}
      </>
    );
  } else if (status === "success") {
    buttonContent = (
      <>
        <CheckIcon />
        {method === "raw" ? "Done" : "Deployed"}
      </>
    );
  } else {
    buttonContent = (
      <>
        <RocketIcon />
        {method === "raw" ? "Show Result" : "Deploy"}
      </>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Method Tabs ── */}
      <div className="flex gap-1 border-b border-border">
        {METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => handleSwitchMethod(m.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors -mb-px border-b-2 ${method === m.id
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
          >
            {m.icon}
            {m.label}
          </button>
        ))}
      </div>

      {/* ── Summary Card ── */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Deployment Summary
            <Badge variant="outline">
              {VALUE_MAP[values.serviceType] ?? values.serviceType}
            </Badge>
          </CardTitle>
          <CardDescription>
            Review your configuration before deploying.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5">
            {displayFields.map(({ key, label, value }) => (
              <div key={key} className="contents">
                <dt className="text-muted-foreground text-xs font-medium">
                  {label}
                </dt>
                <dd className="text-xs">{value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>

      {statusBanner}

      {/* ── Raw JSON output ── */}
      {rawJson && (
        <pre className="bg-muted overflow-auto rounded-none border p-3 text-xs leading-relaxed">
          <code>{rawJson}</code>
        </pre>
      )}

      <Button
        type="button"
        onClick={handleDeploy}
        disabled={status === "deploying" || status === "success"}
        className="w-full"
      >
        {buttonContent}
      </Button>
    </div>
  );
}

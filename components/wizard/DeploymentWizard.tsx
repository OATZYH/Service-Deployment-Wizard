"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  deploymentSchema,
  type DeploymentFormValues,
} from "@/lib/schemas/deploymentSchema";
import { StepGeneralInfo } from "./StepGeneralInfo";
import { StepServiceSelection } from "./StepServiceSelection";
import { StepDynamicConfig } from "./StepDynamicConfig";
import { StepReview } from "./StepReview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";

const STEPS = [
  { title: "General Info", description: "Provide basic project details" },
  { title: "Service Selection", description: "Choose the type of service" },
  { title: "Configuration", description: "Set up service-specific options" },
  { title: "Review & Deploy", description: "Confirm and launch your service" },
] as const;

/**
 * Fields to validate per step. Step 3 (index 2) has dynamic fields
 * validated conditionally inside `validateCurrentStep`.
 */

type FormMethods = ReturnType<typeof useForm<DeploymentFormValues>>;

function validateGeneralInfo(methods: FormMethods): boolean {
  const { projectName, owner, environment } = methods.getValues();
  let valid = true;

  if (!projectName || projectName.trim() === "") {
    methods.setError("projectName", {
      type: "manual",
      message: "Project name is required",
    });
    valid = false;
  }
  if (!owner || owner.trim() === "") {
    methods.setError("owner", {
      type: "manual",
      message: "Owner is required",
    });
    valid = false;
  }
  if (!environment) {
    methods.setError("environment", {
      type: "manual",
      message: "Environment is required",
    });
    valid = false;
  }
  return valid;
}

function validateServiceSelection(methods: FormMethods): boolean {
  const serviceType = methods.getValues("serviceType");
  if (!serviceType) {
    methods.setError("serviceType", {
      type: "manual",
      message: "Please select a service type",
    });
    return false;
  }
  return true;
}

function validateDynamicConfig(methods: FormMethods): boolean {
  const values = methods.getValues();
  let valid = true;

  if (values.serviceType === "database") {
    if (!values.engine) {
      methods.setError("engine", {
        type: "manual",
        message: "Please select a database engine",
      });
      valid = false;
    }
    if (!values.storageSize || values.storageSize <= 0) {
      methods.setError("storageSize", {
        type: "manual",
        message: "Storage size must be greater than 0",
      });
      valid = false;
    }
    return valid;
  }

  if (values.serviceType === "webapp") {
    if (!values.framework) {
      methods.setError("framework", {
        type: "manual",
        message: "Please select a framework",
      });
      valid = false;
    }
    return valid;
  }

  return false;
}

export function DeploymentWizard() {
  const [currentStep, setCurrentStep] = useState(0);

  const methods = useForm<DeploymentFormValues>({
    resolver: zodResolver(deploymentSchema),
    defaultValues: {
      projectName: "",
      owner: "",
      environment: "dev",
      serviceType: undefined,
      engine: undefined,
      storageSize: undefined,
      framework: undefined,
      publicAccess: undefined,
    } as unknown as DeploymentFormValues,
    mode: "onTouched",
  });

  const validateCurrentStep = (): boolean => {
    const validators: Record<number, (m: FormMethods) => boolean> = {
      0: validateGeneralInfo,
      1: validateServiceSelection,
      2: validateDynamicConfig,
    };
    const validator = validators[currentStep];
    return validator ? validator(methods) : true;
  };

  const handleNext = () => {
    const valid = validateCurrentStep();
    if (valid) setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  return (
    <FormProvider {...methods}>
      <div className="mx-auto w-full max-w-xl space-y-6">
        {/* ── Step Indicator ── */}
        <nav aria-label="Wizard progress" className="flex gap-1">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex flex-1 flex-col gap-1.5">
              <div
                className={`h-1 w-full transition-colors ${i <= currentStep ? "bg-primary" : "bg-muted"
                  }`}
              />
              <span
                className={`text-[10px] font-medium tracking-wide uppercase ${i <= currentStep
                  ? "text-foreground"
                  : "text-muted-foreground"
                  }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </nav>

        {/* ── Step Content Card ── */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep].title}</CardTitle>
            <CardDescription>
              {STEPS[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && <StepGeneralInfo />}
            {currentStep === 1 && <StepServiceSelection />}
            {currentStep === 2 && <StepDynamicConfig />}
            {currentStep === 3 && <StepReview />}
          </CardContent>
        </Card>

        {/* ── Navigation ── */}
        {currentStep < STEPS.length - 1 && (
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <ArrowLeftIcon />
              Back
            </Button>
            <Button type="button" onClick={handleNext}>
              Next
              <ArrowRightIcon />
            </Button>
          </div>
        )}

        {currentStep === STEPS.length - 1 && (
          <div className="flex justify-start">
            <Button type="button" variant="outline" onClick={handleBack}>
              <ArrowLeftIcon />
              Back
            </Button>
          </div>
        )}
      </div>
    </FormProvider>
  );
}

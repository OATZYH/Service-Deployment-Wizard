"use client";

import { useFormContext } from "react-hook-form";
import type { DeploymentFormValues } from "@/lib/schemas/deploymentSchema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";

export function StepServiceSelection() {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<DeploymentFormValues>();

  const serviceType = watch("serviceType");

  return (
    <FieldGroup>
      <Field>
        <FieldLabel>Service Type</FieldLabel>
        <Select
          value={serviceType}
          onValueChange={(value) => {
            const newType = value as DeploymentFormValues["serviceType"];
            setValue("serviceType", newType, { shouldValidate: true });

            // Reset dynamic config fields when service type changes
            if (newType === "database") {
              setValue("engine", undefined);
              setValue("storageSize", undefined);
              setValue("framework", undefined);
              setValue("publicAccess", undefined);
            } else {
              setValue("framework", undefined);
              setValue("publicAccess", false);
              setValue("engine", undefined);
              setValue("storageSize", undefined);
            }
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a service type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="database">Database</SelectItem>
            <SelectItem value="webapp">Web App</SelectItem>
          </SelectContent>
        </Select>
        {errors.serviceType && (
          <FieldError>{errors.serviceType.message}</FieldError>
        )}
      </Field>
    </FieldGroup>
  );
}

"use client";

import { useFormContext } from "react-hook-form";
import type { DeploymentFormValues } from "@/lib/schemas/deploymentSchema";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";

export function StepGeneralInfo() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<DeploymentFormValues>();

  const environment = watch("environment");

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="projectName">Project Name</FieldLabel>
        <Input
          id="projectName"
          placeholder="my-service"
          {...register("projectName")}
        />
        {errors.projectName && (
          <FieldError>{errors.projectName.message}</FieldError>
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor="owner">Owner</FieldLabel>
        <Input id="owner" placeholder="team-infra" {...register("owner")} />
        {errors.owner && <FieldError>{errors.owner.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel>Environment</FieldLabel>
        <Select
          value={environment}
          onValueChange={(value) =>
            setValue("environment", value as DeploymentFormValues["environment"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select environment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dev">Development</SelectItem>
            <SelectItem value="staging">Staging</SelectItem>
            <SelectItem value="prod">Production</SelectItem>
          </SelectContent>
        </Select>
        {errors.environment && (
          <FieldError>{errors.environment.message}</FieldError>
        )}
      </Field>
    </FieldGroup>
  );
}

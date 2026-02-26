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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";

export function StepDynamicConfig() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<DeploymentFormValues>();

  const serviceType = watch("serviceType");

  if (serviceType === "database") {
    const engine = watch("engine");
    return (
      <FieldGroup>
        <Field>
          <FieldLabel>Database Engine</FieldLabel>
          <Select
            value={engine}
            onValueChange={(value) =>
              setValue("engine", value as "postgres" | "mysql", {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select engine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="postgres">PostgreSQL</SelectItem>
              <SelectItem value="mysql">MySQL</SelectItem>
            </SelectContent>
          </Select>
          {errors.engine && <FieldError>{errors.engine.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor="storageSize">Storage Size (GB)</FieldLabel>
          <Input
            id="storageSize"
            type="number"
            placeholder="10"
            {...register("storageSize", { valueAsNumber: true })}
          />
          {errors.storageSize && (
            <FieldError>{errors.storageSize.message}</FieldError>
          )}
        </Field>
      </FieldGroup>
    );
  }

  if (serviceType === "webapp") {
    const framework = watch("framework");
    const publicAccess = watch("publicAccess");

    return (
      <FieldGroup>
        <Field>
          <FieldLabel>Framework</FieldLabel>
          <Select
            value={framework}
            onValueChange={(value) =>
              setValue("framework", value as "nextjs" | "nuxt" | "python", {
                shouldValidate: true,
              })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nextjs">Next.js</SelectItem>
              <SelectItem value="nuxt">Nuxt</SelectItem>
              <SelectItem value="python">Python</SelectItem>
            </SelectContent>
          </Select>
          {errors.framework && (
            <FieldError>{errors.framework.message}</FieldError>
          )}
        </Field>

        <Field orientation="horizontal">
          <Checkbox
            id="publicAccess"
            checked={publicAccess ?? false}
            onCheckedChange={(checked) =>
              setValue("publicAccess", checked === true, {
                shouldValidate: true,
              })
            }
          />
          <FieldLabel htmlFor="publicAccess">Public Access</FieldLabel>
          {errors.publicAccess && (
            <FieldError>{errors.publicAccess.message}</FieldError>
          )}
        </Field>
      </FieldGroup>
    );
  }

  return (
    <p className="text-muted-foreground text-sm">
      Please go back and select a service type first.
    </p>
  );
}

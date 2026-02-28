"use client";

import { type Control, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { NdaFormData } from "@/lib/schemas/nda";

interface ConfidentialityFieldProps {
  control: Control<NdaFormData>;
}

export function ConfidentialityField({ control }: ConfidentialityFieldProps) {
  const confType = useWatch({ control, name: "confidentialityType" });

  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name="confidentialityType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Term of Confidentiality</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="years" id="conf-years" />
                  <label htmlFor="conf-years" className="cursor-pointer text-sm">
                    Fixed number of years from Effective Date
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="perpetuity" id="conf-perpetuity" />
                  <label htmlFor="conf-perpetuity" className="cursor-pointer text-sm">
                    In perpetuity
                  </label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {confType === "years" && (
        <FormField
          control={control}
          name="confidentialityYears"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Years</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="1"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)
                  }
                  className="w-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}

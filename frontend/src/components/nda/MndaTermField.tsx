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

interface MndaTermFieldProps {
  control: Control<NdaFormData>;
}

export function MndaTermField({ control }: MndaTermFieldProps) {
  const termType = useWatch({ control, name: "mndaTermType" });

  return (
    <div className="space-y-3">
      <FormField
        control={control}
        name="mndaTermType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>MNDA Term</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="expires" id="mnda-expires" />
                  <label htmlFor="mnda-expires" className="cursor-pointer text-sm">
                    Expires after a set number of years
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="continues" id="mnda-continues" />
                  <label htmlFor="mnda-continues" className="cursor-pointer text-sm">
                    Continues until terminated
                  </label>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {termType === "expires" && (
        <FormField
          control={control}
          name="mndaTermYears"
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

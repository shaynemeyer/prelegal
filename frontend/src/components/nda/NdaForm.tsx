"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ndaFormSchema, type NdaFormData } from "@/lib/schemas/nda";
import { useNdaStore } from "@/store/useNdaStore";
import { MndaTermField } from "./MndaTermField";
import { ConfidentialityField } from "./ConfidentialityField";
import { PartySection } from "./PartySection";

export function NdaForm() {
  const router = useRouter();
  const setFormData = useNdaStore((s) => s.setFormData);

  const form = useForm<NdaFormData>({
    resolver: zodResolver(ndaFormSchema),
    defaultValues: {
      purpose: "Evaluating whether to enter into a business relationship with the other party.",
      effectiveDate: new Date().toISOString().split("T")[0],
      mndaTermType: "expires",
      mndaTermYears: 1,
      confidentialityType: "years",
      confidentialityYears: 1,
      governingLaw: "",
      jurisdiction: "",
      modifications: "",
      party1: { printName: "", title: "", company: "", noticeAddress: "", date: "" },
      party2: { printName: "", title: "", company: "", noticeAddress: "", date: "" },
    },
  });

  function onSubmit(data: NdaFormData) {
    setFormData(data);
    router.push("/preview");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Agreement Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How Confidential Information may be used…"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="effectiveDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effective Date</FormLabel>
                  <FormControl>
                    <Input type="date" className="w-48" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <MndaTermField control={form.control} />
            <ConfidentialityField control={form.control} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="governingLaw"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Governing Law (State)</FormLabel>
                    <FormControl>
                      <Input placeholder="Delaware" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jurisdiction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurisdiction</FormLabel>
                    <FormControl>
                      <Input placeholder="New Castle County, Delaware" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="modifications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>MNDA Modifications (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List any modifications to the standard MNDA terms…"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Party 1</CardTitle>
          </CardHeader>
          <CardContent>
            <PartySection control={form.control} party="party1" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Party 2</CardTitle>
          </CardHeader>
          <CardContent>
            <PartySection control={form.control} party="party2" />
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end">
          <Button type="submit" size="lg">
            Preview NDA →
          </Button>
        </div>
      </form>
    </Form>
  );
}

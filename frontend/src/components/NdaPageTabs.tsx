"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NdaForm } from "@/components/nda/NdaForm";
import { NdaChat } from "@/components/chat/NdaChat";

export function NdaPageTabs() {
  return (
    <Tabs defaultValue="form">
      <TabsList className="mb-4">
        <TabsTrigger value="form">Fill in Form</TabsTrigger>
        <TabsTrigger value="chat">Chat with AI</TabsTrigger>
      </TabsList>
      <TabsContent value="form">
        <NdaForm />
      </TabsContent>
      <TabsContent value="chat">
        <NdaChat />
      </TabsContent>
    </Tabs>
  );
}

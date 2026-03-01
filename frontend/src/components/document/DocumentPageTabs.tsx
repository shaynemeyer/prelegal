"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentForm } from "./DocumentForm";
import { DocumentChat } from "@/components/chat/DocumentChat";

interface DocumentPageTabsProps {
  docType: string;
  docName: string;
}

export function DocumentPageTabs({ docType, docName }: DocumentPageTabsProps) {
  return (
    <Tabs defaultValue="form">
      <TabsList className="mb-4">
        <TabsTrigger value="form">Fill in Form</TabsTrigger>
        <TabsTrigger value="chat">Chat with AI</TabsTrigger>
      </TabsList>
      <TabsContent value="form">
        <DocumentForm docType={docType} docName={docName} />
      </TabsContent>
      <TabsContent value="chat">
        <DocumentChat docType={docType} docName={docName} />
      </TabsContent>
    </Tabs>
  );
}

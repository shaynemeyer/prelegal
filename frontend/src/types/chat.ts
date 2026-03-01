export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface ChatResponse {
  message: string;
  fields: Record<string, unknown>;
}

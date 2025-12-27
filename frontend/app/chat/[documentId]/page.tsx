"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  createChat,
  getChat,
  getChatsByDocument,
  askQuestion,
  getDocument,
} from "@/lib/api";
import { ChatHeader } from "@/components/features/chat/ChatHeader";
import { MessageList } from "@/components/features/chat/MessageList";
import { ChatInput } from "@/components/features/chat/ChatInput";
import { ErrorAlert } from "@/components/common/ErrorAlert";
import { PageContainer } from "@/components/common/PageContainer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Chat, Message, Document } from "@/types";

export default function ChatPage() {
  const params = useParams();
  const documentId = params.documentId as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDocumentAndChat = async () => {
    try {
      setLoading(true);
      setError(null);

      const doc = await getDocument(documentId);
      setDocument(doc);

      if (doc.status !== "COMPLETED") {
        setError(
          "Document is still processing. Please wait for it to complete."
        );
        setLoading(false);
        return;
      }

      try {
        const existingChats = await getChatsByDocument(documentId);
        if (existingChats.length > 0) {
          const chatWithMessages = await getChat(existingChats[0].id);
          setChat(chatWithMessages);
          setMessages(chatWithMessages.messages || []);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("Error getting chats:", err);
      }

      const newChat = await createChat(documentId);
      setChat(newChat);
      setMessages([]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuestion = async (question: string) => {
    if (!chat || sending) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: question,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setSending(true);
    setError(null);

    try {
      const response = await askQuestion(chat.id, question);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.answer,
        citations: response.citations,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const updatedChat = await getChat(chat.id);
      if (updatedChat.messages) {
        setMessages(updatedChat.messages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to get answer");
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    loadDocumentAndChat();
  }, [documentId]);

  if (loading) {
    return (
      <PageContainer>
        <Skeleton className="h-8 w-48 mb-6" />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (error && !document) {
    return (
      <PageContainer>
        <ErrorAlert message={error} />
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/documents">← Back to Documents</Link>
        </Button>
      </PageContainer>
    );
  }

  if (!document) return null;

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <ChatHeader document={document} />

      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {error && <ErrorAlert message={error} className="mb-4" />}
          <MessageList messages={messages} isLoading={sending} />
        </div>
      </ScrollArea>

      <ChatInput
        onSend={handleSendQuestion}
        disabled={document.status !== "COMPLETED"}
        isLoading={sending}
      />
    </main>
  );
}

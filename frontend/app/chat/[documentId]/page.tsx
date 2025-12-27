"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  createChat,
  getChat,
  getChatsByDocument,
  askQuestion,
  getDocument,
  type Chat,
  type Message,
  type Document,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Send, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function ChatPage() {
  // ********** STATE **********
  const params = useParams();
  const documentId = params.documentId as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ********** HANDLERS **********
  const loadDocumentAndChat = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load document
      const doc = await getDocument(documentId);
      setDocument(doc);

      // Check if document is ready
      if (doc.status !== "COMPLETED") {
        setError(
          "Document is still processing. Please wait for it to complete."
        );
        setLoading(false);
        return;
      }

      // Try to get existing chats
      try {
        const existingChats = await getChatsByDocument(documentId);
        if (existingChats.length > 0) {
          // Get the most recent chat with messages
          const chatWithMessages = await getChat(existingChats[0].id);
          setChat(chatWithMessages);
          setMessages(chatWithMessages.messages || []);
          setLoading(false);
          return;
        }
      } catch (err) {
        // No existing chats, create new one
      }

      // Create new chat
      const newChat = await createChat(documentId);
      setChat(newChat);
      setMessages([]);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load chat");
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuestion = async () => {
    if (!question.trim() || !chat || sending) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: question,
      createdAt: new Date().toISOString(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    const currentQuestion = question;
    setQuestion("");
    setSending(true);
    setError(null);

    try {
      // Get answer from API
      const response = await askQuestion(chat.id, currentQuestion);

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.answer,
        citations: response.citations,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Reload chat to get updated messages from server
      const updatedChat = await getChat(chat.id);
      if (updatedChat.messages) {
        setMessages(updatedChat.messages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to get answer");
      // Remove user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendQuestion();
    }
  };

  // ********** EFFECTS **********
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load document and create/get chat
  useEffect(() => {
    loadDocumentAndChat();
  }, [documentId]);

  // ********** RENDER **********
  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-6" />
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (error && !document) {
    return (
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button variant="outline" className="mt-4" asChild>
            <Link href="/documents">← Back to Documents</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/documents">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {document?.originalName}
                </h1>
                <p className="text-sm text-gray-500">
                  {document?.totalPages} pages • {document?.totalChunks} chunks
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {messages.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 mb-4">
                  Ask a question about this document to get started.
                </p>
                <p className="text-sm text-gray-500">
                  Example: &quot;What is the main topic of this document?&quot;
                </p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <Card
                  className={`max-w-3xl ${
                    message.role === "user"
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white"
                  }`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">
                          {message.role === "user" ? "You" : "Assistant"}
                        </p>
                        <div className="text-sm prose prose-sm max-w-none">
                          <ReactMarkdown
                            components={{
                              // Customize heading styles
                              h1: ({ ...props }) => (
                                <h1
                                  className="text-lg font-bold mb-2"
                                  {...props}
                                />
                              ),
                              h2: ({ ...props }) => (
                                <h2
                                  className="text-base font-bold mb-2"
                                  {...props}
                                />
                              ),
                              h3: ({ ...props }) => (
                                <h3
                                  className="text-sm font-bold mb-1"
                                  {...props}
                                />
                              ),
                              // Bold text
                              strong: ({ ...props }) => (
                                <strong className="font-semibold" {...props} />
                              ),
                              // Italic text
                              em: ({ ...props }) => (
                                <em className="italic" {...props} />
                              ),
                              // Lists
                              ul: ({ ...props }) => (
                                <ul
                                  className="list-disc list-inside mb-2 space-y-1"
                                  {...props}
                                />
                              ),
                              ol: ({ ...props }) => (
                                <ol
                                  className="list-decimal list-inside mb-2 space-y-1"
                                  {...props}
                                />
                              ),
                              li: ({ ...props }) => (
                                <li className="mb-1" {...props} />
                              ),
                              // Paragraphs
                              p: ({ ...props }) => (
                                <p className="mb-2 last:mb-0" {...props} />
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                        {/* TODO: Add citations after fixing the backend */}
                        {/* {message.citations && message.citations.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-medium mb-2 text-gray-600">
                              Sources:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {message.citations.map((citation, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  Page {citation.page}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )} */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          )}

          {sending && (
            <div className="flex justify-start">
              <Card className="bg-white max-w-3xl">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about this document..."
              disabled={sending || !chat || document?.status !== "COMPLETED"}
              className="flex-1"
            />
            <Button
              onClick={handleSendQuestion}
              disabled={
                !question.trim() ||
                sending ||
                !chat ||
                document?.status !== "COMPLETED"
              }
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {document?.status !== "COMPLETED" && (
            <p className="text-xs text-gray-500 mt-2">
              Document is still processing. Please wait...
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

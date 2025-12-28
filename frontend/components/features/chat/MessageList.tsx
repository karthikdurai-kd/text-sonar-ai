import { useEffect, useRef } from "react";
import { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Sparkles } from "lucide-react";

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="bg-muted">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <div className="text-xs text-muted-foreground px-1">
          <span className="font-medium">Assistant</span>
        </div>
        <div className="bg-card border rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          <div className="flex gap-1">
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="border-dashed w-full max-w-lg">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-3">Start a conversation</h3>
            <CardDescription className="mb-6 text-base">
              Ask a question about this document to get started.
            </CardDescription>
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground mb-3">Try asking:</p>
              <div className="space-y-2">
                <p className="bg-muted/50 rounded-lg py-2 px-4">
                  &quot;What is the main topic of this document?&quot;
                </p>
                <p className="bg-muted/50 rounded-lg py-2 px-4">
                  &quot;Summarize the key points&quot;
                </p>
                <p className="bg-muted/50 rounded-lg py-2 px-4">
                  &quot;Explain the main concepts&quot;
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isLoading && <TypingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
}

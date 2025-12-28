import { Message } from "@/types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback
          className={cn(
            isUser ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground"
          )}
        >
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "flex flex-col gap-1 max-w-[80%] sm:max-w-[75%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div className="text-xs text-muted-foreground px-1">
          <span className="font-medium">{isUser ? "You" : "Assistant"}</span>
        </div>

        <div
          className={cn(
            "rounded-2xl px-4 py-3 shadow-sm",
            isUser
              ? "bg-blue-500 text-white rounded-br-sm"
              : "bg-card text-card-foreground border rounded-bl-sm"
          )}
        >
          <MarkdownRenderer content={message.content} isUser={isUser} />
        </div>
      </div>
    </div>
  );
}

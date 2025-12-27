import { Card, CardContent } from "@/components/ui/card";
import { Message } from "@/types";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <Card
        className={`max-w-3xl ${
          isUser ? "bg-blue-50 border-blue-200" : "bg-white"
        }`}
      >
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">
                {isUser ? "You" : "Assistant"}
              </p>
              <MarkdownRenderer content={message.content} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

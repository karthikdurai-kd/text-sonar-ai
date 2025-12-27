import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (question: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ChatInput({ onSend, disabled, isLoading }: ChatInputProps) {
  const [question, setQuestion] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [question]);

  const handleSubmit = () => {
    if (!question.trim() || disabled || isLoading) return;
    onSend(question);
    setQuestion("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-card border-t">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about this document..."
              disabled={disabled || isLoading}
              rows={1}
              className={cn(
                "min-h-[44px] max-h-[200px] resize-none pr-12",
                "focus-visible:ring-2"
              )}
            />
            <div className="absolute bottom-2 right-2 text-xs text-muted-foreground pointer-events-none">
              {question.length > 0 && (
                <span className="hidden sm:inline">
                  Press Enter to send, Shift+Enter for new line
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!question.trim() || disabled || isLoading}
            size="icon"
            className="h-11 w-11 shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        {disabled && (
          <p className="text-xs text-muted-foreground mt-2 px-1">
            Document is still processing. Please wait...
          </p>
        )}
      </div>
    </div>
  );
}

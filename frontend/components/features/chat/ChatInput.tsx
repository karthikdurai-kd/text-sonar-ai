import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (question: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function ChatInput({ onSend, disabled, isLoading }: ChatInputProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = () => {
    if (!question.trim() || disabled || isLoading) return;
    onSend(question);
    setQuestion("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-white border-t p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-2">
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about this document..."
            disabled={disabled || isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSubmit}
            disabled={!question.trim() || disabled || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {disabled && (
          <p className="text-xs text-gray-500 mt-2">
            Document is still processing. Please wait...
          </p>
        )}
      </div>
    </div>
  );
}

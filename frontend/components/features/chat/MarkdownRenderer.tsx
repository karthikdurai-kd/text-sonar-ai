import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  isUser?: boolean;
}

export function MarkdownRenderer({
  content,
  isUser = false,
}: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "text-sm prose prose-sm max-w-none",
        isUser
          ? "prose-invert prose-headings:text-white prose-p:text-white prose-strong:text-white prose-code:text-blue-100"
          : "prose-headings:text-foreground prose-p:text-foreground"
      )}
    >
      <ReactMarkdown
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-lg font-bold mb-2 mt-0" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-base font-bold mb-2 mt-0" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-sm font-bold mb-1 mt-0" {...props} />
          ),
          strong: ({ ...props }) => (
            <strong className="font-semibold" {...props} />
          ),
          em: ({ ...props }) => <em className="italic" {...props} />,
          ul: ({ ...props }) => (
            <ul
              className="list-disc list-inside mb-2 space-y-1 my-2"
              {...props}
            />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal list-inside mb-2 space-y-1 my-2"
              {...props}
            />
          ),
          li: ({ ...props }) => <li className="mb-1" {...props} />,
          p: ({ ...props }) => (
            <p className="mb-2 last:mb-0 leading-relaxed" {...props} />
          ),
          code: ({ ...props }) => (
            <code
              className={cn(
                "px-1.5 py-0.5 rounded text-xs font-mono",
                isUser ? "bg-blue-600 text-blue-50" : "bg-muted text-foreground"
              )}
              {...props}
            />
          ),
          pre: ({ ...props }) => (
            <pre
              className={cn(
                "p-3 rounded-lg overflow-x-auto my-2",
                isUser ? "bg-blue-600 text-blue-50" : "bg-muted"
              )}
              {...props}
            />
          ),
          blockquote: ({ ...props }) => (
            <blockquote
              className={cn(
                "border-l-4 pl-4 my-2 italic",
                isUser
                  ? "border-blue-300 text-blue-50"
                  : "border-border text-muted-foreground"
              )}
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

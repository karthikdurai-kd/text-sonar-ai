import ReactMarkdown from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="text-sm prose prose-sm max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ ...props }) => (
            <h1 className="text-lg font-bold mb-2" {...props} />
          ),
          h2: ({ ...props }) => (
            <h2 className="text-base font-bold mb-2" {...props} />
          ),
          h3: ({ ...props }) => (
            <h3 className="text-sm font-bold mb-1" {...props} />
          ),
          strong: ({ ...props }) => (
            <strong className="font-semibold" {...props} />
          ),
          em: ({ ...props }) => <em className="italic" {...props} />,
          ul: ({ ...props }) => (
            <ul className="list-disc list-inside mb-2 space-y-1" {...props} />
          ),
          ol: ({ ...props }) => (
            <ol
              className="list-decimal list-inside mb-2 space-y-1"
              {...props}
            />
          ),
          li: ({ ...props }) => <li className="mb-1" {...props} />,
          p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

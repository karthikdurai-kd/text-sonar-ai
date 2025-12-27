import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  className?: string;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
};

export function PageContainer({
  children,
  maxWidth = "4xl",
  className = "",
}: PageContainerProps) {
  return (
    <main className={`min-h-screen p-8 bg-gray-50 ${className}`}>
      <div className={`${maxWidthClasses[maxWidth]} mx-auto`}>{children}</div>
    </main>
  );
}

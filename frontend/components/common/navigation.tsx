"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Radar, Upload, FileText } from "lucide-react";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Radar className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">TextSonar AI</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {pathname !== "/upload" && (
              <Button variant="ghost" asChild>
                <Link href="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Link>
              </Button>
            )}
            {pathname !== "/documents" && (
              <Button variant="ghost" asChild>
                <Link href="/documents">
                  <FileText className="mr-2 h-4 w-4" />
                  Documents
                </Link>
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

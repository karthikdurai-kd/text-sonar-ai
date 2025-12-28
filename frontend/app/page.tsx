// app/page.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Navigation } from "@/components/common/navigation";

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen p-8 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">TextSonar AI</h1>
            <p className="text-muted-foreground">
              Upload PDFs and ask questions with AI-powered answers and
              citations.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Upload a PDF document to start asking questions
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button asChild>
                <Link href="/upload">Upload PDF</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/documents">View Documents</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

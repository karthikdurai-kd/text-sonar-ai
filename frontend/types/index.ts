export interface Document {
  id: string;
  filename: string;
  originalName: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  totalPages: number;
  totalChunks: number;
  createdAt: string;
  updatedAt: string;
}

export interface Chat {
  id: string;
  documentId: string;
  title: string | null;
  createdAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  createdAt: string;
}

export interface Citation {
  page: number;
  text: string;
  score?: number;
}

export interface QuestionResponse {
  answer: string;
  citations: Citation[];
}

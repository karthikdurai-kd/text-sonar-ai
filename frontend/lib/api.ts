import axios from "axios";

// API base URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
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
  citations?: Array<{
    page: number;
    text: string;
    score?: number;
  }>;
  createdAt: string;
}

export interface QuestionResponse {
  answer: string;
  citations: Array<{
    page: number;
    text: string;
    score?: number;
  }>;
}

// API Functions

// Upload a PDF document
export async function uploadDocument(file: File): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post<{ document: Document }>(
    "/documents/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data.document;
}

// Get all documents
export async function getDocuments(): Promise<Document[]> {
  const response = await api.get<Document[]>("/documents");
  return response.data;
}

// Get a single document by ID
export async function getDocument(id: string): Promise<Document> {
  const response = await api.get<Document>(`/documents/${id}`);
  return response.data;
}

// Create a new chat for a document
export async function createChat(
  documentId: string,
  title?: string
): Promise<Chat> {
  const response = await api.post<{ chat: Chat }>("/chats", {
    documentId,
    title,
  });
  return response.data.chat;
}

// Get chat by ID with messages
export async function getChat(chatId: string): Promise<Chat> {
  const response = await api.get<Chat>(`/chats/${chatId}`);
  return response.data;
}

// Get all chats for a document
export async function getChatsByDocument(documentId: string): Promise<Chat[]> {
  const response = await api.get<Chat[]>(`/chats/document/${documentId}`);
  return response.data;
}

// Ask a question in a chat (non-streaming)
export async function askQuestion(
  chatId: string,
  question: string
): Promise<QuestionResponse> {
  const response = await api.post<QuestionResponse>(
    `/chats/${chatId}/messages`,
    {
      question,
    }
  );
  return response.data;
}

export default api;

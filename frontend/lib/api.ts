import axios from "axios";
import { Chat, Document, QuestionResponse } from "@/types";
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

// Get or create chat for a document
export async function getOrCreateChat(documentId: string): Promise<Chat> {
  try {
    // Get existing chats
    const chats = await getChatsByDocument(documentId);
    if (chats.length > 0) {
      // Get the most recent chat with messages
      const chatWithMessages = await getChat(chats[0].id);
      return chatWithMessages;
    }
  } catch (error) {
    // If no chats exist, create one
    console.error("Error getting chats:", error);
  }

  // Create new chat
  return await createChat(documentId);
}

export default api;

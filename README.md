# TextSonar AI

**RAG (Retrieval-Augmented Generation) search engine that allows users to upload PDF documents, process them asynchronously, and ask questions with AI-powered answers.**

## 🚀 Features

| Feature                      | Description                                                                      |
| :--------------------------- | :------------------------------------------------------------------------------- |
| **PDF Upload & Processing**  | Upload PDF documents with automatic background processing                        |
| **Semantic Search**          | Vector-based semantic search using Pinecone for finding relevant document chunks |
| **AI-Powered Q&A**           | Get accurate answers from your documents using GPT-4o                            |
| **Source Citations**         | Answers include page number citations                                            |
| **Asynchronous Processing**  | Non-blocking PDF processing using BullMQ and Redis                               |
| **Real-time Status Updates** | Track document processing status in real-time                                    |
| **Chat Interface**           | Interactive chat interface for asking questions about documents                  |
| **Dark Mode Support**        | UI with light/dark theme toggle                                                  |

## 🏗️ Architecture

### System Overview

<img width="500" height="500" alt="TextSonar AI Architecture Diagram" src="https://github.com/user-attachments/assets/103dffab-133a-4fa6-9578-e6e731c2965e" />

### Data Flow

1. **Upload**: User uploads PDF → Backend saves file → Adds job to queue
2. **Processing**: Worker extracts text → Splits into chunks → Generates embeddings → Stores in Pinecone
3. **Query**: User asks question → Backend generates question embedding → Searches Pinecone → Retrieves relevant chunks → GPT-4o generates answer with citations

## 🛠️ Tech Stack

### Frontend

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)
![Shadcn UI](https://img.shields.io/badge/Shadcn-000000?style=flat&logo=shadcnui&logoColor=white)
![Lucide](https://img.shields.io/badge/Lucide-FF6B6B?style=flat&logo=lucide&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white)
![React Markdown](https://img.shields.io/badge/React_Markdown-61DAFB?style=flat&logo=react&logoColor=black)
![Next Themes](https://img.shields.io/badge/Next_Themes-000000?style=flat&logo=next.js&logoColor=white)

### Backend

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0902?style=flat&logo=typeorm&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![BullMQ](https://img.shields.io/badge/BullMQ-FF6B6B?style=flat&logo=bullmq&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat&logo=redis&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?style=flat&logo=langchain&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)
![Pinecone](https://img.shields.io/badge/Pinecone-4CC9F0?style=flat&logo=pinecone&logoColor=white)
![PDF Parse](https://img.shields.io/badge/PDF_Parse-FF0000?style=flat&logo=adobe-acrobat-reader&logoColor=white)

### Infrastructure

![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

## 🔄 How It Works

### 1. Document Upload & Processing

```
User uploads PDF
    ↓
Backend saves file & creates document record
    ↓
Job added to BullMQ queue
    ↓
Worker processes PDF:
  - Extract text (PDFLoader)
  - Split into chunks (RecursiveCharacterTextSplitter)
  - Generate embeddings (OpenAI text-embedding-3-small)
  - Store in Pinecone
  - Save chunks to PostgreSQL
    ↓
Document status: COMPLETED
```

### 2. Question Answering (RAG)

```
User asks question
    ↓
Generate question embedding
    ↓
Search Pinecone for similar chunks (top K)
    ↓
Retrieve full chunk text from PostgreSQL
    ↓
Build context with page numbers
    ↓
Send to GPT-4o with context
    ↓
Extract citations from answer
    ↓
Return answer with citations
```

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**
- **npm** or **yarn**
- **Docker** and **Docker Compose** (for PostgreSQL and Redis)

### API Keys Required

- **OpenAI API Key**
- **Pinecone API Key**

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/karthikdurai-kd/text-sonar-ai.git
cd textsonar-ai-project
```

### 2. Set Up Backend

```bash
cd backend
npm install
```

### 3. Set Up Frontend

```bash
cd ../frontend
npm install
```

### 4. Set Up Docker Services

```bash
# From project root
docker-compose up -d
```

This will start:

- PostgreSQL on port `5432`
- Redis on port `6379`

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=textsonar

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# OpenAI
OPENAI_API_KEY=your_openai_api_key_here

# Pinecone
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=textsonar-index

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads

# Server
PORT=3001
NODE_ENV=development
```

### Frontend Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🚀 Running the Project

### Start Backend

```bash
cd backend
npm run start:dev
```

Backend will run on `http://localhost:3001`

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Documents

- `POST /api/documents/upload` - Upload a PDF document
- `GET /api/documents` - Get all documents
- `GET /api/documents/:id` - Get document by ID

### Chats

- `POST /api/chats` - Create a new chat
- `GET /api/chats/:id` - Get chat with messages
- `GET /api/chats/document/:documentId` - Get chats for a document
- `POST /api/chats/:id/ask` - Ask a question in a chat
- `GET /api/chats/:id/stream` - Stream answer

### Health

- `GET /api/health` - Health check endpoint

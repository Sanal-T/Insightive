<div align="center">

<img src="public/logo.png" alt="Insightive Logo" width="120" />

# Insightive — Academic Research Assistant

**Leveraging Agentic AI and LLMs for Intelligent Academic Discovery and Analysis**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-RAG-1C3C3C)](https://www.langchain.com/)
[![Google Genkit](https://img.shields.io/badge/Google-Genkit-4285F4?logo=google)](https://firebase.google.com/docs/genkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## Overview

**Insightive** is a full-stack AI-powered academic research assistant that helps students, researchers, and academics discover, analyze, and summarize research materials — all from a single, unified interface.

It combines a **Next.js 15 frontend** powered by **Google Genkit** AI flows with a **Python FastAPI backend** running local LLMs via **Ollama** for private, offline-capable document analysis. Whether you are looking for relevant papers, open datasets, GitHub repositories, or need to perform a deep literature review on uploaded PDFs, Insightive handles it all.

---

## Features

### Intelligent Research Search
Enter any research topic in natural language. Insightive's agentic AI simultaneously queries multiple academic sources and returns structured, ranked results across papers, datasets, and code repositories — all in one place.

### Related Papers Finder
Search across multiple academic databases simultaneously:
- **ArXiv** — preprints across CS, Physics, Math, and more
- **Semantic Scholar** — semantic search across 200M+ papers
- **OpenAlex** — open bibliographic data
- **CrossRef** — DOI-based metadata and citations
- **IEEE Xplore** — engineering and technology papers
- **Elsevier / Springer** — journal articles

### Dataset Finder
Discover publicly available datasets relevant to your research from:
- **Kaggle** — community data science datasets
- **Hugging Face** — ML and NLP datasets
- **UCI Machine Learning Repository** — classic benchmark datasets

### Repository Finder
Find open-source code and implementations related to your topic from:
- **GitHub** — the world's largest code host
- **GitLab** — open-source collaborative development
- **Bitbucket** — Atlassian-hosted repositories
- **Codeberg / Gitea** — community-driven forges

### Literature Review (RAG-Based)
Upload one or more research PDFs and let Insightive perform a deep, AI-powered literature review:
- Extracts and indexes PDF content using **FAISS** vector stores
- Uses **RAG (Retrieval-Augmented Generation)** to answer your questions grounded in the actual document
- Compares multiple papers side-by-side in a structured table
- Powered by **local LLMs via Ollama** — fully private, no data leaves your machine

### Paper Summarization
Upload any research PDF and get a structured AI-generated summary including:
- Key contributions
- Methodology overview
- Results and findings
- Limitations and future work

### Chat History
All your research queries are saved in a sidebar history for easy reference and re-execution.

### Dark / Light Mode
Full theme support with a system-aware toggle for comfortable reading in any environment.

---

## Architecture

```
+--------------------------------------------------------------+
|                    Frontend (Next.js 15)                     |
|  +---------------+  +----------------+  +-----------------+ |
|  | Search Page   |  | Lit. Review    |  | Summarization   | |
|  | (Papers,      |  | (PDF Upload    |  | (PDF Upload +   | |
|  |  Repos,       |  |  + Q&A)        |  |  Structured     | |
|  |  Datasets)    |  |                |  |  Summary)       | |
|  +-------+-------+  +-------+--------+  +--------+--------+ |
|          |                  |                    |           |
|  +-------v------------------v--------------------v---------+ |
|  |        Google Genkit AI Flows + Server Actions          | |
|  +---------------------------------+-----------------------+ |
+-------------------------------------|------------------------+
                                      | HTTP (REST)
+-------------------------------------v------------------------+
|             Python FastAPI Backend (port 8000)               |
|  +----------------------------------------------------------+ |
|  |                   RAG Agent (LangChain)                  | |
|  |  PyMuPDF         -> Text Extraction                      | |
|  |  HuggingFace     -> Embeddings                           | |
|  |  FAISS           -> Vector Store                         | |
|  |  Ollama (gemma3) -> Answer Generation                    | |
|  +----------------------------------------------------------+ |
+--------------------------------------------------------------+
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Next.js 15 (App Router, React 19) |
| **AI / LLM Orchestration** | Google Genkit, Gemini API |
| **UI Components** | shadcn/ui + Radix UI |
| **Styling** | Tailwind CSS |
| **Backend API** | Python FastAPI + Uvicorn |
| **RAG Framework** | LangChain + LangGraph |
| **Vector Store** | FAISS (in-memory) |
| **Embeddings** | HuggingFace Sentence Transformers |
| **Local LLM** | Ollama (gemma3:1b, gemma3:12b) |
| **PDF Processing** | PyMuPDF (fitz), pdf2json |
| **External APIs** | ArXiv, Semantic Scholar, OpenAlex, CrossRef, IEEE, Elsevier, Springer, GitHub, GitLab, Kaggle, Hugging Face, UCI, Apify |

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** v18+ and **npm**
- **Python** 3.10+
- **Ollama** — https://ollama.com/download

### 1. Clone the Repository

```bash
git clone https://github.com/M-S-Arjun/INSIGHTIVE--Academic-Research-Assistant.git
cd INSIGHTIVE--Academic-Research-Assistant
```

### 2. Set Up Environment Variables

Create a `.env` file in the project root:

```env
# Required: Google Gemini API Key (for Genkit AI flows)
GOOGLE_GENAI_API_KEY=your_google_genai_api_key_here

# Optional: For enhanced paper search
APIFY_API_TOKEN=your_apify_api_token_here

# Optional: For Semantic Scholar enhanced access
SEMANTIC_SCHOLAR_API_KEY=your_semantic_scholar_key_here
```

Get your Google Gemini API key from https://aistudio.google.com/

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Set Up the Python Backend

```bash
cd python_backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 5. Pull the Ollama Model

```bash
ollama pull gemma3:1b
```

For higher quality results, pull gemma3:12b (requires ~8GB RAM).

### 6. Run the Application

**Terminal 1 — Start the Python backend:**
```bash
cd python_backend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 — Start the Next.js frontend:**
```bash
npm run dev
```

Open http://localhost:9002 in your browser.

---

## How to Use

### General Research Search
1. On the **home page**, type any research topic or task (e.g., "transformer models for medical image segmentation")
2. Press **Enter** or click the send button
3. Insightive simultaneously searches academic databases, GitHub repositories, and open datasets
4. Results appear in organized sections — Papers, Repositories, and Datasets

### Literature Review
1. Navigate to **Literature Review** from the sidebar
2. Upload one or more research PDFs
3. Ask a specific question (e.g., "What methodology did the authors use?")
4. Or click **Analyze** to generate a comparison table across all uploaded papers
5. The AI uses your PDFs as context — grounded answers, no hallucinations

### Paper Summarization
1. Navigate to **Summarization** from the sidebar
2. Upload a research PDF
3. Click **Summarize** to receive a structured breakdown: abstract, methodology, results, conclusions, and limitations

### Related Papers
1. Navigate to **Related Papers** from the sidebar
2. Enter a paper title, abstract, or keywords
3. Get ranked results from multiple academic databases simultaneously

### Dataset Finder
1. Navigate to **Dataset Finder** from the sidebar
2. Describe the type of data you need (e.g., "chest X-ray images for pneumonia detection")
3. Browse results from Kaggle, Hugging Face, and UCI

### Repository Finder
1. Navigate to **Repository Finder** from the sidebar
2. Enter a topic or algorithm name
3. Discover relevant open-source implementations from GitHub, GitLab, and more

---

## Project Structure

```
INSIGHTIVE--Academic-Research-Assistant/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── page.tsx                # Home / Search page
│   │   ├── literature-review/      # PDF upload + RAG Q&A
│   │   ├── summarization/          # PDF summarization
│   │   ├── related-papers/         # Paper search
│   │   ├── dataset-finder/         # Dataset discovery
│   │   ├── repository-finder/      # Code repo search
│   │   └── api/                    # Next.js API routes
│   ├── ai/
│   │   ├── genkit.ts               # Genkit AI configuration
│   │   └── flows/                  # Genkit AI flows
│   ├── components/                 # Reusable React components
│   │   └── ui/                     # shadcn/ui base components
│   ├── contexts/                   # React Context providers
│   ├── hooks/                      # Custom React hooks
│   └── lib/
│       └── api/                    # External API integrations
│           ├── arxiv.ts
│           ├── semantic-scholar.ts
│           ├── github.ts
│           ├── kaggle.ts
│           └── ...
├── python_backend/
│   ├── server.py                   # FastAPI server
│   ├── rag_agent.py                # RAG pipeline (LangChain + FAISS)
│   └── requirements.txt
├── scripts/                        # Developer diagnostic scripts
├── public/                         # Static assets
└── README.md
```

---

## API Reference (Python Backend)

The Python backend runs on http://localhost:8000 and exposes the following endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/ingest` | Upload and index a PDF file |
| `POST` | `/review` | Ask a question about an indexed document |
| `POST` | `/analyze` | Compare multiple uploaded PDFs |
| `POST` | `/analyze_abstracts` | Compare papers from abstract text |
| `POST` | `/summarize` | Generate a structured summary of a PDF |

---

## Privacy

- The **Literature Review** and **Summarization** features run entirely **locally** using Ollama. Your PDFs are never sent to any cloud service.
- All PDF content is stored **in-memory** only and cleared on server restart.
- The frontend AI features use the **Google Gemini API** — only your query text is sent.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add some amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

Built with love by M-S-Arjun — https://github.com/M-S-Arjun

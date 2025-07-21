# Aletheia: Detect, Discuss, and Stay Informed on Fake News

Aletheia is a novel browser extension designed to combat fake news through the power of Large Language Models (LLMs) and Retrieval Augmented Generation (RAG). Unlike existing tools, Aletheia combines **fake news detection**, **evidence-based explanations**, **community discussion**, and **real-time fact-checking updates** in one cohesive platform.

## 🔍 Features

- **Fake News Detection**: Analyze online content and classify it as Real, Fake, or NEI (Not Enough Information) using our custom FakeCheckRAG model powered by LLM.
- **Explainability**: Get transparent, evidence-backed justifications for each verdict through retrieved web sources.
- **Discussion Hub**: Discuss and debate suspicious content directly within the extension.
- **Stay Informed**: Receive up-to-date fact-checks using the Google Fact Check API.

## 🛠️ System Architecture

Aletheia follows a client-server model:

- **Frontend**: Browser extension (JavaScript/HTML/CSS) for Chrome.
- **Backend**: Python Flask API connected to:
  - Google Search & Fact Check APIs
  - PostgreSQL Community Database
  - FakeCheckRAG LLM-based analysis engine


## 📺 Demonstration

📽️ Watch the video demo to see Aletheia in action: Aletheia.mp4




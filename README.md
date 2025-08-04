# README

A quick guide to get your ROI Calculator backend and frontend running via Docker Compose.

## 1. Environment Setup

1. Copy the example template:

   ```bash
   cp example.env .env
   ```
2. Open `.env` in your editor and set your OpenAI API key:

   ```dotenv
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   Ensure this file is named `.env` and exists in the project root **before** you start the services.

## 2. Run the Services

From the project root, execute:

```bash
docker-compose up --build
```

This will:

* Build and start the **backend** on `http://localhost:5000`
* Build and start the **frontend** on `http://localhost:3000`

You’re all set—hit those URLs in your browser or API client to verify everything’s up and running!

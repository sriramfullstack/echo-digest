from fastapi import FastAPI
from crawl4ai import AsyncWebCrawler

app = FastAPI()

@app.post("/crawl")
async def crawl(data: dict):
    url = data.get("url")
    try:
        async with AsyncWebCrawler() as crawler:
            result = await crawler.arun(url)
        return {"content": result}
    except Exception as e:
        return {"error": str(e), "message": "An error occurred during crawling."}
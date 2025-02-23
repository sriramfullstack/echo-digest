'use client';

import { useState, useEffect } from 'react';

interface CrawlResponse {
  content: {
    url: string;
    html: string;
    markdown: string;
    success: boolean;
  };
}

interface LearningNugget {
  id: number;
  title: string;
  content: string;
  code_snippet: string | null;
  image_url: string | null;
}

interface CleanResponse {
  content: {
    markdown: {
      output: string;
      reasoning: string | null;
      partial: boolean;
      error: string | null;
    };
    success: boolean;
  };
}

export default function UrlCrawler() {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState<CrawlResponse | null>(null);
  const [cleanedContent, setCleanedContent] = useState<CleanResponse | null>(null);
  const [nuggets, setNuggets] = useState<LearningNugget[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cleaning, setCleaning] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setContent(null);
    setCleanedContent(null);
    setNuggets([]);

    try {
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to crawl URL');
      }

      if (!data.content.success) {
        throw new Error('Failed to crawl URL');
      }

      setContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to crawl URL');
    } finally {
      setLoading(false);
    }
  };

  const handleClean = async () => {
    if (!content?.content.markdown) return;
    
    setCleaning(true);
    setError('');

    try {
      const response = await fetch('/api/clean', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdown: content.content.markdown }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to clean content');
      }

      if (!data.content.success) {
        throw new Error('Failed to clean content');
      }

      setCleanedContent(data);
      
      try {
        const parsedOutput = JSON.parse(data.content.markdown.output.replace(/```json\n|```/g, ''));
        setNuggets(parsedOutput);
      } catch (parseError) {
        console.error('Failed to parse nuggets:', parseError);
        setError('Failed to parse learning nuggets');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clean content');
    } finally {
      setCleaning(false);
    }
  };

  if (!isClient) {
    return <div className="w-full max-w-3xl mx-auto p-4 space-y-6"></div>;
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-2">
            Enter URL to crawl
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-foreground/20 bg-background text-foreground"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Crawling...' : 'Crawl URL'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      {content && content.content.success && (
        <div className="prose dark:prose-invert max-w-none space-y-4">
          <div className="p-4 bg-black/[.05] dark:bg-white/[.06] rounded-md">
            <h3 className="text-lg font-semibold mb-2">Crawled URL</h3>
            <p className="text-sm break-all">{content.content.url}</p>
          </div>
          <div className="p-4 bg-black/[.05] dark:bg-white/[.06] rounded-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Raw Content</h3>
              <button
                onClick={handleClean}
                disabled={cleaning}
                className="px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity text-sm"
              >
                {cleaning ? 'Cleaning...' : 'Clean Content'}
              </button>
            </div>
            <div className="text-sm whitespace-pre-wrap overflow-auto max-h-[500px]">
              {content.content.markdown}
            </div>
          </div>
        </div>
      )}

      {nuggets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nuggets.map((nugget) => (
            <div key={nugget.id} className="p-4 bg-black/[.05] dark:bg-white/[.06] rounded-md hover:bg-black/[.08] dark:hover:bg-white/[.09] transition-colors">
              <h3 className="text-lg font-semibold mb-2">{nugget.title}</h3>
              <p className="text-sm mb-4">{nugget.content}</p>
              {nugget.code_snippet && (
                <div className="bg-black/[.1] dark:bg-black/[.3] p-3 rounded-md mb-4 overflow-x-auto">
                  <pre className="text-xs">
                    <code>{nugget.code_snippet}</code>
                  </pre>
                </div>
              )}
              {nugget.image_url && (
                <img
                  src={nugget.image_url}
                  alt={nugget.title}
                  className="w-full h-auto rounded-md"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
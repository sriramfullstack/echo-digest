'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';

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
  const [showRawContent, setShowRawContent] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'stacked'>('list');
  const [currentIndex, setCurrentIndex] = useState(0);
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (viewMode === 'stacked' && currentIndex < nuggets.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    },
    onSwipedRight: () => {
      if (viewMode === 'stacked' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleClean = async (crawledContent: CrawlResponse) => {
    setCleaning(true);
    setProgress('Cleaning and processing content...');
    setError('');

    try {
      const response = await fetch('/api/clean', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markdown: crawledContent.content.markdown }),
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
      setProgress('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setContent(null);
    setCleanedContent(null);
    setNuggets([]);
    setProgress('Crawling URL...');

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
      await handleClean(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to crawl URL');
    } finally {
      setLoading(false);
      setProgress('');
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
            Enter URL
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
          disabled={loading || cleaning}
          className="w-full px-4 py-2 bg-foreground text-background rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          Process
        </button>
      </form>

      {(loading || cleaning) && progress && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md">
          {progress}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      {nuggets.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'list' ? 'bg-foreground text-background' : 'bg-black/[.05] dark:bg-white/[.06]'}`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('stacked')}
              className={`px-3 py-1 rounded-md transition-colors ${viewMode === 'stacked' ? 'bg-foreground text-background' : 'bg-black/[.05] dark:bg-white/[.06]'}`}
            >
              Stacked View
            </button>
          </div>

          <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {nuggets.map((nugget) => (
                  <motion.div
                    key={nugget.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="p-4 bg-black/[.05] dark:bg-white/[.06] rounded-md hover:bg-black/[.08] dark:hover:bg-white/[.09] transition-colors flex flex-col"
                  >
                    <h3 className="text-lg font-semibold mb-2">{nugget.title}</h3>
                    <div className="text-sm mb-4 prose dark:prose-invert max-w-none prose-sm flex-grow">
                      <ReactMarkdown>{nugget.content}</ReactMarkdown>
                    </div>
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
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div {...handlers} className="relative w-full">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={nuggets[currentIndex].id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="p-4 bg-black/[.05] dark:bg-white/[.06] rounded-md mb-16"
                  >
                    <div className="flex flex-col space-y-4">
                      <h3 className="text-lg font-semibold">{nuggets[currentIndex].title}</h3>
                      <div className="text-sm prose dark:prose-invert max-w-none prose-sm">
                        <ReactMarkdown>{nuggets[currentIndex].content}</ReactMarkdown>
                      </div>
                      {nuggets[currentIndex].code_snippet && (
                        <div className="bg-black/[.1] dark:bg-black/[.3] p-3 rounded-md overflow-x-auto">
                          <pre className="text-xs">
                            <code>{nuggets[currentIndex].code_snippet}</code>
                          </pre>
                        </div>
                      )}
                      {nuggets[currentIndex].image_url && (
                        <div className="w-full overflow-hidden rounded-md">
                          <img
                            src={nuggets[currentIndex].image_url}
                            alt={nuggets[currentIndex].title}
                            className="w-full h-auto object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>
                <div className="fixed bottom-4 left-0 right-0 flex flex-col items-center justify-center space-y-2 bg-gradient-to-t from-background/80 to-transparent py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button 
                      onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
                      className={`p-2 rounded-full ${currentIndex > 0 ? 'text-foreground hover:bg-foreground/10' : 'text-foreground/30'}`}
                      disabled={currentIndex === 0}
                    >
                      ←
                    </button>
                    <span className="text-sm font-medium text-foreground/70">{currentIndex + 1} / {nuggets.length}</span>
                    <button 
                      onClick={() => currentIndex < nuggets.length - 1 && setCurrentIndex(prev => prev + 1)}
                      className={`p-2 rounded-full ${currentIndex < nuggets.length - 1 ? 'text-foreground hover:bg-foreground/10' : 'text-foreground/30'}`}
                      disabled={currentIndex === nuggets.length - 1}
                    >
                      →
                    </button>
                  </div>
                  <div className="flex space-x-1">
                    {nuggets.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-1 rounded-full transition-all duration-200 ${index === currentIndex ? 'w-6 bg-foreground' : 'w-2 bg-foreground/30'}`}
                        aria-label={`Go to nugget ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
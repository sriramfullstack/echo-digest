import { NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

export async function POST(request: Request) {
  try {
    console.log(process.env.FAL_KEY);
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    console.log('Crawling URL:', url);
    
    const response = await fetch('http://localhost:8000/crawl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Crawler service error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Crawler service error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Crawler service success:', data?.content?.success);

    if (!data.content || !data.content.html) {
      console.error('Invalid response format from crawler:', data);
      throw new Error('Invalid response format from crawler service');
    }

    return NextResponse.json({
      content: {
        url: data.content.url,
        html: data.content.html,
        markdown: data.content.markdown,
        success: true
      }
    });
  } catch (error) {
    console.error('Crawl error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to crawl URL' },
      { status: 500 }
    );
  }
}
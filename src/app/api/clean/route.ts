import { NextResponse } from 'next/server';
import { fal } from '@fal-ai/client';

fal.config({
  proxyUrl: '/api/fal/proxy',
//   credentials: process.env.FAL_KEY || ''
});

export async function POST(request: Request) {
  try {
    console.log('FAL Key from env', process.env.FAL_KEY);
    const { markdown } = await request.json();
    
    if (!markdown) {
      return NextResponse.json(
        { error: 'Markdown content is required' },
        { status: 400 }
      );
    }

    console.log('Processing content through AI...');
    const aiResponse = await fal.subscribe('fal-ai/any-llm', {
      input: {
        prompt: `
            You are an AI that extracts **only meaningful knowledge nuggets** from Markdown. 
            - **IGNORE**: Website navigation, social media buttons, author bios, ads, and unrelated content.
            - Extract key insights from the **main body** of the article only.
            - If an image is part of the article's content, include its URL.
            - Maintain the logical sequence of ideas.
            - Format the output as a JSON array:
            [
              {
                "id": <number>,
                "title": <string>,
                "content": <string>,
                "code_snippet": <string | null>,
                "image_url": <string | null>
              }
            ]

            ### Example Input (Markdown):
            ${markdown}

            ### Expected Output:
            Only return **meaningful knowledge cards** without website navigation, author info, or social buttons.
          `,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === 'IN_PROGRESS') {
          console.log('AI Processing:', update.logs.map((log) => log.message));
        }
      }
    });

    return NextResponse.json({
      content: {
        markdown: aiResponse.data,
        success: true
      }
    });
  } catch (error) {
    console.error('Content cleaning error:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to clean content' },
      { status: 500 }
    );
  }
}
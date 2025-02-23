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
            You are an AI that extracts structured knowledge from Markdown.
            - Convert the given cleaned Markdown into structured learning nuggets.
            - Each nugget should contain:
              - A title summarizing the key concept.
              - A concise explanation (max 40 words).
              - If applicable, extract code snippets.
              - If images are referenced, include the image URL.
            - Format the output as a valid JSON array with the structure:
            [
              {
                "id": <number>,
                "title": <string>,
                "content": <string>,
                "code_snippet": <string | null>,
                "image_url": <string | null>
              }
            ]

            Input Markdown:
            ${markdown}
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
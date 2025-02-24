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
            You are an AI that extracts **only meaningful knowledge nuggets** from Markdown **and generates a conversational audio description for each**.
            
            - **IGNORE**: Website navigation, social media buttons, author bios, ads, and unrelated content.
            - Extract key insights from the **main body** of the article only.
            - If an image is part of the article's content, include its URL.
            - Maintain the logical sequence of ideas.
            - **Generate an engaging, conversational audio description** that expands on the content without repeating it verbatim.
            - **Make the narration sound like a podcast host** summarizing and explaining the point in a friendly, insightful way. But do not mention as a podcast as it is a narration.
            - **Keep it natural, engaging, and structured** to be spoken aloud.
            
            - **Format the output as a JSON array**:
            [
              {
                "id": <number>,
                "title": <string>, 
                "content": <string>, 
                "code_snippet": <string | null>, 
                "image_url": <string | null>, 
                "audio_description": <string> 
              }
            ]
      
            ### Example Input (Markdown):
            ${markdown}
      
            ### Expected Output:
            Only return **meaningful knowledge cards** with engaging audio descriptions.
            
            #### Example JSON:
            [
              {
                "id": 1,
                "title": "AI Summarization",
                "content": "AI can break down complex topics into structured, bite-sized insights.",
                "code_snippet": null,
                "image_url": "https://example.com/ai-summary.jpg",
                "audio_description": "AI has revolutionized how we understand information. Instead of reading through lengthy articles, imagine having an AI-powered assistant that picks out the most important points for you! That's exactly what summarization models do."
              }
            ]
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
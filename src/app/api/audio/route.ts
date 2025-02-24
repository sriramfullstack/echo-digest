import { ElevenLabsClient } from "elevenlabs";
import { NextRequest, NextResponse } from "next/server";

if (!process.env.ELEVENLABS_API_KEY) {
  throw new Error("Missing ELEVENLABS_API_KEY environment variable");
}

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: "Text content is required" },
        { status: 400 }
      );
    }

    const audioResponse = await client.textToSpeech.convert(
      "JBFqnCBsd6RMkjVDRZzb",
      {
        output_format: "mp3_44100_128",
        text,
        model_id: "eleven_multilingual_v2",
      }
    );

    const chunks: Buffer[] = [];
    for await (const chunk of audioResponse) {
      chunks.push(Buffer.from(chunk));
    }
    const audioData = Buffer.concat(chunks);

    // Convert the audio buffer to a Blob
    const audioBlob = new Blob([audioData], { type: "audio/mpeg" });
    const audioBuffer = await audioBlob.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error("Error generating audio:", error);
    return NextResponse.json(
      { error: "Failed to generate audio" },
      { status: 500 }
    );
  }
}
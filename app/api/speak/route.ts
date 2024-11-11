import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    const response = await axios.post(
      'https://api.deepgram.com/v1/speak?model=aura-athena-en',
      { text },
      {
        headers: {
          Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer'
      }
    );

    // Convert the array buffer to base64
    const audioBase64 = Buffer.from(response.data).toString('base64');

    return NextResponse.json({ 
      audioData: `data:audio/mp3;base64,${audioBase64}` 
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
} 
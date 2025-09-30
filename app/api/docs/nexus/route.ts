import { NextRequest, NextResponse } from 'next/server';

// FRC Nexus API (if available) - this is a placeholder since Nexus might not have public API
// You may need to adjust based on actual Nexus API documentation
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const eventKey = searchParams.get('eventKey');

  try {
    // If Nexus has a public API, use it here
    // For now, this is a placeholder that could integrate with FRC Events API
    const response = await fetch(
      `https://frc-api.firstinspires.org/v3.0/${new Date().getFullYear()}/events?eventCode=${eventKey}`,
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.FRC_USERNAME}:${process.env.FRC_API_KEY}`
          ).toString('base64')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Nexus API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Nexus API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch from Nexus' }, { status: 500 });
  }
}
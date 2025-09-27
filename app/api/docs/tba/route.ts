// Create these files in your Next.js project:

// app/api/tba/route.ts
import { NextRequest, NextResponse } from 'next/server';

const TBA_AUTH_KEY = process.env.TBA_AUTH_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const eventKey = searchParams.get('eventKey');
  const teamNumber = searchParams.get('teamNumber');

  if (!TBA_AUTH_KEY) {
    return NextResponse.json({ error: 'TBA API key not configured' }, { status: 500 });
  }

  let url = '';
  
  switch (endpoint) {
    case 'matches':
      if (!eventKey || !teamNumber) {
        return NextResponse.json({ error: 'Missing eventKey or teamNumber' }, { status: 400 });
      }
      url = `https://www.thebluealliance.com/api/v3/team/frc${teamNumber}/event/${eventKey}/matches/simple`;
      break;
    case 'teams':
      if (!eventKey) {
        return NextResponse.json({ error: 'Missing eventKey' }, { status: 400 });
      }
      url = `https://www.thebluealliance.com/api/v3/event/${eventKey}/teams/simple`;
      break;
    case 'rankings':
      if (!eventKey) {
        return NextResponse.json({ error: 'Missing eventKey' }, { status: 400 });
      }
      url = `https://www.thebluealliance.com/api/v3/event/${eventKey}/rankings`;
      break;
    case 'event-matches':
      if (!eventKey) {
        return NextResponse.json({ error: 'Missing eventKey' }, { status: 400 });
      }
      url = `https://www.thebluealliance.com/api/v3/event/${eventKey}/matches`;
      break;
    default:
      return NextResponse.json({ error: 'Invalid endpoint' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'X-TBA-Auth-Key': TBA_AUTH_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`TBA API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('TBA API error:', error);
    return NextResponse.json({ error: 'Failed to fetch TBA data' }, { status: 500 });
  }
}

// app/api/nexus/route.ts
import { NextRequest, NextResponse } from 'next/server';

const NEXUS_API_KEY = process.env.NEXUS_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventKey = searchParams.get('eventKey') || '2025galileo';

  if (!NEXUS_API_KEY) {
    return NextResponse.json({ error: 'Nexus API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://frc.nexus/api/v1/event/${eventKey}`, {
      headers: {
        'Nexus-Api-Key': NEXUS_API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Nexus API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Nexus API error:', error);
    return NextResponse.json({ error: 'Failed to fetch Nexus data' }, { status: 500 });
  }
}

// app/api/battery/route.ts
import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for battery data
// For production, you'd want to use a database
let batteryData: BatteryRecord[] = [];

interface BatteryRecord {
  id: string;
  timestamp: number;
  batteryId: string;
  voltage: number;
  current: number;
  temperature: number;
  cycleCount: number;
  status: 'charging' | 'discharging' | 'idle';
  location: string;
  notes?: string;
}

export async function GET() {
  return NextResponse.json(batteryData);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newRecord: BatteryRecord = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      ...body
    };
    
    batteryData.push(newRecord);
    
    // Keep only last 1000 records to prevent memory issues
    if (batteryData.length > 1000) {
      batteryData = batteryData.slice(-1000);
    }
    
    return NextResponse.json(newRecord);
  } catch (error) {
    console.error('Error saving battery data:', error);
    return NextResponse.json({ error: 'Failed to save battery data' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Missing battery record id' }, { status: 400 });
  }
  
  batteryData = batteryData.filter(record => record.id !== id);
  return NextResponse.json({ success: true });
}
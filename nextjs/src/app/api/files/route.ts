import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = 'test';
const COLLECTION_NAME = 'files';

let client: MongoClient | null = null;

async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db(DB_NAME);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skip = parseInt(searchParams.get('skip') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    const db = await connectToDatabase();
    const collection = db.collection(COLLECTION_NAME);
    const total = await collection.countDocuments({});

    // Get paginated results
    const files = await collection
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();

    return NextResponse.json({
      files,
      totalRecords: total,
      skip,
      limit
    });

  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files from MongoDB Atlas' },
      { status: 500 }
    );
  }
}
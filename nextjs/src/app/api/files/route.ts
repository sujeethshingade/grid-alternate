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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

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
      currentPage: page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch files from MongoDB Atlas' },
      { status: 500 }
    );
  }
}
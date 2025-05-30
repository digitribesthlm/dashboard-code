import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { verifyAuth } from '../../../utils/auth';

export async function GET(request) {
  try {
    // Verify authentication
    const auth = await verifyAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB || 'seo-manager';
    const client = new MongoClient(url);
    
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('content_briefs');

    let pipeline = [
      {
        $group: {
          _id: "$primary_keyword",
          count: { $sum: 1 },
          domains: { $addToSet: "$domain" }
        }
      },
      {
        $project: {
          _id: 0,
          keyword: "$_id",
          count: 1,
          domains: 1
        }
      },
      {
        $sort: { keyword: 1 } // Sort alphabetically by keyword
      }
    ];

    // If the user is not an admin, filter by their domain
    if (auth.user.role !== 'admin' && auth.user.domain) {
      pipeline.unshift({
        $match: { domain: auth.user.domain }
      });
    }

    const keywordCounts = await collection.aggregate(pipeline).toArray();
    
    await client.close();

    return NextResponse.json(keywordCounts);
  } catch (error) {
    console.error('Error fetching keyword counts:', error);
    return NextResponse.json({ error: 'Failed to fetch keyword counts' }, { status: 500 });
  }
} 
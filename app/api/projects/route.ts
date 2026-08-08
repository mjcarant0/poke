import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_POSTS } from '@/lib/mock-data';

export async function GET() {
  try {
    const posts = await prisma.projectPost.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (!posts || posts.length === 0) {
      return NextResponse.json(MOCK_POSTS);
    }

    return NextResponse.json(posts);
  } catch (err) {
    return NextResponse.json(MOCK_POSTS);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description = '', url, category = 'SaaS', authorEmail = 'dev@poke-app.dev' } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'Post title and live application URL are required' }, { status: 400 });
    }

    try {
      const newPost = await prisma.projectPost.create({
        data: {
          title,
          description,
          url,
          category,
          authorEmail,
          upvotes: 0,
        },
      });

      return NextResponse.json(newPost, { status: 201 });
    } catch (dbErr) {
      const fallbackPost = {
        id: 'post_' + Date.now(),
        title,
        description,
        url,
        category,
        authorEmail,
        upvotes: 0,
        createdAt: new Date().toISOString(),
        commentsCount: 0,
      };
      MOCK_POSTS.unshift(fallbackPost as any);
      return NextResponse.json(fallbackPost, { status: 201 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

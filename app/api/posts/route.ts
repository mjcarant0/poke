import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MOCK_POSTS } from '@/lib/mock-data';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET() {
  try {
    const posts = await prisma.projectPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, username: true, email: true },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    if (!posts || posts.length === 0) {
      return NextResponse.json(MOCK_POSTS);
    }

    const formatted = posts.map((p) => {
      let imagesArray: string[] = [];
      if (p.images) {
        try {
          imagesArray = JSON.parse(p.images);
        } catch (e) {
          imagesArray = [];
        }
      }
      return {
        ...p,
        images: imagesArray,
        commentsCount: p._count.comments,
      };
    });

    return NextResponse.json(formatted);
  } catch (err) {
    return NextResponse.json(MOCK_POSTS);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description = '', url, category = 'SaaS', authorEmail = 'dev@poke-app.dev', images = [] } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'Post title and live application URL are required' }, { status: 400 });
    }

    // Check current authenticated user session
    const currentUser = await getAuthenticatedUser();

    const imagesJson = Array.isArray(images) && images.length > 0 ? JSON.stringify(images) : null;

    try {
      const newPost = await prisma.projectPost.create({
        data: {
          title,
          description,
          url,
          category,
          images: imagesJson,
          authorEmail: currentUser?.email || authorEmail,
          authorId: currentUser?.userId || null,
          upvotes: 0,
        },
        include: {
          author: {
            select: { name: true, username: true, email: true },
          },
        },
      });

      return NextResponse.json({
        ...newPost,
        images: images,
      }, { status: 201 });
    } catch (dbErr) {
      const fallbackPost = {
        id: 'post_' + Date.now(),
        title,
        description,
        url,
        category,
        images: images,
        authorEmail: currentUser?.email || authorEmail,
        author: currentUser ? { name: currentUser.username, username: currentUser.username } : null,
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

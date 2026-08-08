import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

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
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Database fetch error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description = '', url, category = 'SaaS App', authorEmail = 'dev@poke-app.dev', images = [] } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'Post title and live application URL are required' }, { status: 400 });
    }

    const currentUser = await getAuthenticatedUser();

    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const imagesJson = Array.isArray(images) && images.length > 0 ? JSON.stringify(images) : null;

    const newPost = await prisma.projectPost.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        url: formattedUrl,
        category,
        authorEmail: currentUser?.email || authorEmail,
        authorId: currentUser?.userId || null,
        images: imagesJson,
        upvotes: 0,
      },
      include: {
        author: {
          select: { name: true, username: true, email: true },
        },
      },
    });

    return NextResponse.json(
      {
        ...newPost,
        images: images,
        commentsCount: 0,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}


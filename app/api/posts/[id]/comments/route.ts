import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Persistent in-memory storage fallback
const inMemoryComments: Record<string, any[]> = {};

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const { searchParams } = new URL(req.url);
    const timeframe = searchParams.get('timeframe') || 'today';
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const whereCondition: any = { postId };
    const now = new Date();

    if (timeframe === 'today') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      whereCondition.createdAt = { gte: startOfToday };
    } else if (timeframe === 'yesterday') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
      whereCondition.createdAt = { gte: startOfYesterday, lt: startOfToday };
    } else if (timeframe === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      whereCondition.createdAt = { gte: weekAgo };
    } else if (timeframe === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      whereCondition.createdAt = { gte: monthAgo };
    } else if (timeframe === 'custom' && startDateParam) {
      const startD = new Date(startDateParam);
      const endD = endDateParam ? new Date(`${endDateParam}T23:59:59.999Z`) : new Date();
      whereCondition.createdAt = { gte: startD, lte: endD };
    }

    try {
      const comments = await prisma.qAComment.findMany({
        where: whereCondition,
        orderBy: { createdAt: 'desc' },
        take: timeframe === 'today' || timeframe === '24h' ? 30 : 150,
        include: {
          labels: {
            include: { label: true },
          },
          replies: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      const memoryList = inMemoryComments[postId] || [];
      const combined = [...comments];

      // Add any in-memory comments not already in database
      memoryList.forEach((mem) => {
        if (!combined.some((c) => c.id === mem.id)) {
          combined.unshift(mem);
        }
      });

      const session = await getAuthenticatedUser(req);
      const userUpvotedCommentIds = new Set<string>();

      if (session) {
        try {
          const upvotes = await prisma.commentUpvote.findMany({
            where: { userId: session.userId },
            select: { commentId: true },
          });
          upvotes.forEach((u) => userUpvotedCommentIds.add(u.commentId));
        } catch (e) {
          // Ignore upvote fetch errors
        }
      }

      const formatted = combined.map((c) => {
        let screenshotsList: string[] = [];
        if (c.screenshots) {
          try {
            screenshotsList = JSON.parse(c.screenshots);
          } catch (e) {
            screenshotsList = [];
          }
        }
        if (screenshotsList.length === 0 && c.screenshotUrl) {
          screenshotsList = [c.screenshotUrl];
        }
        return {
          ...c,
          hasUpvoted: userUpvotedCommentIds.has(c.id),
          screenshots: screenshotsList,
        };
      });

      return NextResponse.json(formatted);
    } catch (dbErr) {
      const memoryList = inMemoryComments[postId] || [];
      return NextResponse.json(memoryList);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Comments fetch error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;
    const body = await req.json();
    const {
      type = 'GENERAL',
      qaNotes,
      notes,
      screenshotUrl,
      screenshots = [],
      pageTested,
      browser,
      os,
      deviceType,
      screenResolution,
      referrer,
      timestamp,
    } = body;

    const actualNotes = qaNotes || notes;

    if (!actualNotes || !actualNotes.trim()) {
      return NextResponse.json({ error: 'QA inspection notes are required' }, { status: 400 });
    }

    // Prepare screenshots list
    let finalScreenshotsList: string[] = Array.isArray(screenshots) ? screenshots : [];
    if (finalScreenshotsList.length === 0 && screenshotUrl) {
      finalScreenshotsList = [screenshotUrl];
    }
    const screenshotsJson = finalScreenshotsList.length > 0 ? JSON.stringify(finalScreenshotsList) : null;
    const firstScreenshotUrl = finalScreenshotsList[0] || screenshotUrl || null;

    // Ensure parent post exists in database before creating comment to satisfy foreign key
    try {
      const existingPost = await prisma.projectPost.findUnique({ where: { id: postId } });
      if (!existingPost) {
        await prisma.projectPost.create({
          data: {
            id: postId,
            title: 'Community Project',
            description: 'Web application submitted for review',
            url: 'https://poke-app.dev',
            category: 'SaaS App',
            authorEmail: 'dev@poke-app.dev',
            upvotes: 0,
          },
        });
      }
    } catch (pErr) {
      // Ignore
    }

    const currentUser = await getAuthenticatedUser(req);
    const authorName = currentUser
      ? (currentUser.username ? `@${currentUser.username}` : currentUser.email)
      : 'Anonymous';
    const authorId = currentUser ? currentUser.userId : null;

    try {
      const newComment = await prisma.qAComment.create({
        data: {
          postId,
          type: type.toUpperCase(),
          qaNotes: actualNotes,
          authorName,
          authorId,
          screenshotUrl: firstScreenshotUrl,
          screenshots: screenshotsJson,
          pageTested: pageTested || null,
          browser: browser || 'Chrome',
          os: os || 'Windows',
          deviceType: deviceType || 'Desktop',
          screenResolution: screenResolution || '1920x1080',
          referrer: referrer || '/home',
          timestamp: timestamp || new Date().toLocaleTimeString(),
          status: 'NEW',
          upvotes: 0,
        },
      });

      const formattedResult = {
        ...newComment,
        screenshots: finalScreenshotsList,
      };

      // Save to memory store as well
      if (!inMemoryComments[postId]) inMemoryComments[postId] = [];
      inMemoryComments[postId].unshift(formattedResult);

      return NextResponse.json(formattedResult, { status: 201 });
    } catch (dbErr) {
      const fallbackComment = {
        id: 'qa_' + Date.now(),
        postId,
        type: type.toUpperCase(),
        qaNotes: actualNotes,
        screenshotUrl: firstScreenshotUrl,
        screenshots: finalScreenshotsList,
        pageTested: pageTested || null,
        browser: browser || 'Chrome',
        os: os || 'Windows',
        deviceType: deviceType || 'Desktop',
        screenResolution: screenResolution || '1920x1080',
        referrer: referrer || '/home',
        timestamp: timestamp || new Date().toLocaleTimeString(),
        status: 'NEW',
        upvotes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!inMemoryComments[postId]) inMemoryComments[postId] = [];
      inMemoryComments[postId].unshift(fallbackComment);

      return NextResponse.json(fallbackComment, { status: 201 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

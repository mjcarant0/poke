// Domain types for Poke QA Review platform

export type FeedbackType = 'BUG' | 'FEATURE' | 'GENERAL';

export type FeedbackStatus = 'NEW' | 'REVIEWING' | 'IN_PROGRESS' | 'FIXED' | 'CLOSED';

export type ProjectCategory =
  | 'SaaS'
  | 'E-Commerce'
  | 'Game'
  | 'Portfolio'
  | 'Mobile';

export interface ProjectPost {
  id: string;
  title: string;
  description: string;
  url: string;
  category: ProjectCategory;
  authorEmail: string;
  authorId?: string;
  images?: string[];
  upvotes: number;
  createdAt: string | Date;
  commentsCount?: number;
  slug?: string;
  ownerEmail?: string;
  author?: {
    id?: string;
    name?: string;
    username?: string;
  } | null;
}

export type Project = ProjectPost;

export interface Label {
  id: string;
  postId: string;
  name: string;
  color: string;
}

export interface CommentLabel {
  id: string;
  commentId: string;
  labelId: string;
  label?: Label;
}

export interface QAReply {
  id: string;
  commentId: string;
  authorName: string;
  authorRole: 'DEVELOPER' | 'REVIEWER';
  content: string;
  createdAt: string | Date;
}

export interface QAComment {
  id: string;
  postId: string;
  type: FeedbackType;
  qaNotes: string;
  screenshotUrl?: string | null;
  screenshots?: string[];
  pageTested?: string | null;
  browser?: string | null;
  os?: string | null;
  deviceType?: string | null;
  screenResolution?: string | null;
  referrer?: string | null;
  timestamp?: string | null;
  status: FeedbackStatus;
  upvotes: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  labels?: CommentLabel[];
  replies?: QAReply[];
  userEmail?: string | null;
  pageUrl?: string | null;
  description?: string | null;
  title?: string | null;
}

export type Feedback = QAComment;

export interface CreateProjectPostPayload {
  title: string;
  description: string;
  url: string;
  category: ProjectCategory;
  authorEmail: string;
}

export type CreateProjectPayload = CreateProjectPostPayload;

export interface CreateQACommentPayload {
  postId: string;
  type: FeedbackType;
  qaNotes: string;
  screenshotUrl?: string;
  pageTested?: string;
  browser?: string;
  os?: string;
  deviceType?: string;
  screenResolution?: string;
  referrer?: string;
  timestamp?: string;
}

export type CreatePokePayload = CreateQACommentPayload;

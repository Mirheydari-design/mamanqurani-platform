import fs from 'fs';
import path from 'path';
import { initialProfiles, initialPosts } from './seedData';

// Persistent data directory per Site Manager Deployment rules (/app/data/)
function resolveDataDir(): string {
  if (process.env.DATA_DIR) {
    return process.env.DATA_DIR;
  }
  // Inside Docker container on Site Manager, /app/data is mounted via Docker volume
  if (fs.existsSync('/app/data')) {
    return '/app/data';
  }
  if (fs.existsSync('/app')) {
    try {
      fs.mkdirSync('/app/data', { recursive: true });
      return '/app/data';
    } catch {
      // fallback if /app not writable
    }
  }
  // Local development fallback
  const local = path.join(process.cwd(), 'data');
  try {
    fs.mkdirSync(local, { recursive: true });
  } catch {}
  return local;
}

const DATA_DIR = resolveDataDir();

try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
} catch (e) {
  // ignore
}

export interface DbPost {
  id: string;
  authorId: string;
  authorName: string;
  authorChildName: string;
  authorChildAge: number;
  authorBadge?: string;
  authorAvatarColor?: string;
  text: string;
  createdAt: string;
  helpfulCount: number;
  hasUserMarkedHelpful?: boolean;
  attachedGameCard?: any;
  comments: DbComment[];
  isOwn?: boolean;
  isReported?: boolean;
}

export interface DbComment {
  id: string;
  authorName: string;
  authorChild?: string;
  text: string;
  createdAt: string;
  replies: DbReply[];
}

export interface DbReply {
  id: string;
  authorName: string;
  authorChild?: string;
  text: string;
  createdAt: string;
}

export interface DbSocialProfile {
  id: string;
  username: string;
  childName: string;
  childAge: number;
  bio?: string;
  badge?: string;
  avatarColor?: string;
  helpfulCountReceived: number;
  postsCount: number;
  joinedAt?: string;
}

interface StorageSchema {
  profiles: Record<string, DbSocialProfile>;
  posts: Record<string, {
    id: string;
    authorId: string;
    authorName: string;
    authorChildName: string;
    authorChildAge: number;
    text: string;
    createdAt: string;
    helpfulCount: number;
    attachedGameCard?: any;
    isReported?: boolean;
    reportReasons?: string[];
    timestamp: number;
  }>;
  reactions: Record<string, boolean>; // key: `${postId}_${userId}`
  comments: Record<string, {
    id: string;
    postId: string;
    authorId?: string;
    authorName: string;
    authorChild?: string;
    text: string;
    createdAt: string;
    timestamp: number;
  }>;
  replies: Record<string, {
    id: string;
    commentId: string;
    postId: string;
    authorId?: string;
    authorName: string;
    authorChild?: string;
    text: string;
    createdAt: string;
    timestamp: number;
  }>;
}

class CommunityDbEngine {
  private sqliteDb: any = null;
  private jsonStorePath: string = path.join(DATA_DIR, 'community_store.json');
  private memoryData: StorageSchema = {
    profiles: {},
    posts: {},
    reactions: {},
    comments: {},
    replies: {}
  };
  private useSqlite: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    // 1. Try Node.js built-in node:sqlite (Node 22.5+)
    try {
      // Use dynamic require to avoid bundling issues if node:sqlite isn't available
      const nodeSqlite = require('node:sqlite');
      if (nodeSqlite && nodeSqlite.DatabaseSync) {
        const dbPath = path.join(DATA_DIR, 'app.db');
        this.sqliteDb = new nodeSqlite.DatabaseSync(dbPath);
        try {
          this.sqliteDb.exec('PRAGMA journal_mode = WAL;');
        } catch {}
        this.useSqlite = true;
        this.initSqliteSchema();
        this.seedIfNeeded();
        console.log(`[Community DB] Initialized SQLite database at ${dbPath}`);
        return;
      }
    } catch (err: any) {
      // node:sqlite not available or error, try better-sqlite3
    }

    // 2. Try better-sqlite3 if installed
    try {
      const BetterSqlite = require('better-sqlite3');
      const dbPath = path.join(DATA_DIR, 'app.db');
      this.sqliteDb = new BetterSqlite(dbPath);
      try {
        this.sqliteDb.pragma('journal_mode = WAL');
      } catch {}
      this.useSqlite = true;
      this.initSqliteSchema();
      this.seedIfNeeded();
      console.log(`[Community DB] Initialized better-sqlite3 at ${dbPath}`);
      return;
    } catch (err: any) {
      // fallback to atomic persistent JSON store in DATA_DIR
    }

    // 3. Fallback: Robust Atomic File-based Store in DATA_DIR
    console.log(`[Community DB] Using atomic file store at ${this.jsonStorePath}`);
    this.initJsonStore();
    this.seedIfNeeded();
  }

  private initSqliteSchema() {
    if (!this.sqliteDb) return;
    this.sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS social_profiles (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        child_name TEXT,
        child_age INTEGER DEFAULT 5,
        bio TEXT,
        badge TEXT,
        avatar_color TEXT,
        helpful_count_received INTEGER DEFAULT 0,
        posts_count INTEGER DEFAULT 0,
        joined_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS experience_posts (
        id TEXT PRIMARY KEY,
        author_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        author_child_name TEXT,
        author_child_age INTEGER DEFAULT 5,
        text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        helpful_count INTEGER DEFAULT 0,
        attached_game_json TEXT,
        is_reported INTEGER DEFAULT 0,
        report_reasons_json TEXT DEFAULT '[]',
        timestamp INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS post_helpful_reactions (
        post_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        created_at TEXT,
        PRIMARY KEY (post_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS post_comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        author_id TEXT,
        author_name TEXT NOT NULL,
        author_child TEXT,
        text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS comment_replies (
        id TEXT PRIMARY KEY,
        comment_id TEXT NOT NULL,
        post_id TEXT NOT NULL,
        author_id TEXT,
        author_name TEXT NOT NULL,
        author_child TEXT,
        text TEXT NOT NULL,
        created_at TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_posts_author ON experience_posts(author_id);
      CREATE INDEX IF NOT EXISTS idx_comments_post ON post_comments(post_id);
      CREATE INDEX IF NOT EXISTS idx_replies_comment ON comment_replies(comment_id);
    `);
  }

  private initJsonStore() {
    if (fs.existsSync(this.jsonStorePath)) {
      try {
        const raw = fs.readFileSync(this.jsonStorePath, 'utf8');
        this.memoryData = JSON.parse(raw);
        if (!this.memoryData.profiles) this.memoryData.profiles = {};
        if (!this.memoryData.posts) this.memoryData.posts = {};
        if (!this.memoryData.reactions) this.memoryData.reactions = {};
        if (!this.memoryData.comments) this.memoryData.comments = {};
        if (!this.memoryData.replies) this.memoryData.replies = {};
      } catch (e) {
        console.error('[Community DB] Error reading JSON store, initializing fresh:', e);
      }
    } else {
      this.flushJsonStore();
    }
  }

  private flushJsonStore() {
    const tmpPath = `${this.jsonStorePath}.tmp`;
    try {
      fs.writeFileSync(tmpPath, JSON.stringify(this.memoryData, null, 2), 'utf8');
      fs.renameSync(tmpPath, this.jsonStorePath);
    } catch (err) {
      console.error('[Community DB] Error flushing JSON store:', err);
    }
  }

  private seedIfNeeded() {
    // Check if rich community posts already exist with the latest v4 content
    let needsSeed = false;
    if (this.useSqlite) {
      const p = this.sqliteDb.prepare("SELECT id FROM experience_posts WHERE id = 'post_v4_1'").get() as any;
      if (!p) {
        needsSeed = true;
      }
    } else {
      if (!this.memoryData.posts['post_v4_1']) {
        needsSeed = true;
      }
    }

    if (!needsSeed) return;

    console.log('[Community DB] Seeding 26 diverse, realistic community posts and Quranic parent personas...');
    if (this.useSqlite) {
      // Purge any legacy mock visitor record so visitors start clean
      this.sqliteDb.exec(`
        DELETE FROM social_profiles WHERE id = 'user_me';
      `);

      const insertProf = this.sqliteDb.prepare(`
        INSERT OR REPLACE INTO social_profiles (id, username, child_name, child_age, bio, badge, avatar_color, helpful_count_received, posts_count, joined_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of initialProfiles) {
        insertProf.run(p.id, p.username, p.childName, p.childAge, p.bio || '', p.badge || '', p.avatarColor || '', p.helpfulCountReceived, p.postsCount, p.joinedAt || '', new Date().toISOString());
      }

      const insertPost = this.sqliteDb.prepare(`
        INSERT OR REPLACE INTO experience_posts (id, author_id, author_name, author_child_name, author_child_age, text, created_at, helpful_count, attached_game_json, is_reported, report_reasons_json, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const insertComm = this.sqliteDb.prepare(`
        INSERT OR REPLACE INTO post_comments (id, post_id, author_name, author_child, text, created_at, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const insertRep = this.sqliteDb.prepare(`
        INSERT OR REPLACE INTO comment_replies (id, comment_id, post_id, author_name, author_child, text, created_at, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const post of initialPosts) {
        insertPost.run(
          post.id,
          post.authorId,
          post.authorName,
          post.authorChildName,
          post.authorChildAge,
          post.text,
          post.createdAt,
          post.helpfulCount,
          post.attachedGameCard ? JSON.stringify(post.attachedGameCard) : null,
          0,
          '[]',
          post.timestamp
        );

        if (Array.isArray(post.comments)) {
          for (const c of post.comments) {
            insertComm.run(c.id, post.id, c.authorName, c.authorChild || '', c.text, c.createdAt, c.timestamp || post.timestamp);
            if (Array.isArray(c.replies)) {
              for (const r of c.replies) {
                insertRep.run(r.id, c.id, post.id, r.authorName, r.authorChild || '', r.text, r.createdAt, r.timestamp || post.timestamp);
              }
            }
          }
        }
      }
    } else {
      delete this.memoryData.profiles['user_me'];
      for (const p of initialProfiles) {
        this.memoryData.profiles[p.id] = p;
      }
      for (const post of initialPosts) {
        this.memoryData.posts[post.id] = {
          id: post.id,
          authorId: post.authorId,
          authorName: post.authorName,
          authorChildName: post.authorChildName,
          authorChildAge: post.authorChildAge,
          text: post.text,
          createdAt: post.createdAt,
          helpfulCount: post.helpfulCount,
          attachedGameCard: post.attachedGameCard,
          isReported: false,
          reportReasons: [],
          timestamp: post.timestamp
        };
        if (Array.isArray(post.comments)) {
          for (const c of post.comments) {
            this.memoryData.comments[c.id] = {
              id: c.id,
              postId: post.id,
              authorName: c.authorName,
              authorChild: c.authorChild || '',
              text: c.text,
              createdAt: c.createdAt,
              timestamp: c.timestamp || post.timestamp
            };
            if (Array.isArray(c.replies)) {
              for (const r of c.replies) {
                this.memoryData.replies[r.id] = {
                  id: r.id,
                  commentId: c.id,
                  postId: post.id,
                  authorName: r.authorName,
                  authorChild: r.authorChild || '',
                  text: r.text,
                  createdAt: r.createdAt,
                  timestamp: r.timestamp || post.timestamp
                };
              }
            }
          }
        }
      }
      this.flushJsonStore();
    }
  }

  // --- Public CRUD Methods ---

  public getAllPosts(currentUserId?: string): DbPost[] {
    if (this.useSqlite) {
      const postsRows = this.sqliteDb.prepare(`
        SELECT p.*, prof.badge as authorBadge, prof.avatar_color as authorAvatarColor
        FROM experience_posts p
        LEFT JOIN social_profiles prof ON p.author_id = prof.id
        ORDER BY p.timestamp DESC
      `).all() as any[];

      const userReactions = new Set<string>();
      if (currentUserId) {
        const reacts = this.sqliteDb.prepare(`
          SELECT post_id FROM post_helpful_reactions WHERE user_id = ?
        `).all(currentUserId) as any[];
        reacts.forEach(r => userReactions.add(r.post_id));
      }

      const allComments = this.sqliteDb.prepare(`
        SELECT * FROM post_comments ORDER BY timestamp ASC
      `).all() as any[];

      const allReplies = this.sqliteDb.prepare(`
        SELECT * FROM comment_replies ORDER BY timestamp ASC
      `).all() as any[];

      const repliesByComment = new Map<string, DbReply[]>();
      for (const r of allReplies) {
        if (!repliesByComment.has(r.comment_id)) {
          repliesByComment.set(r.comment_id, []);
        }
        repliesByComment.get(r.comment_id)!.push({
          id: r.id,
          authorName: r.author_name,
          authorChild: r.author_child,
          text: r.text,
          createdAt: r.created_at,
        });
      }

      const commentsByPost = new Map<string, DbComment[]>();
      for (const c of allComments) {
        if (!commentsByPost.has(c.post_id)) {
          commentsByPost.set(c.post_id, []);
        }
        commentsByPost.get(c.post_id)!.push({
          id: c.id,
          authorName: c.author_name,
          authorChild: c.author_child,
          text: c.text,
          createdAt: c.created_at,
          replies: repliesByComment.get(c.id) || []
        });
      }

      return postsRows.map(row => ({
        id: row.id,
        authorId: row.author_id,
        authorName: row.author_name,
        authorChildName: row.author_child_name,
        authorChildAge: Number(row.author_child_age) || 5,
        authorBadge: row.authorBadge || undefined,
        authorAvatarColor: row.authorAvatarColor || undefined,
        text: row.text,
        createdAt: row.created_at,
        helpfulCount: Number(row.helpful_count) || 0,
        hasUserMarkedHelpful: userReactions.has(row.id),
        attachedGameCard: row.attached_game_json ? JSON.parse(row.attached_game_json) : undefined,
        comments: commentsByPost.get(row.id) || [],
        isOwn: Boolean(currentUserId && row.author_id === currentUserId),
        isReported: Boolean(row.is_reported)
      }));
    } else {
      // Memory/JSON Store
      const postsArray = Object.values(this.memoryData.posts).sort((a, b) => b.timestamp - a.timestamp);
      return postsArray.map(post => {
        const prof = this.memoryData.profiles[post.authorId];
        const postComments = Object.values(this.memoryData.comments)
          .filter(c => c.postId === post.id)
          .sort((a, b) => a.timestamp - b.timestamp)
          .map(c => {
            const commentReplies = Object.values(this.memoryData.replies)
              .filter(r => r.commentId === c.id)
              .sort((a, b) => a.timestamp - b.timestamp)
              .map(r => ({
                id: r.id,
                authorName: r.authorName,
                authorChild: r.authorChild,
                text: r.text,
                createdAt: r.createdAt
              }));
            return {
              id: c.id,
              authorName: c.authorName,
              authorChild: c.authorChild,
              text: c.text,
              createdAt: c.createdAt,
              replies: commentReplies
            };
          });

        const hasReacted = currentUserId ? Boolean(this.memoryData.reactions[`${post.id}_${currentUserId}`]) : false;

        return {
          id: post.id,
          authorId: post.authorId,
          authorName: post.authorName,
          authorChildName: post.authorChildName,
          authorChildAge: post.authorChildAge,
          authorBadge: prof?.badge,
          authorAvatarColor: prof?.avatarColor,
          text: post.text,
          createdAt: post.createdAt,
          helpfulCount: post.helpfulCount,
          hasUserMarkedHelpful: hasReacted,
          attachedGameCard: post.attachedGameCard,
          comments: postComments,
          isOwn: Boolean(currentUserId && post.authorId === currentUserId),
          isReported: post.isReported
        };
      });
    }
  }

  public createPost(data: {
    authorId: string;
    authorName: string;
    authorChildName: string;
    authorChildAge: number;
    text: string;
    attachedGameCard?: any;
  }): DbPost {
    const id = `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = 'لحظاتی پیش';
    const timestamp = Date.now();

    // Ensure author profile exists
    this.upsertProfile({
      id: data.authorId,
      username: data.authorName,
      childName: data.authorChildName,
      childAge: data.authorChildAge,
    });

    if (this.useSqlite) {
      this.sqliteDb.prepare(`
        INSERT INTO experience_posts (id, author_id, author_name, author_child_name, author_child_age, text, created_at, helpful_count, attached_game_json, is_reported, report_reasons_json, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, 0, '[]', ?)
      `).run(
        id,
        data.authorId,
        data.authorName,
        data.authorChildName,
        data.authorChildAge,
        data.text,
        createdAt,
        data.attachedGameCard ? JSON.stringify(data.attachedGameCard) : null,
        timestamp
      );

      this.sqliteDb.prepare(`
        UPDATE social_profiles SET posts_count = posts_count + 1 WHERE id = ?
      `).run(data.authorId);
    } else {
      this.memoryData.posts[id] = {
        id,
        authorId: data.authorId,
        authorName: data.authorName,
        authorChildName: data.authorChildName,
        authorChildAge: data.authorChildAge,
        text: data.text,
        createdAt,
        helpfulCount: 0,
        attachedGameCard: data.attachedGameCard,
        isReported: false,
        reportReasons: [],
        timestamp
      };
      if (this.memoryData.profiles[data.authorId]) {
        this.memoryData.profiles[data.authorId].postsCount += 1;
      }
      this.flushJsonStore();
    }

    const prof = this.getProfile(data.authorId);

    return {
      id,
      authorId: data.authorId,
      authorName: data.authorName,
      authorChildName: data.authorChildName,
      authorChildAge: data.authorChildAge,
      authorBadge: prof?.badge,
      authorAvatarColor: prof?.avatarColor,
      text: data.text,
      createdAt,
      helpfulCount: 0,
      hasUserMarkedHelpful: false,
      attachedGameCard: data.attachedGameCard,
      comments: [],
      isOwn: true,
      isReported: false
    };
  }

  public updatePost(postId: string, text: string): boolean {
    if (this.useSqlite) {
      const res = this.sqliteDb.prepare(`
        UPDATE experience_posts SET text = ? WHERE id = ?
      `).run(text, postId);
      return res.changes > 0;
    } else {
      if (this.memoryData.posts[postId]) {
        this.memoryData.posts[postId].text = text;
        this.flushJsonStore();
        return true;
      }
      return false;
    }
  }

  public deletePost(postId: string): boolean {
    if (this.useSqlite) {
      const post = this.sqliteDb.prepare('SELECT author_id FROM experience_posts WHERE id = ?').get(postId) as any;
      if (post) {
        this.sqliteDb.prepare('DELETE FROM comment_replies WHERE post_id = ?').run(postId);
        this.sqliteDb.prepare('DELETE FROM post_comments WHERE post_id = ?').run(postId);
        this.sqliteDb.prepare('DELETE FROM post_helpful_reactions WHERE post_id = ?').run(postId);
        this.sqliteDb.prepare('DELETE FROM experience_posts WHERE id = ?').run(postId);
        this.sqliteDb.prepare('UPDATE social_profiles SET posts_count = MAX(0, posts_count - 1) WHERE id = ?').run(post.author_id);
        return true;
      }
      return false;
    } else {
      const post = this.memoryData.posts[postId];
      if (post) {
        delete this.memoryData.posts[postId];
        if (this.memoryData.profiles[post.authorId]) {
          this.memoryData.profiles[post.authorId].postsCount = Math.max(0, this.memoryData.profiles[post.authorId].postsCount - 1);
        }
        // remove comments & replies
        for (const cid in this.memoryData.comments) {
          if (this.memoryData.comments[cid].postId === postId) {
            delete this.memoryData.comments[cid];
          }
        }
        for (const rid in this.memoryData.replies) {
          if (this.memoryData.replies[rid].postId === postId) {
            delete this.memoryData.replies[rid];
          }
        }
        this.flushJsonStore();
        return true;
      }
      return false;
    }
  }

  public toggleHelpful(postId: string, userId: string): { hasUserMarkedHelpful: boolean; helpfulCount: number } {
    if (this.useSqlite) {
      const existing = this.sqliteDb.prepare(`
        SELECT * FROM post_helpful_reactions WHERE post_id = ? AND user_id = ?
      `).get(postId, userId);

      const post = this.sqliteDb.prepare('SELECT author_id, helpful_count FROM experience_posts WHERE id = ?').get(postId) as any;
      if (!post) {
        return { hasUserMarkedHelpful: false, helpfulCount: 0 };
      }

      if (existing) {
        // Unlike
        this.sqliteDb.prepare('DELETE FROM post_helpful_reactions WHERE post_id = ? AND user_id = ?').run(postId, userId);
        this.sqliteDb.prepare('UPDATE experience_posts SET helpful_count = MAX(0, helpful_count - 1) WHERE id = ?').run(postId);
        this.sqliteDb.prepare('UPDATE social_profiles SET helpful_count_received = MAX(0, helpful_count_received - 1) WHERE id = ?').run(post.author_id);
        const updated = this.sqliteDb.prepare('SELECT helpful_count FROM experience_posts WHERE id = ?').get(postId) as any;
        return { hasUserMarkedHelpful: false, helpfulCount: Number(updated.helpful_count) || 0 };
      } else {
        // Like
        this.sqliteDb.prepare('INSERT INTO post_helpful_reactions (post_id, user_id, created_at) VALUES (?, ?, ?)').run(postId, userId, new Date().toISOString());
        this.sqliteDb.prepare('UPDATE experience_posts SET helpful_count = helpful_count + 1 WHERE id = ?').run(postId);
        this.sqliteDb.prepare('UPDATE social_profiles SET helpful_count_received = helpful_count_received + 1 WHERE id = ?').run(post.author_id);
        const updated = this.sqliteDb.prepare('SELECT helpful_count FROM experience_posts WHERE id = ?').get(postId) as any;
        return { hasUserMarkedHelpful: true, helpfulCount: Number(updated.helpful_count) || 0 };
      }
    } else {
      const key = `${postId}_${userId}`;
      const post = this.memoryData.posts[postId];
      if (!post) return { hasUserMarkedHelpful: false, helpfulCount: 0 };

      if (this.memoryData.reactions[key]) {
        delete this.memoryData.reactions[key];
        post.helpfulCount = Math.max(0, post.helpfulCount - 1);
        if (this.memoryData.profiles[post.authorId]) {
          this.memoryData.profiles[post.authorId].helpfulCountReceived = Math.max(0, this.memoryData.profiles[post.authorId].helpfulCountReceived - 1);
        }
        this.flushJsonStore();
        return { hasUserMarkedHelpful: false, helpfulCount: post.helpfulCount };
      } else {
        this.memoryData.reactions[key] = true;
        post.helpfulCount += 1;
        if (this.memoryData.profiles[post.authorId]) {
          this.memoryData.profiles[post.authorId].helpfulCountReceived += 1;
        }
        this.flushJsonStore();
        return { hasUserMarkedHelpful: true, helpfulCount: post.helpfulCount };
      }
    }
  }

  public addComment(postId: string, data: { authorId?: string; authorName: string; authorChild?: string; text: string }): DbComment {
    const id = `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = 'لحظاتی پیش';
    const timestamp = Date.now();

    if (this.useSqlite) {
      this.sqliteDb.prepare(`
        INSERT INTO post_comments (id, post_id, author_id, author_name, author_child, text, created_at, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, postId, data.authorId || null, data.authorName, data.authorChild || null, data.text, createdAt, timestamp);
    } else {
      this.memoryData.comments[id] = {
        id,
        postId,
        authorId: data.authorId,
        authorName: data.authorName,
        authorChild: data.authorChild,
        text: data.text,
        createdAt,
        timestamp
      };
      this.flushJsonStore();
    }

    return {
      id,
      authorName: data.authorName,
      authorChild: data.authorChild,
      text: data.text,
      createdAt,
      replies: []
    };
  }

  public addReply(postId: string, commentId: string, data: { authorId?: string; authorName: string; authorChild?: string; text: string }): DbReply {
    const id = `r_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = 'لحظاتی پیش';
    const timestamp = Date.now();

    if (this.useSqlite) {
      this.sqliteDb.prepare(`
        INSERT INTO comment_replies (id, comment_id, post_id, author_id, author_name, author_child, text, created_at, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, commentId, postId, data.authorId || null, data.authorName, data.authorChild || null, data.text, createdAt, timestamp);
    } else {
      this.memoryData.replies[id] = {
        id,
        commentId,
        postId,
        authorId: data.authorId,
        authorName: data.authorName,
        authorChild: data.authorChild,
        text: data.text,
        createdAt,
        timestamp
      };
      this.flushJsonStore();
    }

    return {
      id,
      authorName: data.authorName,
      authorChild: data.authorChild,
      text: data.text,
      createdAt
    };
  }

  public reportPost(postId: string, reason: string): boolean {
    if (this.useSqlite) {
      const row = this.sqliteDb.prepare('SELECT report_reasons_json FROM experience_posts WHERE id = ?').get(postId) as any;
      if (row) {
        let reasons: string[] = [];
        try {
          reasons = JSON.parse(row.report_reasons_json || '[]');
        } catch {}
        reasons.push(reason);
        this.sqliteDb.prepare(`
          UPDATE experience_posts SET is_reported = 1, report_reasons_json = ? WHERE id = ?
        `).run(JSON.stringify(reasons), postId);
        return true;
      }
      return false;
    } else {
      const post = this.memoryData.posts[postId];
      if (post) {
        post.isReported = true;
        if (!post.reportReasons) post.reportReasons = [];
        post.reportReasons.push(reason);
        this.flushJsonStore();
        return true;
      }
      return false;
    }
  }

  public getProfile(profileId: string): DbSocialProfile | null {
    if (this.useSqlite) {
      const row = this.sqliteDb.prepare('SELECT * FROM social_profiles WHERE id = ?').get(profileId) as any;
      if (!row) return null;
      return {
        id: row.id,
        username: row.username,
        childName: row.child_name || '',
        childAge: Number(row.child_age) || 5,
        bio: row.bio || '',
        badge: row.badge || 'همراه قرآنی',
        avatarColor: row.avatar_color || 'bg-[#FEE4D6] text-[#D97706]',
        helpfulCountReceived: Number(row.helpful_count_received) || 0,
        postsCount: Number(row.posts_count) || 0,
        joinedAt: row.joined_at || 'عضو باسابقه'
      };
    } else {
      return this.memoryData.profiles[profileId] || null;
    }
  }

  public getAllProfiles(): DbSocialProfile[] {
    if (this.useSqlite) {
      const rows = this.sqliteDb.prepare('SELECT * FROM social_profiles ORDER BY helpful_count_received DESC').all() as any[];
      return rows.map(row => ({
        id: row.id,
        username: row.username,
        childName: row.child_name || '',
        childAge: Number(row.child_age) || 5,
        bio: row.bio || '',
        badge: row.badge || 'همراه قرآنی',
        avatarColor: row.avatar_color || 'bg-[#FEE4D6] text-[#D97706]',
        helpfulCountReceived: Number(row.helpful_count_received) || 0,
        postsCount: Number(row.posts_count) || 0,
        joinedAt: row.joined_at || 'عضو باسابقه'
      }));
    } else {
      return Object.values(this.memoryData.profiles);
    }
  }

  public upsertProfile(data: {
    id: string;
    username: string;
    childName?: string;
    childAge?: number;
    bio?: string;
    badge?: string;
    avatarColor?: string;
  }): DbSocialProfile {
    const existing = this.getProfile(data.id);
    const joinedAt = existing?.joinedAt || 'عضو جدید';
    const helpfulCountReceived = existing?.helpfulCountReceived || 0;
    const postsCount = existing?.postsCount || 0;
    const bio = data.bio !== undefined ? data.bio : (existing?.bio || 'مادر همراه در مسیر انس با قرآن');
    const badge = data.badge !== undefined ? data.badge : (existing?.badge || 'همراه قرآنی');
    const avatarColor = data.avatarColor !== undefined ? data.avatarColor : (existing?.avatarColor || 'bg-[#FEE4D6] text-[#D97706]');
    const childName = data.childName !== undefined ? data.childName : (existing?.childName || 'فرزندم');
    const childAge = data.childAge !== undefined ? data.childAge : (existing?.childAge || 5);

    if (this.useSqlite) {
      this.sqliteDb.prepare(`
        INSERT INTO social_profiles (id, username, child_name, child_age, bio, badge, avatar_color, helpful_count_received, posts_count, joined_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          username = excluded.username,
          child_name = excluded.child_name,
          child_age = excluded.child_age,
          bio = COALESCE(NULLIF(excluded.bio, ''), social_profiles.bio),
          badge = COALESCE(NULLIF(excluded.badge, ''), social_profiles.badge),
          avatar_color = COALESCE(NULLIF(excluded.avatar_color, ''), social_profiles.avatar_color),
          updated_at = excluded.updated_at
      `).run(
        data.id,
        data.username,
        childName,
        childAge,
        bio,
        badge,
        avatarColor,
        helpfulCountReceived,
        postsCount,
        joinedAt,
        new Date().toISOString()
      );
    } else {
      this.memoryData.profiles[data.id] = {
        id: data.id,
        username: data.username,
        childName,
        childAge,
        bio,
        badge,
        avatarColor,
        helpfulCountReceived,
        postsCount,
        joinedAt
      };
      this.flushJsonStore();
    }

    return this.getProfile(data.id)!;
  }
}

export const communityDb = new CommunityDbEngine();

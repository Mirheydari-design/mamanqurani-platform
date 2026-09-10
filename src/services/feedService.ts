import { ExperiencePost, GameCard, Comment, Reply, SocialAuthorProfile, UserProfile, Child } from '../types';
import { initialExperiences } from '../data/initialData';

const STORAGE_KEY = 'quran_app_experiences_v2';

class FeedService {
  /**
   * Load posts from server database with offline local cache fallback
   */
  async getPosts(currentUserId?: string): Promise<ExperiencePost[]> {
    try {
      const url = currentUserId ? `/api/feed/posts?userId=${encodeURIComponent(currentUserId)}` : '/api/feed/posts';
      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.posts) && data.posts.length > 0) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.posts));
          } catch {}
          return data.posts;
        }
      }
    } catch (err) {
      console.warn('[FeedService] Failed to fetch from server, falling back to cache:', err);
    }

    // Fallback to local storage or initial data
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialExperiences;
  }

  /**
   * Create a new post in the database
   */
  async createPost(postData: {
    authorId: string;
    authorName: string;
    authorChildName: string;
    authorChildAge: number;
    text: string;
    attachedGameCard?: GameCard;
  }): Promise<ExperiencePost> {
    try {
      const res = await fetch('/api/feed/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.post) return data.post;
      }
    } catch (err) {
      console.warn('[FeedService] Error creating post on server:', err);
    }

    // Optimistic fallback
    return {
      id: `post_${Date.now()}`,
      authorId: postData.authorId,
      authorName: postData.authorName,
      authorChildName: postData.authorChildName,
      authorChildAge: postData.authorChildAge,
      text: postData.text,
      createdAt: 'لحظاتی پیش',
      helpfulCount: 0,
      hasUserMarkedHelpful: false,
      attachedGameCard: postData.attachedGameCard,
      comments: [],
      isOwn: true,
      isReported: false,
    };
  }

  /**
   * Update post text
   */
  async updatePost(postId: string, text: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/feed/posts/${encodeURIComponent(postId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      return res.ok;
    } catch (err) {
      console.warn('[FeedService] Error updating post:', err);
      return false;
    }
  }

  /**
   * Delete post
   */
  async deletePost(postId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/feed/posts/${encodeURIComponent(postId)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch (err) {
      console.warn('[FeedService] Error deleting post:', err);
      return false;
    }
  }

  /**
   * Toggle helpful reaction ("استفاده کردم")
   */
  async toggleHelpful(postId: string, userId: string): Promise<{ hasUserMarkedHelpful: boolean; helpfulCount: number } | null> {
    try {
      const res = await fetch(`/api/feed/posts/${encodeURIComponent(postId)}/helpful`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[FeedService] Error toggling helpful:', err);
    }
    return null;
  }

  /**
   * Add a comment to post
   */
  async addComment(postId: string, commentData: {
    authorId?: string;
    authorName: string;
    authorChild?: string;
    text: string;
  }): Promise<Comment | null> {
    try {
      const res = await fetch(`/api/feed/posts/${encodeURIComponent(postId)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentData),
      });
      if (res.ok) {
        const data = await res.json();
        return data.comment;
      }
    } catch (err) {
      console.warn('[FeedService] Error adding comment:', err);
    }
    return null;
  }

  /**
   * Add a reply to comment
   */
  async addReply(postId: string, commentId: string, replyData: {
    authorId?: string;
    authorName: string;
    authorChild?: string;
    text: string;
  }): Promise<Reply | null> {
    try {
      const res = await fetch(`/api/feed/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(replyData),
      });
      if (res.ok) {
        const data = await res.json();
        return data.reply;
      }
    } catch (err) {
      console.warn('[FeedService] Error adding reply:', err);
    }
    return null;
  }

  /**
   * Report post
   */
  async reportPost(postId: string, reason: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/feed/posts/${encodeURIComponent(postId)}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      return res.ok;
    } catch (err) {
      console.warn('[FeedService] Error reporting post:', err);
      return false;
    }
  }

  /**
   * Get an author's public profile and their shared experiences
   */
  async getAuthorProfile(authorId: string): Promise<{ profile: SocialAuthorProfile; posts: ExperiencePost[] } | null> {
    try {
      const res = await fetch(`/api/feed/profiles/${encodeURIComponent(authorId)}`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (err) {
      console.warn('[FeedService] Error getting author profile:', err);
    }
    return null;
  }

  /**
   * Sync current mother's profile with the community database
   */
  async syncUserProfile(profile: UserProfile, activeChild?: Child): Promise<void> {
    try {
      const childName = activeChild?.name || (profile.children.length > 0 ? profile.children[0].name : 'فرزندم');
      const childAge = activeChild?.age || (profile.children.length > 0 ? profile.children[0].age : 5);

      await fetch('/api/feed/profiles/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile.id,
          username: profile.username || `مادر ${childName}`,
          childName,
          childAge,
          bio: activeChild?.goal ? `هدف: ${activeChild.goal}` : 'مادر قرآن‌آموز و همراه در حفظ و تدبر',
          badge: profile.children.length > 1 ? 'مادر چندفرزندی' : 'پیشگام حفظ',
          avatarColor: activeChild?.avatarColor || 'bg-[#FEE4D6] text-[#D97706]'
        }),
      });
    } catch (err) {
      // ignore sync errors silently
    }
  }
}

export const feedService = new FeedService();

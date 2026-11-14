const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, '../data/db.json');

// Migrates posts and comments from upvotes/downvotes arrays to dedicated votes collection
function migrateVotes() {
  if (!fs.existsSync(dbPath)) {
    console.log('No db.json found to migrate.');
    return;
  }

  const raw = fs.readFileSync(dbPath, 'utf8');
  const db = JSON.parse(raw);

  db.votes = db.votes || [];
  const existingVoteKeys = new Set(db.votes.map(v => `${v.user}:${v.targetType}:${v.targetId}`));

  let migratedPostVotes = 0;
  let migratedCommentVotes = 0;

  // Migrate post votes
  if (Array.isArray(db.posts)) {
    db.posts.forEach(post => {
      const up = Array.isArray(post.upvotes) ? post.upvotes : [];
      const down = Array.isArray(post.downvotes) ? post.downvotes : [];

      up.forEach(userId => {
        const key = `${userId}:post:${post._id}`;
        if (!existingVoteKeys.has(key)) {
          db.votes.push({
            _id: crypto.randomUUID(),
            user: userId,
            targetType: 'post',
            targetId: post._id,
            value: 1,
            createdAt: post.createdAt || new Date().toISOString()
          });
          existingVoteKeys.add(key);
          migratedPostVotes++;
        }
      });

      down.forEach(userId => {
        const key = `${userId}:post:${post._id}`;
        if (!existingVoteKeys.has(key)) {
          db.votes.push({
            _id: crypto.randomUUID(),
            user: userId,
            targetType: 'post',
            targetId: post._id,
            value: -1,
            createdAt: post.createdAt || new Date().toISOString()
          });
          existingVoteKeys.add(key);
          migratedPostVotes++;
        }
      });

      post.score = typeof post.score === 'number' ? post.score : (up.length - down.length);
      delete post.upvotes;
      delete post.downvotes;
    });
  }

  // Migrate comment votes
  if (Array.isArray(db.comments)) {
    db.comments.forEach(comment => {
      const up = Array.isArray(comment.upvotes) ? comment.upvotes : [];
      const down = Array.isArray(comment.downvotes) ? comment.downvotes : [];

      up.forEach(userId => {
        const key = `${userId}:comment:${comment._id}`;
        if (!existingVoteKeys.has(key)) {
          db.votes.push({
            _id: crypto.randomUUID(),
            user: userId,
            targetType: 'comment',
            targetId: comment._id,
            value: 1,
            createdAt: comment.createdAt || new Date().toISOString()
          });
          existingVoteKeys.add(key);
          migratedCommentVotes++;
        }
      });

      down.forEach(userId => {
        const key = `${userId}:comment:${comment._id}`;
        if (!existingVoteKeys.has(key)) {
          db.votes.push({
            _id: crypto.randomUUID(),
            user: userId,
            targetType: 'comment',
            targetId: comment._id,
            value: -1,
            createdAt: comment.createdAt || new Date().toISOString()
          });
          existingVoteKeys.add(key);
          migratedCommentVotes++;
        }
      });

      comment.score = typeof comment.score === 'number' ? comment.score : (up.length - down.length);
      delete comment.upvotes;
      delete comment.downvotes;
    });
  }

  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  console.log(`Vote migration complete. Migrated ${migratedPostVotes} post votes and ${migratedCommentVotes} comment votes.`);
  console.log(`Total votes in collection: ${db.votes.length}`);
}

if (require.main === module) {
  migrateVotes();
}

module.exports = migrateVotes;

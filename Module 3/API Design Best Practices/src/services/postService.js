const store = require('../data/postStore');
const http = require('../utils/http');

const DEFAULT_LIMIT = 2;
const MAX_LIMIT = 100;

function parsePositiveInteger(value, fallback, field) {
  if (value === undefined) {
    return fallback;
  }

  const number = Number(value);

  if (!Number.isInteger(number) || number < 1) {
    throw http.createError(
      400,
      'INVALID_QUERY',
      `${field} must be a positive integer`
    );
  }

  return number;
}

function listPosts(query = {}) {
  const page = parsePositiveInteger(query.page, 1, 'page');
  const requestedLimit = parsePositiveInteger(
    query.limit,
    DEFAULT_LIMIT,
    'limit'
  );

  // Protect the server from excessively large page sizes.
  const limit = Math.min(requestedLimit, MAX_LIMIT);

  const allPosts = store.getAllPosts();
  const total = allPosts.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const data = allPosts.slice(start, start + limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      pages
    }
  };
}

function getPost(id) {
  const post = store.getPostById(id);

  if (!post) {
    throw http.createError(
      404,
      'POST_NOT_FOUND',
      'Post not found'
    );
  }

  return post;
}

function createPost(body = {}) {
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body)
  ) {
    throw http.createError(
      400,
      'INVALID_BODY',
      'Request body must be a JSON object'
    );
  }

  const { title, author } = body;

  if (
    typeof title !== 'string' ||
    !title.trim() ||
    typeof author !== 'string' ||
    !author.trim()
  ) {
    throw http.createError(
      400,
      'INVALID_BODY',
      'Title and author are required'
    );
  }

  return store.createPost({
    title: title.trim(),
    author: author.trim()
  });
}

function likePost(id) {
  const post = store.incrementLikes(id);

  if (!post) {
    throw http.createError(
      404,
      'POST_NOT_FOUND',
      'Post not found'
    );
  }

  return {
    id: post.id,
    likes: post.likes
  };
}

function explode() {
  // Intentionally simulate an internal failure for testing.
  throw new Error('Simulated internal failure');
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
// Simple manual validation rules without external libraries
const validateUsername = (username) => {
  if (typeof username !== 'string') return 'Username must be a string';
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 20) {
    return 'Username must be between 3 and 20 characters';
  }
  if (!/^[a-z0-9_]+$/.test(trimmed)) {
    return 'Username must contain only lowercase letters, numbers, and underscores';
  }
  return null;
};

const validatePassword = (password) => {
  if (typeof password !== 'string') return 'Password must be a string';
  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Password must contain at least one letter and one number';
  }
  return null;
};

const validatePost = (title, body) => {
  if (typeof title !== 'string' || !title.trim()) return 'Title is required';
  const trimmedTitle = title.trim();
  if (trimmedTitle.length < 5 || trimmedTitle.length > 200) {
    return 'Post title must be between 5 and 200 characters';
  }
  if (typeof body !== 'string' || !body.trim()) return 'Body is required';
  const trimmedBody = body.trim();
  if (trimmedBody.length < 10 || trimmedBody.length > 2000) {
    return 'Post body must be between 10 and 2000 characters';
  }
  return null;
};

const validateComment = (body) => {
  if (typeof body !== 'string' || !body.trim()) return 'Comment text is required';
  const trimmed = body.trim();
  if (trimmed.length < 1 || trimmed.length > 2000) {
    return 'Comment must be between 1 and 2000 characters';
  }
  return null;
};

module.exports = {
  validateUsername,
  validatePassword,
  validatePost,
  validateComment
};

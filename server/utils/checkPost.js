// Regular expressions for detecting emails and phone numbers to prevent doxxing
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}|\b\d{10,12}\b/;

// Checks text for private personal contact information
// Returns whether the submission should be blocked and sent to the Break Room
const checkContent = (...texts) => {
  const combined = texts.filter(Boolean).join(' ');

  if (EMAIL_REGEX.test(combined) || PHONE_REGEX.test(combined)) {
    return {
      blocked: true,
      reason: 'This post contains a phone number or email address. We cannot publish it. Swear all you want. Do not expose people.'
    };
  }

  return { blocked: false };
};

module.exports = {
  checkContent
};


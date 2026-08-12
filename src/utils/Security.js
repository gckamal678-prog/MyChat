export const sanitizeInput = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[m]));
};

// प्रयोग गर्ने तरिका:
// const safeText = sanitizeInput(userInput);

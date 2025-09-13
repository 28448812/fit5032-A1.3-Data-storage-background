const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Data file path
const COMMENTS_FILE_PATH = path.join(__dirname, '../data/comments.json');

// Initialize data file if it doesn't exist
const initDataFile = async () => {
  try {
    await fs.access(COMMENTS_FILE_PATH);
  } catch {
    // If file doesn't exist, create it with initial structure
    const initialData = {
      productComments: {}
    };
    await fs.writeFile(
      COMMENTS_FILE_PATH,
      JSON.stringify(initialData, null, 2),
      'utf8'
    );
  }
};

// Read all comment data
const readAllComments = async () => {
  await initDataFile();
  const data = await fs.readFile(COMMENTS_FILE_PATH, 'utf8');
  return JSON.parse(data);
};

// Save all comment data
const saveAllComments = async (data) => {
  await initDataFile();
  await fs.writeFile(
    COMMENTS_FILE_PATH,
    JSON.stringify(data, null, 2),
    'utf8'
  );
};

// Get reviews based on product ID
const getCommentsByProductId = async (productId) => {
  const data = await readAllComments();
  return data.productComments[productId] || [];
};

// Get all comments across all products
const getAllComments = async () => {
  const data = await readAllComments();
  const allComments = [];
  
  // Aggregate reviews of all products
  for (const productId in data.productComments) {
    const comments = data.productComments[productId].map(comment => ({
      ...comment,
      productId: productId 
    }));
    allComments.push(...comments);
  }
  
  // Sort by timestamp descending
  return allComments.sort((a, b) => b.timestamp - a.timestamp);
};

// Add a new comment
const addComment = async (productId, comment) => {
  const data = await readAllComments();
  
  // If there is no review array for the product ID, initialize an empty array
  if (!data.productComments[productId]) {
    data.productComments[productId] = [];
  }
  
  // Create a new comment object with a unique ID and timestamp
  const newComment = {
    id: uuidv4(),
    timestamp: Date.now(),
    edited: false,
    ...comment
  };
  
  data.productComments[productId].push(newComment);
  await saveAllComments(data);
  
  return newComment;
};

// Update an existing comment
const updateComment = async (productId, commentId, updatedContent) => {
  const data = await readAllComments();
  
  if (!data.productComments[productId]) {
    return null;
  }
  
  const commentIndex = data.productComments[productId].findIndex(
    comment => comment.id === commentId
  );
  
  if (commentIndex === -1) {
    return null;
  }
  
  // Update the comment content and mark it as edited
  data.productComments[productId][commentIndex].content = updatedContent;
  data.productComments[productId][commentIndex].edited = true;
  data.productComments[productId][commentIndex].lastEditTime = Date.now();
  
  await saveAllComments(data);
  return data.productComments[productId][commentIndex];
};

// Delete a comment
const deleteComment = async (productId, commentId) => {
  const data = await readAllComments();
  
  if (!data.productComments[productId]) {
    return false;
  }
  
  const initialLength = data.productComments[productId].length;
  data.productComments[productId] = data.productComments[productId].filter(
    comment => comment.id !== commentId
  );
  
  // If no comment was removed, return false
  if (data.productComments[productId].length === initialLength) {
    return false;
  }
  
  await saveAllComments(data);
  return true;
};

module.exports = {
  getCommentsByProductId,
  getAllComments, 
  addComment,
  updateComment,
  deleteComment
};

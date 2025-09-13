const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 评论数据文件路径
const COMMENTS_FILE_PATH = path.join(__dirname, '../data/comments.json');

// 初始化数据文件
const initDataFile = async () => {
  try {
    await fs.access(COMMENTS_FILE_PATH);
  } catch {
    // 如果文件不存在，创建并初始化
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

// 读取所有评论数据
const readAllComments = async () => {
  await initDataFile();
  const data = await fs.readFile(COMMENTS_FILE_PATH, 'utf8');
  return JSON.parse(data);
};

// 保存所有评论数据
const saveAllComments = async (data) => {
  await initDataFile();
  await fs.writeFile(
    COMMENTS_FILE_PATH,
    JSON.stringify(data, null, 2),
    'utf8'
  );
};

// 获取指定产品的评论
const getCommentsByProductId = async (productId) => {
  const data = await readAllComments();
  return data.productComments[productId] || [];
};

// 获取所有评论
const getAllComments = async () => {
  const data = await readAllComments();
  const allComments = [];
  
  // 遍历所有产品的评论，添加产品ID并收集到一个数组中
  for (const productId in data.productComments) {
    const comments = data.productComments[productId].map(comment => ({
      ...comment,
      productId: productId // 添加产品ID，方便前端关联
    }));
    allComments.push(...comments);
  }
  
  // 按时间戳排序，最新的评论在前
  return allComments.sort((a, b) => b.timestamp - a.timestamp);
};

// 添加新评论
const addComment = async (productId, comment) => {
  const data = await readAllComments();
  
  // 确保产品评论数组存在
  if (!data.productComments[productId]) {
    data.productComments[productId] = [];
  }
  
  // 生成唯一ID并添加时间戳
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

// 更新评论
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
  
  // 更新评论内容和标记
  data.productComments[productId][commentIndex].content = updatedContent;
  data.productComments[productId][commentIndex].edited = true;
  data.productComments[productId][commentIndex].lastEditTime = Date.now();
  
  await saveAllComments(data);
  return data.productComments[productId][commentIndex];
};

// 删除评论
const deleteComment = async (productId, commentId) => {
  const data = await readAllComments();
  
  if (!data.productComments[productId]) {
    return false;
  }
  
  const initialLength = data.productComments[productId].length;
  data.productComments[productId] = data.productComments[productId].filter(
    comment => comment.id !== commentId
  );
  
  // 如果评论数量没变，说明没找到要删除的评论
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

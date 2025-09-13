const Router = require('koa-router');
const router = new Router({ prefix: '/api/comments' });
const {
  getCommentsByProductId,
  getAllComments, 
  addComment,
  updateComment,
  deleteComment
} = require('../utils/dataHandler');

// 获取所有评论（新增路由）
router.get('/', async (ctx) => {
  try {
    const allComments = await getAllComments();
    ctx.status = 200;
    ctx.body = {
      success: true,
      count: allComments.length,
      data: allComments
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Failed to fetch all comments',
      error: error.message
    };
  }
});

// 获取指定产品的评论
router.get('/:productId', async (ctx) => {
  try {
    const { productId } = ctx.params;
    const comments = await getCommentsByProductId(productId);
    ctx.status = 200;
    ctx.body = {
      success: true,
      count: comments.length,
      data: comments
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    };
  }
});

// 添加新评论
router.post('/:productId', async (ctx) => {
  try {
    const { productId } = ctx.params;
    const { userName, content } = ctx.request.body;
    
    if (!userName || !content) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Username and content are required'
      };
      return;
    }
    
    const newComment = await addComment(productId, { userName, content });
    ctx.status = 201;
    ctx.body = {
      success: true,
      data: newComment
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Failed to add comment',
      error: error.message
    };
  }
});

// 更新评论
router.put('/:productId/:commentId', async (ctx) => {
  try {
    const { productId, commentId } = ctx.params;
    const { content } = ctx.request.body;
    
    if (!content) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Content is required'
      };
      return;
    }
    
    const updatedComment = await updateComment(productId, commentId, content);
    
    if (!updatedComment) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: 'Comment not found'
      };
      return;
    }
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      data: updatedComment
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Failed to update comment',
      error: error.message
    };
  }
});

// 删除评论
router.delete('/:productId/:commentId', async (ctx) => {
  try {
    const { productId, commentId } = ctx.params;
    const result = await deleteComment(productId, commentId);
    
    if (!result) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: 'Comment not found'
      };
      return;
    }
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: 'Comment deleted successfully'
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    };
  }
});

module.exports = router;

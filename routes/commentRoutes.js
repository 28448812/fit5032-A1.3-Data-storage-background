const Router = require('koa-router');
const router = new Router({ prefix: '/api/comments' });
const {
  getCommentsByProductId,
  getAllComments, 
  addComment,
  updateComment,
  deleteComment
} = require('../utils/dataHandler');

// Get all comments
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

// Get reviews by product ID
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

// add comment
router.post('/:productId', async (ctx) => {
  try {
    const { productId } = ctx.params;
    const { userName, content,RatingVal } = ctx.request.body;
    
    if (!userName || !content) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: 'Username and content are required'
      };
      return;
    }
    
    const newComment = await addComment(productId, { userName, content,RatingVal });
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

// update comment
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

// delete comment
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

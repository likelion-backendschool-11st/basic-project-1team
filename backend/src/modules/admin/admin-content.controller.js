import * as adminContentService from './admin-content.service.js';

// 질문·답변·게시글·댓글 관리는 대상 종류와 경로 id 이름만 다르다 (API 명세 10.3·10.4)
const createContentController = (type, idParam) => ({
  getContents: async (req, res) => {
    const { items, meta } = await adminContentService.getContents(type, req.validatedQuery);

    res.status(200).json({ success: true, data: items, meta });
  },

  getContentDetail: async (req, res) => {
    const item = await adminContentService.getContentDetail(type, Number(req.params[idParam]));

    res.status(200).json({ success: true, data: item });
  },

  updateContentStatus: async (req, res) => {
    const item = await adminContentService.updateContentStatus(
      req.user.id,
      type,
      Number(req.params[idParam]),
      req.body,
    );

    res.status(200).json({ success: true, data: item });
  },

  deleteContent: async (req, res) => {
    await adminContentService.deleteContent(req.user.id, type, Number(req.params[idParam]));

    res.status(204).end();
  },
});

export const questionController = createContentController('question', 'questionId');
export const answerController = createContentController('answer', 'answerId');
export const postController = createContentController('post', 'postId');
export const commentController = createContentController('comment', 'commentId');

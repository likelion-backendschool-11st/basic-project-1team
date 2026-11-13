import * as questionService from './question.service.js';

export const getQuestions = async (req, res) => {
  const { questions, meta } = await questionService.getQuestions(req.validatedQuery);

  res.status(200).json({ success: true, data: questions, meta });
};

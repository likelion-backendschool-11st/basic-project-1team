import * as questionService from './question.service.js';

export const getQuestions = async (req, res) => {
  const { questions, meta } = await questionService.getQuestions(req.validatedQuery);

  res.status(200).json({ success: true, data: questions, meta });
};

export const getQuestionStats = async (_req, res) => {
  const stats = await questionService.getQuestionStats();

  res.status(200).json({ success: true, data: stats });
};

export const getQuestionById = async (req, res) => {
  const question = await questionService.viewQuestion(Number(req.params.questionId), {
    userId: req.user?.id,
    ip: req.ip,
  });

  res.status(200).json({ success: true, data: question });
};

export const getRelatedQuestions = async (req, res) => {
  const questions = await questionService.getRelatedQuestions(Number(req.params.questionId));

  res.status(200).json({ success: true, data: questions });
};

export const createQuestion = async (req, res) => {
  const question = await questionService.createQuestion(req.user.id, req.body);

  res.status(201).json({ success: true, data: question });
};

export const updateQuestion = async (req, res) => {
  const question = await questionService.updateQuestion(
    req.user.id,
    Number(req.params.questionId),
    req.body,
  );

  res.status(200).json({ success: true, data: question });
};

export const deleteQuestion = async (req, res) => {
  await questionService.deleteQuestion(req.user.id, Number(req.params.questionId));

  res.status(204).end();
};

export const getQuestionEditHistories = async (req, res) => {
  const histories = await questionService.getQuestionEditHistories(Number(req.params.questionId));

  res.status(200).json({ success: true, data: histories });
};

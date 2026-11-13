import * as answerService from './answer.service.js';

// 비로그인이면 null. 응답의 isVoted·isMine·canAccept 계산에 쓴다
const readViewerId = (req) => req.user?.id ?? null;

export const getAnswersByQuestionId = async (req, res) => {
  const answers = await answerService.getAnswersByQuestionId(
    Number(req.params.questionId),
    readViewerId(req),
    req.validatedQuery.sort,
  );

  res.status(200).json({ success: true, data: answers });
};

export const getAnswerById = async (req, res) => {
  const answer = await answerService.getAnswerById(Number(req.params.answerId), readViewerId(req));

  res.status(200).json({ success: true, data: answer });
};

export const createAnswer = async (req, res) => {
  const answer = await answerService.createAnswer(
    req.user.id,
    Number(req.params.questionId),
    req.body,
  );

  res.status(201).json({ success: true, data: answer });
};

export const updateAnswer = async (req, res) => {
  const answer = await answerService.updateAnswer(
    req.user.id,
    Number(req.params.answerId),
    req.body,
  );

  res.status(200).json({ success: true, data: answer });
};

export const deleteAnswer = async (req, res) => {
  await answerService.deleteAnswer(req.user.id, Number(req.params.answerId));

  res.status(204).end();
};

export const getAnswerEditHistories = async (req, res) => {
  const histories = await answerService.getAnswerEditHistories(Number(req.params.answerId));

  res.status(200).json({ success: true, data: histories });
};

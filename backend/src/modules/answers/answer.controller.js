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

export const getAnswersByAuthorId = async (req, res) => {
  const { authorId, page, size } = req.validatedQuery;
  const { answers, meta } = await answerService.getAnswersByAuthorId(authorId, { page, size });

  res.status(200).json({ success: true, data: answers, meta });
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

export const acceptAnswer = async (req, res) => {
  const answer = await answerService.acceptAnswer(req.user.id, Number(req.params.answerId));

  res.status(200).json({ success: true, data: answer });
};

export const voteAnswer = async (req, res) => {
  const result = await answerService.voteAnswer(req.user.id, Number(req.params.answerId));

  res.status(200).json({ success: true, data: result });
};

// 추천 버튼이 토글이라 취소 후 상태를 함께 돌려주기 위해 204 대신 200으로 응답한다 (API 명세 4장)
export const cancelAnswerVote = async (req, res) => {
  const result = await answerService.cancelAnswerVote(req.user.id, Number(req.params.answerId));

  res.status(200).json({ success: true, data: result });
};

export const getAnswerEditHistories = async (req, res) => {
  const histories = await answerService.getAnswerEditHistories(Number(req.params.answerId));

  res.status(200).json({ success: true, data: histories });
};

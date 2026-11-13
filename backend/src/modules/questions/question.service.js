import * as questionRepository from './question.repository.js';

const WITHDRAWN_AUTHOR = { id: null, nickname: '탈퇴한 회원', profileImageUrl: null };

// 태그는 영문 소문자로 저장하므로 비교할 값도 같은 규칙으로 맞춘다 (API 명세 5.1)
const normalizeTagName = (name) => name.toLowerCase();

const toAuthor = (row) => {
  if (row.author_status === 'withdrawn') {
    return WITHDRAWN_AUTHOR;
  }

  return {
    id: row.author_id,
    nickname: row.author_nickname,
    profileImageUrl: row.author_profile_image_url,
  };
};

const groupTagNamesByQuestionId = (tagRows) => {
  const tagNamesByQuestionId = new Map();

  for (const { question_id: questionId, name } of tagRows) {
    const tagNames = tagNamesByQuestionId.get(questionId) ?? [];
    tagNames.push(name);
    tagNamesByQuestionId.set(questionId, tagNames);
  }

  return tagNamesByQuestionId;
};

export const getQuestions = async (query) => {
  const { page, size, sort, keyword, tag, ...rest } = query;
  const filter = {
    ...rest,
    keyword,
    tagKeyword: keyword === undefined ? undefined : normalizeTagName(keyword),
    tag: tag === undefined ? undefined : normalizeTagName(tag),
  };

  const [rows, totalCount] = await Promise.all([
    questionRepository.findQuestions({ filter, sort, limit: size, offset: (page - 1) * size }),
    questionRepository.countQuestions(filter),
  ]);

  const tagRows = await questionRepository.findTagNamesByQuestionIds(rows.map((row) => row.id));
  const tagNamesByQuestionId = groupTagNamesByQuestionId(tagRows);

  const questions = rows.map((row) => ({
    id: row.id,
    title: row.title,
    tags: tagNamesByQuestionId.get(row.id) ?? [],
    answerCount: row.answer_count,
    isAccepted: row.is_accepted === 1,
    viewCount: row.view_count,
    author: toAuthor(row),
    createdAt: row.created_at,
  }));

  return { questions, meta: { page, size, totalCount } };
};

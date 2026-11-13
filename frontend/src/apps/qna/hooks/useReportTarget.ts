import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { ApiError } from '../../../shared/api';
import { htmlToText } from '../../../shared/editor/richText';
import { getAnswer } from '../api/answers';
import { getPost, getPostComments } from '../api/posts';
import { getQuestion } from '../api/questions';
import { reportTargetKinds } from '../data/mockData';
import type { ReportTarget, ReportTargetType, UserSummary } from '../data/types';
import { formatCount, formatDate } from '../display';
import { routes } from '../routes';

const TYPES: readonly ReportTargetType[] = ['question', 'answer', 'post', 'comment'];
/** 대상 요약에 보여 줄 본문 앞부분 길이 */
const EXCERPT_LENGTH = 120;
/** 댓글 단건 API 가 없어 게시글의 댓글 목록을 이 크기로 넘겨 가며 찾는다 (API_SPEC 1.5 최대 size) */
const COMMENT_PAGE_SIZE = 100;
const COMMENT_MAX_PAGES = 20;
const BOARD_POST_PATH = /^\/board\/posts\/(\d+)/;

/** 신고 화면 문맥. 경로는 모두 모듈 prefix 를 포함한 전체 경로다 */
export interface ReportContext {
  readonly type: ReportTargetType;
  readonly targetId: string;
  /** 대상 요약. 불러오기 전이거나 없는 대상이면 null */
  readonly target: ReportTarget | null;
  readonly loading: boolean;
  /** 대상이 없거나 숨김·삭제됨 */
  readonly notFound: boolean;
  /** 신고를 취소하거나 닫으면 돌아갈 곳 (대상 글) */
  readonly backHref: string;
  /** 신고 완료 후 '목록으로' 이동할 곳 */
  readonly listHref: string;
  readonly listLabel: string;
  /** 이 대상의 신고 화면 / 신고 완료 화면 */
  readonly reportPath: string;
  readonly completePath: string;
}

interface LoadedTarget {
  readonly target: ReportTarget;
  /** from 이 없을 때 돌아갈 곳 */
  readonly backHref: string;
}

// 다른 사이트로 보내는 주소는 받지 않는다
const safePath = (value: string | null) =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : null;

const toExcerpt = (html: string) => {
  const text = htmlToText(html).replace(/\s+/g, ' ').trim();
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH)}...` : text;
};

const toAuthor = (author: UserSummary) => ({
  initial: author.nickname.charAt(0),
  name: author.nickname,
});

async function loadQuestion(id: string): Promise<LoadedTarget> {
  const q = await getQuestion(id);
  return {
    target: {
      type: 'question',
      id,
      kindLabel: reportTargetKinds.question,
      title: q.title,
      tags: q.tags,
      excerpt: toExcerpt(q.body),
      author: toAuthor(q.author),
      date: formatDate(q.createdAt),
      stats: { views: formatCount(q.viewCount), answers: formatCount(q.answerCount) },
    },
    backHref: routes.question(q.id),
  };
}

async function loadAnswer(id: string): Promise<LoadedTarget> {
  const answer = await getAnswer(id);
  const q = await getQuestion(answer.questionId);
  return {
    target: {
      type: 'answer',
      id,
      kindLabel: reportTargetKinds.answer,
      title: q.title,
      tags: q.tags,
      excerpt: toExcerpt(answer.body),
      author: toAuthor(answer.author),
      date: formatDate(answer.createdAt),
    },
    backHref: `${routes.question(q.id)}#${routes.answerAnchor(answer.id)}`,
  };
}

async function loadPost(id: string): Promise<LoadedTarget> {
  const post = await getPost(id);
  return {
    target: {
      type: 'post',
      id,
      kindLabel: reportTargetKinds.post,
      title: post.title,
      tags: [],
      excerpt: toExcerpt(post.body),
      author: toAuthor(post.author),
      date: formatDate(post.createdAt),
      stats: { views: formatCount(post.viewCount), answers: formatCount(post.commentCount) },
    },
    backHref: `/board/posts/${post.id}`,
  };
}

/**
 * 댓글은 단건 조회 API 가 없어, 돌아갈 주소(from)의 게시글 댓글 목록에서 찾는다.
 * 게시글을 모르거나 댓글을 찾지 못하면 '댓글 #id' 만 보여 준다 (신고 등록은 서버가 다시 확인한다)
 */
async function loadComment(id: string, from: string | null): Promise<LoadedTarget> {
  const postId = from?.match(BOARD_POST_PATH)?.[1];
  const fallback: LoadedTarget = {
    target: {
      type: 'comment',
      id,
      kindLabel: reportTargetKinds.comment,
      title: `${reportTargetKinds.comment} #${id}`,
      tags: [],
      excerpt: '',
      author: { initial: '?', name: '' },
      date: '',
    },
    backHref: postId ? `/board/posts/${postId}` : '/board',
  };
  if (!postId) return fallback;

  const post = await getPost(postId);
  for (let page = 1; page <= COMMENT_MAX_PAGES; page += 1) {
    const result = await getPostComments(postId, page, COMMENT_PAGE_SIZE);
    const comment = result.items.find((c) => String(c.id) === id);
    if (comment) {
      return {
        target: {
          type: 'comment',
          id,
          kindLabel: reportTargetKinds.comment,
          title: post.title,
          tags: [],
          excerpt: toExcerpt(comment.body),
          author: toAuthor(comment.author),
          date: formatDate(comment.createdAt),
        },
        backHref: fallback.backHref,
      };
    }
    if (page * COMMENT_PAGE_SIZE >= result.meta.totalCount) break;
  }
  return fallback;
}

/**
 * 신고 대상과 돌아갈 곳. 질문·답변·게시글·댓글 모두 같은 신고 화면을 쓴다 (API_SPEC 8장).
 * 경로: /qna/report/:targetType/:targetId?from=<돌아갈 전체 경로>. 질문은 /qna/questions/:id/report 도 쓴다.
 */
export function useReportTarget(): ReportContext {
  const params = useParams();
  const [search] = useSearchParams();
  const rawType = params.targetType as ReportTargetType | undefined;
  const type: ReportTargetType = rawType && TYPES.includes(rawType) ? rawType : 'question';
  const targetId = params.targetId ?? params.id ?? '';
  const from = safePath(search.get('from'));
  const isLegacyQuestion = params.targetId === undefined;
  const [loaded, setLoaded] = useState<LoadedTarget | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setNotFound(false);
    const load =
      type === 'answer'
        ? loadAnswer(targetId)
        : type === 'post'
          ? loadPost(targetId)
          : type === 'comment'
            ? loadComment(targetId, from)
            : loadQuestion(targetId);
    load
      .then((next) => {
        if (!ignore) setLoaded(next);
      })
      .catch((error: unknown) => {
        if (ignore) return;
        // 숨김·삭제·없는 대상(404)과 형식이 잘못된 id(400)는 신고할 수 없다
        if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
          setNotFound(true);
        }
        setLoaded(null);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [type, targetId, from]);

  const isBoard = type === 'post' || type === 'comment';
  return {
    type,
    targetId,
    target: loaded?.target ?? null,
    loading,
    notFound,
    backHref: from ?? loaded?.backHref ?? (isBoard ? '/board' : routes.questions()),
    listHref: isBoard ? '/board' : routes.questions(),
    listLabel: isBoard ? '자유게시판으로 이동' : '질문 목록으로 이동',
    reportPath: isLegacyQuestion
      ? routes.report(targetId)
      : routes.reportTarget(type, targetId, from),
    completePath: isLegacyQuestion
      ? routes.reportComplete(targetId)
      : routes.reportTargetComplete(type, targetId, from),
  };
}

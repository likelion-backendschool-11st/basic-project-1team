import React, { useId } from 'react';
import { RichTextView } from '../../../../shared/editor/RichTextView';
import { toSiteUrl } from '../../adminSite';
import type { ContentDetailMap } from '../../api/contents';
import { confirmDeleteCopy, contentDetailCopy as c, qnaCopy, ui } from '../../data/mockData';
import { useContentDetail } from '../../hooks/useContentDetail';
import { formatDateTime } from '../../sanction';
import type { ChildContent, ContentType } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Modal } from '../ui/Modal';
import { TagChip } from '../ui/TagChip';
import { VisibilityBadge } from '../ui/VisibilityBadge';

interface ContentDetailModalProps<T extends ContentType> {
  readonly type: T;
  /** 열려는 글 id. null 이면 닫힘 */
  readonly id: number | null;
  readonly onClose: () => void;
  /**
   * 상세에서 바로 숨김·복구·삭제한다. 상세 객체는 목록 항목을 포함하므로 목록의 처리 함수를 그대로 쓴다.
   * 넘기지 않으면 보기만 한다 (신고 화면의 원문 보기 등)
   */
  readonly onToggleHidden?: (detail: ContentDetailMap[T]) => void;
  readonly onRemove?: (detail: ContentDetailMap[T]) => void;
}

/** 답변·게시글은 HTML, 댓글은 일반 텍스트 (API_SPEC 1.9) */
const Body: React.FC<{ readonly html: boolean; readonly body: string }> = ({ html, body }) =>
  html ? (
    <RichTextView html={body} className="text-body-lg text-ink" />
  ) : (
    <p className="whitespace-pre-wrap break-words text-body-lg text-ink">{body}</p>
  );

const Meta: React.FC<{ readonly author: string; readonly createdAt: string }> = ({
  author,
  createdAt,
}) => (
  <span className="text-body-md text-ink-muted">
    {author} · <span className="font-mono">{formatDateTime(createdAt)}</span>
  </span>
);

const Children: React.FC<{
  readonly title: string;
  readonly items: readonly ChildContent[];
  readonly html: boolean;
}> = ({ title, items, html }) => (
  <section className="mt-6 border-t border-hairline pt-5">
    <h3 className="mb-3 text-label-sm text-ink-muted">
      {title} {items.length}
      {ui.countUnit}
    </h3>
    {items.length === 0 && <p className="text-body-md text-ink-subtle">{c.noChildren}</p>}
    <ul className="space-y-3">
      {items.map((item) => (
        <li
          key={item.id}
          className={`rounded-lg border border-hairline bg-surface-1/60 p-4 ${item.status !== 'active' ? 'opacity-70' : ''}`}
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-ink-subtle">#{item.id}</span>
            <VisibilityBadge status={item.status} />
            {item.isAccepted && (
              <Badge tone="success" shape="chip">
                {qnaCopy.accepted}
              </Badge>
            )}
            <Meta author={item.author.nickname} createdAt={item.createdAt} />
          </div>
          <Body html={html} body={item.body} />
        </li>
      ))}
    </ul>
  </section>
);

/**
 * 사용자 화면 주소. 공개(active) 글에만 링크를 보여 준다 (숨김·삭제 글은 사용자 화면에서 404).
 * 답변은 질문 상세에서 그 답변으로 스크롤하고, 댓글은 게시글 상세를 연다.
 * 사용자 사이트는 주소가 다른 별도 사이트라 전체 주소로 새 탭에서 연다 (CODE_CONVENTION 2.1)
 */
function publicPath(type: ContentType, detail: ContentDetailMap[ContentType]): string {
  if ('question' in detail) {
    return toSiteUrl(`/qna/questions/${detail.question.id}#answer-${detail.id}`);
  }
  if ('post' in detail) return toSiteUrl(`/board/posts/${detail.post.id}`);
  return toSiteUrl(
    type === 'question' ? `/qna/questions/${detail.id}` : `/board/posts/${detail.id}`,
  );
}

/**
 * 관리자 글 상세 (API_SPEC 10.3·10.4 GET .../:id).
 * 숨김·삭제된 글도 본문과 하위 글(답변·댓글)까지 보고, 그 자리에서 숨김·복구·삭제한다.
 */
export function ContentDetailModal<T extends ContentType>({
  type,
  id,
  onClose,
  onToggleHidden,
  onRemove,
}: ContentDetailModalProps<T>) {
  const titleId = useId();
  const { detail, loading, errorMessage } = useContentDetail(type, id);
  const target = `${confirmDeleteCopy.targets[type]} #${id}`;
  // 답변·댓글은 제목이 없어 "답변 #342" 처럼 부른다
  const title = detail && 'title' in detail ? detail.title : target;

  // 처리 확인 창을 띄우기 전에 상세 창을 닫아 창이 겹치지 않게 한다
  const act = (handler: (d: ContentDetailMap[T]) => void) => () => {
    if (!detail) return;
    onClose();
    handler(detail);
  };

  return (
    <Modal
      open={id !== null}
      onClose={onClose}
      titleId={titleId}
      wide
      title={title}
      subtitle={
        detail && (
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-ink-subtle">{target}</span>
            <VisibilityBadge status={detail.status} />
            <Meta author={detail.author.nickname} createdAt={detail.createdAt} />
            {'tags' in detail && detail.tags.map((tag) => <TagChip key={tag} name={tag} />)}
          </span>
        )
      }
      footer={
        <>
          {detail?.status === 'active' && (
            <a
              href={publicPath(type, detail)}
              target="_blank"
              rel="noreferrer"
              className="mr-auto inline-flex items-center gap-1 text-body-md text-primary hover:underline"
            >
              {c.openPublic}
              <Icon name="arrow_forward" className="!text-[16px]" />
            </a>
          )}
          <Button onClick={onClose}>{ui.close}</Button>
          {detail && detail.status !== 'deleted' && onToggleHidden && (
            <Button variant="secondary" onClick={act(onToggleHidden)}>
              {detail.status === 'hidden' ? ui.restore : ui.hide}
            </Button>
          )}
          {detail && detail.status !== 'deleted' && onRemove && (
            <Button variant="danger" icon="delete" onClick={act(onRemove)}>
              {ui.remove}
            </Button>
          )}
        </>
      }
    >
      {loading && <p className="py-10 text-center text-body-md text-ink-subtle">{ui.loading}</p>}
      {errorMessage && <p className="py-10 text-center text-body-md text-error">{errorMessage}</p>}
      {detail && (
        <>
          {'question' in detail && (
            <p className="mb-4 text-body-md text-ink-muted">
              {c.parentQuestion} <span className="font-mono">#{detail.question.id}</span>{' '}
              {detail.question.title}
            </p>
          )}
          {'post' in detail && (
            <p className="mb-4 text-body-md text-ink-muted">
              {c.parentPost} <span className="font-mono">#{detail.post.id}</span>{' '}
              {detail.post.title}
            </p>
          )}
          <Body html={type !== 'comment'} body={detail.body} />
          {'answers' in detail && <Children title={c.answers} items={detail.answers} html />}
          {'comments' in detail && (
            <Children title={c.comments} items={detail.comments} html={false} />
          )}
        </>
      )}
    </Modal>
  );
}

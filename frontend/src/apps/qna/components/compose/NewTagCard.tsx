import React from 'react';
import { newQuestionPage as P } from '../../data/mockData';
import type { useTagInput } from '../../hooks/useTagInput';
import { Card } from '../common/Card';
import { NumberBadge } from '../common/NumberBadge';
import { RecommendedTags } from '../editor/RecommendedTags';
import { TagInputBox } from '../editor/TagInputBox';

interface NewTagCardProps {
  readonly tagInput: ReturnType<typeof useTagInput>;
}

export const NewTagCard: React.FC<NewTagCardProps> = ({ tagInput: t }) => (
  <Card as="section" bordered={false} className="p-space-lg">
    <div className="flex flex-col gap-space-sm">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-space-xs font-label-md text-label-md text-ink">
          <NumberBadge index={3} />
          {P.tagLabel} <span className="font-caption text-caption text-ink-tertiary font-normal">{P.tagHint}</span>
        </span>
        <span className="font-code-inline text-code-inline text-ink-tertiary">
          {t.tags.length} / {t.max} 선택됨
        </span>
      </div>
      <TagInputBox
        tags={t.tags}
        input={t.input}
        onInputChange={t.setInput}
        onKeyDown={t.onKeyDown}
        onRemove={t.remove}
        placeholder={P.tagPlaceholder}
      />
      <RecommendedTags label={P.tagRecommendLabel} tags={P.recommendedTags} onAdd={t.add} />
    </div>
  </Card>
);

export default NewTagCard;

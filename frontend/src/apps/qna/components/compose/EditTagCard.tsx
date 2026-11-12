import React from 'react';
import { editQuestionPage as P } from '../../data/mockData';
import type { useTagInput } from '../../hooks/useTagInput';
import { Card } from '../common/Card';
import { Icon } from '../common/Icon';
import { RecommendedTags } from '../editor/RecommendedTags';
import { TagInputBox } from '../editor/TagInputBox';

interface EditTagCardProps {
  readonly tagInput: ReturnType<typeof useTagInput>;
}

export const EditTagCard: React.FC<EditTagCardProps> = ({ tagInput: t }) => (
  <Card as="section" bordered={false} className="p-space-md flex flex-col gap-space-sm">
    <div className="flex items-center justify-between">
      <span className="font-label-md text-label-md text-ink font-semibold flex items-center gap-1.5">
        <Icon name="tag" className="text-[18px] text-primary" />
        {P.tagTitle}
      </span>
      <span className="font-code-inline text-code-inline text-ink-tertiary">
        <span className="text-primary font-semibold">{t.tags.length}</span> / {t.max} {P.tagCountSuffix}
      </span>
    </div>
    <p className="font-caption text-caption text-ink-subtle">
      {P.tagHelpPrefix}
      <strong>{P.tagHelpStrong}</strong>
      {P.tagHelpSuffix}
    </p>
    <TagInputBox
      variant="neutral"
      tags={t.tags}
      input={t.input}
      onInputChange={t.setInput}
      onKeyDown={t.onKeyDown}
      onRemove={t.remove}
      placeholder={P.tagPlaceholder}
    />
    <RecommendedTags variant="hash" label={P.tagRecommendLabel} tags={P.recommendedTags} onAdd={t.add} />
  </Card>
);

export default EditTagCard;

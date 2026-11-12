import React, { type FormEvent } from 'react';
import { tagsCopy, ui } from '../../data/mockData';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Icon } from '../ui/Icon';
import { TextInput } from '../ui/FormControls';

interface TagCreateFormProps {
  readonly name: string;
  /** 중복·차단된 이름 안내 */
  readonly nameError: string | null;
  readonly description: string;
  readonly editing: boolean;
  readonly onNameChange: (value: string) => void;
  readonly onDescriptionChange: (value: string) => void;
  readonly onSubmit: (event: FormEvent) => void;
  readonly onCancelEdit: () => void;
}

/** "새 태그 등록" card; doubles as the edit form when a row's 수정 is clicked. */
export const TagCreateForm: React.FC<TagCreateFormProps> = ({ name, nameError, description, editing, onNameChange, onDescriptionChange, onSubmit, onCancelEdit }) => {
  return (
    <Card className={`mb-8 ${editing ? '!border-primary-container/60' : ''}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-headline-sm font-bold text-ink">
          <Icon name={editing ? 'edit' : 'add_circle'} className="!text-[20px] text-primary" />
          {editing ? tagsCopy.editTitle : tagsCopy.createTitle}
        </h2>
        <span className="text-body-sm text-ink-subtle">{tagsCopy.createHint}</span>
      </div>
      <form onSubmit={onSubmit} className="flex items-center gap-4">
        <label htmlFor="tag-name" className="sr-only">
          {tagsCopy.nameLabel}
        </label>
        <TextInput
          id="tag-name"
          className="w-[396px]"
          placeholder={tagsCopy.namePlaceholder}
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          aria-invalid={nameError !== null}
          aria-describedby={nameError ? 'tag-name-error' : undefined}
        />
        <label htmlFor="tag-desc" className="sr-only">
          {tagsCopy.descLabel}
        </label>
        <TextInput
          id="tag-desc"
          className="flex-1"
          placeholder={tagsCopy.descPlaceholder}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
        {editing && <Button onClick={onCancelEdit}>{ui.cancel}</Button>}
        <Button type="submit" variant="primary" disabled={!name.trim() || nameError !== null} className="w-24">
          {editing ? ui.save : ui.register}
        </Button>
      </form>
      {nameError && (
        <p id="tag-name-error" role="alert" className="mt-2 text-body-sm text-error">
          {nameError}
        </p>
      )}
    </Card>
  );
};

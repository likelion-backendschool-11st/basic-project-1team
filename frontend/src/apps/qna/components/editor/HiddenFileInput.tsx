import React, { type ChangeEvent, type RefObject } from 'react';

interface HiddenFileInputProps {
  readonly inputRef: RefObject<HTMLInputElement>;
  readonly onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  readonly accept?: string;
}

export const HiddenFileInput: React.FC<HiddenFileInputProps> = ({ inputRef, onChange, accept = 'image/*,.log,.txt' }) => (
  <input ref={inputRef} type="file" multiple accept={accept} className="hidden" onChange={onChange} />
);

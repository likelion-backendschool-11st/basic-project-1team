import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BIO_HTML_MAX, BIO_TEXT_MAX } from '../../../shared/editor/richText';
import { useRichText } from '../../../shared/editor/useRichText';
import { mypageEditContent, ROUTES } from '../data/mockData';
import { useProfile } from './useProfile';

const { photo } = mypageEditContent;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg'];

export function useProfileEdit() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  // 소개글은 에디터 HTML. 순수 글자 200자, 저장 HTML 1,000자 (API_SPEC 2장)
  const bio = useRichText(profile.bio, BIO_TEXT_MAX, BIO_HTML_MAX);
  const [bioError, setBioError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const selectPhoto = (file: File | undefined) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setPhotoError(photo.invalidType);
      return;
    }
    if (file.size > photo.maxBytes) {
      setPhotoError(photo.tooLarge);
      return;
    }
    setPhotoError(null);
    setPhotoUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const save = () => {
    if (bio.limitError) {
      setBioError(bio.limitError);
      return;
    }
    setBioError(null);
    setSaving(true);
    timer.current = window.setTimeout(() => {
      updateProfile({ bio: bio.value, ...(photoUrl ? { avatarUrl: photoUrl } : {}) });
      navigate(ROUTES.mypage);
    }, 600);
  };

  return {
    bio: bio.value,
    setBio: bio.setValue,
    bioCount: bio.length,
    bioError,
    photoUrl,
    photoError,
    selectPhoto,
    saving,
    save,
  };
}

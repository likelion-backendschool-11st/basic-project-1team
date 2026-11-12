import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mypageEditContent, ROUTES } from '../data/mockData';
import { useProfile } from './useProfile';

const { photo, bio: bioConfig } = mypageEditContent;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg'];

export function useProfileEdit() {
  const navigate = useNavigate();
  const { profile, updateProfile } = useProfile();
  const [bio, setBioRaw] = useState(profile.bio);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const setBio = (value: string) => setBioRaw(value.slice(0, bioConfig.max));

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
    setSaving(true);
    timer.current = window.setTimeout(() => {
      updateProfile({ bio, ...(photoUrl ? { avatarUrl: photoUrl } : {}) });
      navigate(ROUTES.mypage);
    }, 600);
  };

  return {
    bio,
    setBio,
    bioCount: bio.length,
    photoUrl,
    photoError,
    selectPhoto,
    saving,
    save,
  };
}

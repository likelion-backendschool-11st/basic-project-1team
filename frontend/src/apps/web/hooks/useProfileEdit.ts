import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../../shared/api';
import { BIO_HTML_MAX, BIO_TEXT_MAX } from '../../../shared/editor/richText';
import { useRichText } from '../../../shared/editor/useRichText';
import { updateMyProfile, uploadProfileImage } from '../api/users';
import { mypageEditContent, ROUTES, type MyProfile } from '../data/mockData';
import { useProfile } from './useProfile';

const { photo } = mypageEditContent;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg'];

export function useProfileEdit(profile: MyProfile) {
  const navigate = useNavigate();
  const { setProfile } = useProfile();
  // 소개글은 에디터 HTML. 순수 글자 200자, 저장 HTML 1,000자 (API_SPEC 2장)
  const bio = useRichText(profile.bio ?? '', BIO_TEXT_MAX, BIO_HTML_MAX);
  const [bioError, setBioError] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 미리보기용 주소는 바뀌거나 화면을 떠날 때 해제한다
  useEffect(
    () => () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    },
    [photoUrl],
  );

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
    setPhotoFile(file);
    setPhotoUrl(URL.createObjectURL(file));
  };

  /** 새 사진을 골랐으면 먼저 올리고, 소개글을 저장한 뒤 마이페이지로 간다 */
  const save = async () => {
    if (saving) return;
    if (bio.limitError) {
      setBioError(bio.limitError);
      return;
    }
    setBioError(null);
    setSaving(true);
    if (photoFile) {
      try {
        const { profileImageUrl } = await uploadProfileImage(photoFile);
        // 소개글 저장이 실패해도 바뀐 사진은 화면에 반영하고, 다시 저장할 때 또 올리지 않는다
        setProfile({ ...profile, profileImageUrl });
        setPhotoFile(null);
      } catch (error) {
        setPhotoError(getErrorMessage(error));
        setSaving(false);
        return;
      }
    }
    try {
      setProfile(await updateMyProfile({ bio: bio.value }));
      navigate(ROUTES.mypage);
    } catch (error) {
      setBioError(getErrorMessage(error));
      setSaving(false);
    }
  };

  return {
    bio: bio.value,
    setBio: bio.setValue,
    bioCount: bio.length,
    bioError,
    /** 새로 고른 사진, 없으면 지금 프로필 사진 */
    photoUrl: photoUrl ?? profile.profileImageUrl,
    photoError,
    selectPhoto,
    saving,
    save,
  };
}

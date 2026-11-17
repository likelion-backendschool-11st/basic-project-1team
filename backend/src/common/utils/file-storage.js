import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { del, put } from '@vercel/blob';
import express from 'express';

import { env } from '../../config/env.js';

// 업로드 파일을 서버 디스크(env.upload.dir)에 저장한다. BLOB_READ_WRITE_TOKEN이 있으면(Vercel 배포) Vercel Blob에 저장한다.
// 저장소를 바꾸면(S3 등) 이 파일만 고친다. 다른 코드는 saveFile·deleteFileByUrl·serveUploadedFiles만 쓴다
export const UPLOAD_ROUTE = '/uploads';

// key는 'editor_image/2026/11/<uuid>.png' 같은 상대 경로. 저장한 파일의 URL을 돌려준다
export const saveFile = async (key, buffer) => {
  if (env.upload.blobToken) {
    const blob = await put(key, buffer, {
      access: 'public',
      addRandomSuffix: false,
      token: env.upload.blobToken,
    });

    return blob.url;
  }

  const filePath = path.join(env.upload.dir, key);

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, buffer, { flag: 'wx' });

  return `${env.upload.publicBaseUrl}/${key}`;
};

const isBlobUrl = (url) => {
  try {
    return new URL(url).hostname.endsWith('.blob.vercel-storage.com');
  } catch {
    return false;
  }
};

// 이 저장소의 URL이 아니거나 저장 폴더 밖을 가리키면 아무것도 지우지 않는다
export const deleteFileByUrl = async (url) => {
  if (env.upload.blobToken) {
    if (isBlobUrl(url)) {
      await del(url, { token: env.upload.blobToken });
    }

    return;
  }

  const prefix = `${env.upload.publicBaseUrl}/`;

  if (!url.startsWith(prefix)) {
    return;
  }

  const filePath = path.resolve(env.upload.dir, url.slice(prefix.length));

  if (!filePath.startsWith(`${env.upload.dir}${path.sep}`)) {
    return;
  }

  await rm(filePath, { force: true });
};

// 저장한 파일을 UPLOAD_ROUTE 경로로 내려 준다. 확장자는 서버가 파일 내용으로 정하므로 그대로 믿는다
export const serveUploadedFiles = express.static(env.upload.dir, {
  index: false,
  dotfiles: 'deny',
  setHeaders: (res) => {
    res.set('X-Content-Type-Options', 'nosniff');
  },
});

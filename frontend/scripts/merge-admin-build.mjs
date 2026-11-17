// npm run build:vercel 마지막 단계. 관리자 사이트 빌드(dist-admin)를 사용자 사이트 빌드(dist)에 합쳐
// 한 Vercel 프로젝트에서 /admin 은 admin.html, 나머지는 index.html 로 열리게 한다 (vercel.json)
import { copyFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE_DIR = 'dist';
const ADMIN_DIR = 'dist-admin';

copyFileSync(join(ADMIN_DIR, 'admin.html'), join(SITE_DIR, 'admin.html'));

// 파일 이름에 내용 해시가 붙어 있어 같은 이름이면 같은 내용이다. 다르면 덮어쓰지 않고 멈춘다
for (const name of readdirSync(join(ADMIN_DIR, 'assets'))) {
  const from = join(ADMIN_DIR, 'assets', name);
  const to = join(SITE_DIR, 'assets', name);
  if (existsSync(to)) {
    if (!readFileSync(from).equals(readFileSync(to))) {
      throw new Error(`같은 이름의 다른 파일이 있습니다: assets/${name}`);
    }
    continue;
  }
  copyFileSync(from, to);
}

console.log(`관리자 사이트를 ${SITE_DIR}/admin.html 에 합쳤습니다.`);

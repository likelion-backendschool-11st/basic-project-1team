-- =====================================================================
-- GAMERS 로컬 개발용 테스트 데이터
--
-- NODE_ENV=development 로 백엔드를 실행하면 서버가 뜰 때 한 번 넣습니다 (backend/src/config/dev-seed.js).
-- 이미 넣었는지는 seed_admin 계정이 있는지로 판단하므로, 다시 넣으려면 DB를 비우고 schema.sql 부터 다시 실행합니다.
-- 직접 넣을 때: mysql -u gamers -p gamers_db < db/seed.sql
--
-- - 모든 테스트 계정의 비밀번호는 gamers12! 입니다. 아이디는 seed_ 로 시작합니다 (seed_admin 은 관리자).
-- - 시각은 넣는 시점 기준 상대 시각(NOW(3) - INTERVAL)이라 통계·최근 목록이 늘 최근 값으로 보입니다.
-- - id 는 고정하지 않고 LAST_INSERT_ID() 로 받아 쓰므로 기존 데이터가 있어도 겹치지 않습니다.
-- - 첨부파일(이미지)은 저장소에 실제 파일이 필요해서 넣지 않습니다.
-- =====================================================================

SET NAMES utf8mb4 COLLATE utf8mb4_0900_as_cs;
SET time_zone = '+00:00';

-- ---------------------------------------------------------------------
-- 회원 (비밀번호: gamers12!)
-- ---------------------------------------------------------------------
INSERT INTO users (username, email, nickname, name, password_hash, bio, role, created_at) VALUES ('seed_admin', 'seed_admin@gamers.test', '운영자', '김운영', '$argon2id$v=19$m=65536,t=3,p=4$wNLxDnafHz9N2rc01sc/xw$2rbiJMlXVkjkZXN962wkRSzAkWK+UNIwI9z2BqqMZEc', '<p>GAMERS 운영자입니다.</p>', 'ADMIN', NOW(3) - INTERVAL 172800 MINUTE);
SET @u_admin = LAST_INSERT_ID();
INSERT INTO users (username, email, nickname, name, password_hash, bio, role, created_at) VALUES ('seed_mod', 'seed_mod@gamers.test', '모더레이터', '박관리', '$argon2id$v=19$m=65536,t=3,p=4$wNLxDnafHz9N2rc01sc/xw$2rbiJMlXVkjkZXN962wkRSzAkWK+UNIwI9z2BqqMZEc', '<p>게시물 관리 권한을 받은 회원입니다.</p>', 'USER', NOW(3) - INTERVAL 158400 MINUTE);
SET @u_mod = LAST_INSERT_ID();
INSERT INTO users (username, email, nickname, name, password_hash, bio, role, created_at) VALUES ('seed_hoya', 'seed_hoya@gamers.test', '호야', '이호야', '$argon2id$v=19$m=65536,t=3,p=4$wNLxDnafHz9N2rc01sc/xw$2rbiJMlXVkjkZXN962wkRSzAkWK+UNIwI9z2BqqMZEc', '<p>마인크래프트 자바에디션 위주로 합니다.</p>', 'USER', NOW(3) - INTERVAL 129600 MINUTE);
SET @u_hoya = LAST_INSERT_ID();
INSERT INTO users (username, email, nickname, name, password_hash, bio, role, created_at) VALUES ('seed_raid', 'seed_raid@gamers.test', '레이드장', '최레이드', '$argon2id$v=19$m=65536,t=3,p=4$wNLxDnafHz9N2rc01sc/xw$2rbiJMlXVkjkZXN962wkRSzAkWK+UNIwI9z2BqqMZEc', '<p>로스트아크 레이드 공대장. 빌드 질문 환영합니다.</p>', 'USER', NOW(3) - INTERVAL 122400 MINUTE);
SET @u_raid = LAST_INSERT_ID();
INSERT INTO users (username, email, nickname, name, password_hash, bio, role, created_at) VALUES ('seed_build', 'seed_build@gamers.test', '빌드연구가', '정빌드', '$argon2id$v=19$m=65536,t=3,p=4$wNLxDnafHz9N2rc01sc/xw$2rbiJMlXVkjkZXN962wkRSzAkWK+UNIwI9z2BqqMZEc', '<p>엘든링·로스트아크 빌드 정리하는 사람</p>', 'USER', NOW(3) - INTERVAL 115200 MINUTE);
SET @u_build = LAST_INSERT_ID();
INSERT INTO users (username, email, nickname, name, password_hash, bio, role, created_at) VALUES ('seed_newbie', 'seed_newbie@gamers.test', '초보모험가', '한초보', '$argon2id$v=19$m=65536,t=3,p=4$wNLxDnafHz9N2rc01sc/xw$2rbiJMlXVkjkZXN962wkRSzAkWK+UNIwI9z2BqqMZEc', NULL, 'USER', NOW(3) - INTERVAL 64800 MINUTE);
SET @u_newbie = LAST_INSERT_ID();
INSERT INTO users (username, email, nickname, name, password_hash, bio, role, created_at) VALUES ('seed_tank', 'seed_tank@gamers.test', '탱커장인', '윤탱커', '$argon2id$v=19$m=65536,t=3,p=4$wNLxDnafHz9N2rc01sc/xw$2rbiJMlXVkjkZXN962wkRSzAkWK+UNIwI9z2BqqMZEc', NULL, 'USER', NOW(3) - INTERVAL 100800 MINUTE);
SET @u_tank = LAST_INSERT_ID();
INSERT INTO users (username, email, nickname, name, password_hash, bio, role, created_at) VALUES ('seed_heal', 'seed_heal@gamers.test', '힐러요정', '서힐러', '$argon2id$v=19$m=65536,t=3,p=4$wNLxDnafHz9N2rc01sc/xw$2rbiJMlXVkjkZXN962wkRSzAkWK+UNIwI9z2BqqMZEc', '<p>힐러만 합니다 🙂</p>', 'USER', NOW(3) - INTERVAL 92160 MINUTE);
SET @u_heal = LAST_INSERT_ID();
INSERT INTO users (username, email, nickname, name, password_hash, bio, role, created_at) VALUES ('seed_speed', 'seed_speed@gamers.test', '스피드러너', '강속도', '$argon2id$v=19$m=65536,t=3,p=4$wNLxDnafHz9N2rc01sc/xw$2rbiJMlXVkjkZXN962wkRSzAkWK+UNIwI9z2BqqMZEc', NULL, 'USER', NOW(3) - INTERVAL 72000 MINUTE);
SET @u_speed = LAST_INSERT_ID();
INSERT INTO users (username, email, nickname, name, password_hash, bio, role, created_at) VALUES ('seed_modder', 'seed_modder@gamers.test', '모드제작자', '조모드', '$argon2id$v=19$m=65536,t=3,p=4$wNLxDnafHz9N2rc01sc/xw$2rbiJMlXVkjkZXN962wkRSzAkWK+UNIwI9z2BqqMZEc', '<p>스타듀밸리·마크 모드 만듭니다.</p>', 'USER', NOW(3) - INTERVAL 64800 MINUTE);
SET @u_modder = LAST_INSERT_ID();
INSERT INTO users (username, email, nickname, name, password_hash, bio, role, created_at) VALUES ('seed_writeban', 'seed_writeban@gamers.test', '글쓰기제한', '임제한', '$argon2id$v=19$m=65536,t=3,p=4$wNLxDnafHz9N2rc01sc/xw$2rbiJMlXVkjkZXN962wkRSzAkWK+UNIwI9z2BqqMZEc', NULL, 'USER', NOW(3) - INTERVAL 57600 MINUTE);
SET @u_writeban = LAST_INSERT_ID();
INSERT INTO users (username, email, nickname, name, password_hash, bio, role, created_at) VALUES ('seed_suspended', 'seed_suspended@gamers.test', '이용정지', '오정지', '$argon2id$v=19$m=65536,t=3,p=4$wNLxDnafHz9N2rc01sc/xw$2rbiJMlXVkjkZXN962wkRSzAkWK+UNIwI9z2BqqMZEc', NULL, 'USER', NOW(3) - INTERVAL 54720 MINUTE);
SET @u_suspended = LAST_INSERT_ID();
INSERT INTO users (username, email, nickname, name, password_hash, bio, role, created_at) VALUES ('seed_commentban', 'seed_commentban@gamers.test', '댓글제한', '배댓글', '$argon2id$v=19$m=65536,t=3,p=4$wNLxDnafHz9N2rc01sc/xw$2rbiJMlXVkjkZXN962wkRSzAkWK+UNIwI9z2BqqMZEc', NULL, 'USER', NOW(3) - INTERVAL 51840 MINUTE);
SET @u_commentban = LAST_INSERT_ID();
-- 탈퇴한 회원: 가입 정보를 비운 행 (글에는 "탈퇴한 회원"으로 보임)
INSERT INTO users (status, withdrawn_at, created_at) VALUES ('withdrawn', NOW(3) - INTERVAL 7200 MINUTE, NOW(3) - INTERVAL 144000 MINUTE);
SET @u_withdrawn = LAST_INSERT_ID();

-- ---------------------------------------------------------------------
-- 권한·제재
-- ---------------------------------------------------------------------
INSERT INTO user_permissions (user_id, permission, granted_by, granted_at) VALUES (@u_mod, 'content_manage', @u_admin, NOW(3) - INTERVAL 28800 MINUTE);
SET @perm_mod = LAST_INSERT_ID();

-- ---------------------------------------------------------------------
-- 태그 (차단 1개, 병합 1개 포함)
-- ---------------------------------------------------------------------
INSERT INTO tags (name, description, created_at) VALUES ('마인크래프트', '마인크래프트 자바·베드락 에디션', NOW(3) - INTERVAL 144000 MINUTE);
SET @t1 = LAST_INSERT_ID();
INSERT INTO tags (name, description, created_at) VALUES ('자바에디션', NULL, NOW(3) - INTERVAL 144000 MINUTE);
SET @t2 = LAST_INSERT_ID();
INSERT INTO tags (name, description, created_at) VALUES ('리그오브레전드', 'League of Legends', NOW(3) - INTERVAL 144000 MINUTE);
SET @t3 = LAST_INSERT_ID();
INSERT INTO tags (name, description, created_at) VALUES ('엘든링', NULL, NOW(3) - INTERVAL 144000 MINUTE);
SET @t4 = LAST_INSERT_ID();
INSERT INTO tags (name, description, created_at) VALUES ('발로란트', NULL, NOW(3) - INTERVAL 144000 MINUTE);
SET @t5 = LAST_INSERT_ID();
INSERT INTO tags (name, description, created_at) VALUES ('스타듀밸리', NULL, NOW(3) - INTERVAL 144000 MINUTE);
SET @t6 = LAST_INSERT_ID();
INSERT INTO tags (name, description, created_at) VALUES ('로스트아크', NULL, NOW(3) - INTERVAL 144000 MINUTE);
SET @t7 = LAST_INSERT_ID();
INSERT INTO tags (name, description, created_at) VALUES ('배틀그라운드', NULL, NOW(3) - INTERVAL 144000 MINUTE);
SET @t8 = LAST_INSERT_ID();
INSERT INTO tags (name, description, created_at) VALUES ('버그_이슈', '게임 버그·오류 제보와 해결', NOW(3) - INTERVAL 144000 MINUTE);
SET @t9 = LAST_INSERT_ID();
INSERT INTO tags (name, description, created_at) VALUES ('공략', NULL, NOW(3) - INTERVAL 144000 MINUTE);
SET @t10 = LAST_INSERT_ID();
INSERT INTO tags (name, description, created_at) VALUES ('빌드', NULL, NOW(3) - INTERVAL 144000 MINUTE);
SET @t11 = LAST_INSERT_ID();
INSERT INTO tags (name, description, created_at) VALUES ('사양', 'PC·그래픽 사양 질문', NOW(3) - INTERVAL 144000 MINUTE);
SET @t12 = LAST_INSERT_ID();
INSERT INTO tags (name, description, created_at) VALUES ('모드', NULL, NOW(3) - INTERVAL 144000 MINUTE);
SET @t13 = LAST_INSERT_ID();
INSERT INTO tags (name, description, created_at) VALUES ('서버', NULL, NOW(3) - INTERVAL 144000 MINUTE);
SET @t14 = LAST_INSERT_ID();
INSERT INTO tags (name, description, created_at) VALUES ('입문', NULL, NOW(3) - INTERVAL 144000 MINUTE);
SET @t15 = LAST_INSERT_ID();
INSERT INTO tags (name, status, blocked_at, created_by, created_at) VALUES ('핵판매', 'blocked', NOW(3) - INTERVAL 14400 MINUTE, @u_admin, NOW(3) - INTERVAL 43200 MINUTE);
SET @t_blocked = LAST_INSERT_ID();
INSERT INTO tags (name, status, merged_into_id, merged_at, created_at) VALUES ('lol', 'merged', @t3, NOW(3) - INTERVAL 21600 MINUTE, NOW(3) - INTERVAL 86400 MINUTE);
SET @t_merged = LAST_INSERT_ID();

-- ---------------------------------------------------------------------
-- 질문·답변·추천
-- ---------------------------------------------------------------------
INSERT INTO questions (author_id, title, body, view_count, status, created_at, edited_at) VALUES (@u_hoya, '마인크래프트 주민 거래가 갱신되지 않아요 (직업대 리셋 불가)', '<p>1.20.4 자바에디션에서 사서 주민의 독서대를 여러 번 부수고 다시 설치해도 거래 목록이 바뀌지 않습니다.</p><p>다른 플레이어와 거래한 적은 없는데 완전히 잠겨 있는 것처럼 동작합니다. 원인이 뭘까요?</p>', 342, 'active', NOW(3) - INTERVAL 1800 MINUTE, NOW(3) - INTERVAL 1740 MINUTE);
SET @q_trade = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_trade, @t1, NOW(3) - INTERVAL 1800 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_trade, @t2, NOW(3) - INTERVAL 1800 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_trade, @t9, NOW(3) - INTERVAL 1800 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at, is_accepted, accepted_at) VALUES (@q_trade, @u_modder, '<p>주민과 <strong>한 번이라도 거래</strong>하면 직업이 고정됩니다. 거래 기록이 없다면 독서대가 다른 주민에게 먼저 잡혔을 가능성이 커요.</p><p>주변 주민을 잠시 격리하고 다시 설치해 보세요.</p>', NOW(3) - INTERVAL 1760 MINUTE, 1, NOW(3) - INTERVAL 1560 MINUTE);
SET @a_trade1 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_trade1, @u_raid, NOW(3) - INTERVAL 1730 MINUTE);
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_trade1, @u_build, NOW(3) - INTERVAL 1718 MINUTE);
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_trade1, @u_tank, NOW(3) - INTERVAL 1706 MINUTE);
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_trade1, @u_newbie, NOW(3) - INTERVAL 1694 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at, edited_at) VALUES (@q_trade, @u_speed, '<p>청크 경계에 걸쳐 있으면 작업대 인식이 늦을 때가 있습니다. F3+G로 청크 경계를 확인해 보세요.</p>', NOW(3) - INTERVAL 1620 MINUTE, NOW(3) - INTERVAL 1500 MINUTE);
SET @a_trade2 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_trade2, @u_hoya, NOW(3) - INTERVAL 1590 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_newbie, '롤 정글 처음인데 동선을 어떻게 잡아야 하나요?', '<p>정글 포지션을 처음 해 보는데 첫 바위게 타이밍과 풀캠 동선이 헷갈립니다.</p><p>초보에게 추천하는 챔피언과 기본 동선이 궁금합니다.</p>', 518, 'active', NOW(3) - INTERVAL 1200 MINUTE);
SET @q_jungle = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_jungle, @t3, NOW(3) - INTERVAL 1200 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_jungle, @t15, NOW(3) - INTERVAL 1200 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_jungle, @t10, NOW(3) - INTERVAL 1200 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at, is_accepted, accepted_at) VALUES (@q_jungle, @u_tank, '<p>처음엔 <strong>워윅·마스터이</strong>처럼 풀캠 속도가 안정적인 챔피언을 추천해요.</p><p>레드 → 칼날부리 → 블루 → 늑대 → 두꺼비 → 바위게 순서가 무난합니다.</p>', NOW(3) - INTERVAL 1175 MINUTE, 1, NOW(3) - INTERVAL 1080 MINUTE);
SET @a_jungle1 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_jungle1, @u_newbie, NOW(3) - INTERVAL 1145 MINUTE);
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_jungle1, @u_heal, NOW(3) - INTERVAL 1133 MINUTE);
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_jungle1, @u_raid, NOW(3) - INTERVAL 1121 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at) VALUES (@q_jungle, @u_raid, '<p>미니맵을 3초마다 보는 습관을 들이세요. 동선보다 갱 각을 보는 게 더 중요합니다.</p>', NOW(3) - INTERVAL 1110 MINUTE);
SET @a_jungle2 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_jungle2, @u_newbie, NOW(3) - INTERVAL 1080 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at) VALUES (@q_jungle, @u_speed, '<p>리플레이로 상위 정글러 첫 3분 동선을 따라 해 보는 것도 좋아요.</p>', NOW(3) - INTERVAL 900 MINUTE);
SET @a_jungle3 = LAST_INSERT_ID();
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_build, '엘든링 출혈 빌드 무기 추천 부탁드립니다', '<p>신비 위주로 스탯을 올리고 있습니다. 출혈 빌드에 쓸 무기 후보를 추천해 주세요.</p><p>현재 레벨 90, 신비 40입니다.</p>', 287, 'active', NOW(3) - INTERVAL 4200 MINUTE);
SET @q_elden_build = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_elden_build, @t4, NOW(3) - INTERVAL 4200 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_elden_build, @t11, NOW(3) - INTERVAL 4200 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at) VALUES (@q_elden_build, @u_speed, '<p>강철실 단도(리버스 오브 블러드)나 피의 칼날 전회 붙인 쌍도가 무난해요.</p><p>신비 45 이상이면 효율이 확 올라갑니다.</p>', NOW(3) - INTERVAL 4140 MINUTE);
SET @a_elden1 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_elden1, @u_build, NOW(3) - INTERVAL 4110 MINUTE);
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_elden1, @u_raid, NOW(3) - INTERVAL 4098 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at) VALUES (@q_elden_build, @u_raid, '<p>모르고트의 저주검도 추천합니다. 전기가 범위 출혈이라 보스전에 강해요.</p>', NOW(3) - INTERVAL 3960 MINUTE);
SET @a_elden2 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_elden2, @u_build, NOW(3) - INTERVAL 3930 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_heal, '발로란트 프레임이 갑자기 반토막 났어요', '<p>어제 업데이트 후 240프레임 나오던 게 120 근처로 떨어졌습니다.</p><p>RTX 3060, 라이젠 5600X, 램 16GB입니다. 그래픽 드라이버는 최신입니다.</p>', 96, 'active', NOW(3) - INTERVAL 480 MINUTE);
SET @q_valorant_fps = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_valorant_fps, @t5, NOW(3) - INTERVAL 480 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_valorant_fps, @t12, NOW(3) - INTERVAL 480 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_valorant_fps, @t9, NOW(3) - INTERVAL 480 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at, is_accepted, accepted_at) VALUES (@q_valorant_fps, @u_speed, '<p>업데이트 후에는 셰이더 캐시를 다시 만드느라 초반에 프레임이 떨어질 수 있어요. 사격장에서 몇 판 돌리고 확인해 보세요.</p>', NOW(3) - INTERVAL 430 MINUTE, 1, NOW(3) - INTERVAL 60 MINUTE);
SET @a_valo1 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_valo1, @u_heal, NOW(3) - INTERVAL 400 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_modder, '스타듀밸리 SMAPI 모드가 로드되지 않습니다', '<p>SMAPI 4.0 설치 후 Mods 폴더에 모드를 넣었는데 콘솔에 아무 모드도 로드되지 않았다고 나옵니다.</p><p>스팀 실행 옵션도 넣었습니다.</p>', 154, 'active', NOW(3) - INTERVAL 3120 MINUTE);
SET @q_stardew = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_stardew, @t6, NOW(3) - INTERVAL 3120 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_stardew, @t13, NOW(3) - INTERVAL 3120 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at, is_accepted, accepted_at) VALUES (@q_stardew, @u_hoya, '<p>모드 폴더 안에 폴더가 한 번 더 들어가 있지 않은지 확인해 보세요. <code>Mods/모드이름/manifest.json</code> 구조여야 합니다.</p>', NOW(3) - INTERVAL 3090 MINUTE, 1, NOW(3) - INTERVAL 2400 MINUTE);
SET @a_stardew1 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_stardew1, @u_modder, NOW(3) - INTERVAL 3060 MINUTE);
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_stardew1, @u_newbie, NOW(3) - INTERVAL 3048 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_raid, '로스트아크 카멘 하드 공대 구할 때 최소 아이템 레벨은?', '<p>공대장으로 카멘 하드를 모집하려고 합니다.</p><p>요즘 공대들은 최소 아이템 레벨을 얼마로 잡는지 궁금합니다.</p>', 401, 'active', NOW(3) - INTERVAL 6000 MINUTE);
SET @q_lostark = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_lostark, @t7, NOW(3) - INTERVAL 6000 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_lostark, @t10, NOW(3) - INTERVAL 6000 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at, is_accepted, accepted_at) VALUES (@q_lostark, @u_build, '<p>입장 레벨은 1630이지만 숙련 공대는 1640 이상, 트라이는 1630~1635로 많이 잡습니다.</p>', NOW(3) - INTERVAL 5955 MINUTE, 1, NOW(3) - INTERVAL 5400 MINUTE);
SET @a_lostark1 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_lostark1, @u_raid, NOW(3) - INTERVAL 5925 MINUTE);
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_lostark1, @u_tank, NOW(3) - INTERVAL 5913 MINUTE);
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_lostark1, @u_heal, NOW(3) - INTERVAL 5901 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at) VALUES (@q_lostark, @u_tank, '<p>서폿은 레벨보다 각인·팔찌를 보는 게 낫습니다.</p>', NOW(3) - INTERVAL 5880 MINUTE);
SET @a_lostark2 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_lostark2, @u_heal, NOW(3) - INTERVAL 5850 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_tank, '배그 발소리 방향이 잘 안 들려요', '<p>헤드셋을 바꿔도 발소리 방향이 헷갈립니다. 윈도우 공간 음향을 켜야 하나요?</p>', 233, 'active', NOW(3) - INTERVAL 8400 MINUTE);
SET @q_pubg_sound = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_pubg_sound, @t8, NOW(3) - INTERVAL 8400 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_pubg_sound, @t12, NOW(3) - INTERVAL 8400 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at, is_accepted, accepted_at) VALUES (@q_pubg_sound, @u_speed, '<p>게임 안 사운드를 스테레오로 두고 윈도우 공간 음향은 끄는 걸 추천해요. 가상 7.1은 오히려 방향이 흐려집니다.</p>', NOW(3) - INTERVAL 8330 MINUTE, 1, NOW(3) - INTERVAL 7800 MINUTE);
SET @a_pubg1 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_pubg1, @u_tank, NOW(3) - INTERVAL 8300 MINUTE);
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_pubg1, @u_heal, NOW(3) - INTERVAL 8288 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_hoya, '마인크래프트 친구들이랑 서버 열려면 포트포워딩이 꼭 필요한가요?', '<p>집 컴퓨터로 서버를 열어서 친구 4명이랑 하려고 합니다.</p><p>공유기 설정을 잘 몰라서 다른 방법이 있는지 궁금해요.</p>', 61, 'active', NOW(3) - INTERVAL 300 MINUTE);
SET @q_server = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_server, @t1, NOW(3) - INTERVAL 300 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_server, @t14, NOW(3) - INTERVAL 300 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_server, @t15, NOW(3) - INTERVAL 300 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_speed, '이번 롤 패치 이후 원딜 메타가 어떻게 바뀌었나요?', '<p>패치 노트를 봤는데 아이템 변경이 많아서 정리가 안 됩니다. 원딜 기준으로 요약해 주실 분 계신가요?</p>', 44, 'active', NOW(3) - INTERVAL 180 MINUTE);
SET @q_lol_patch = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_lol_patch, @t3, NOW(3) - INTERVAL 180 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_lol_patch, @t10, NOW(3) - INTERVAL 180 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_newbie, '엘든링 DLC는 본편 어디까지 깨야 들어갈 수 있나요?', '<p>본편 진행 중인데 DLC 입장 조건이 궁금합니다. 스포일러는 최대한 빼고 알려주세요.</p>', 189, 'active', NOW(3) - INTERVAL 1560 MINUTE);
SET @q_elden_dlc = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_elden_dlc, @t4, NOW(3) - INTERVAL 1560 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_elden_dlc, @t15, NOW(3) - INTERVAL 1560 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at) VALUES (@q_elden_dlc, @u_build, '<p>라다곤의 대수와 별빛의 몰락 이후 모그 보스를 잡아야 합니다. 입장은 모그의 고치에서 해요.</p>', NOW(3) - INTERVAL 1525 MINUTE);
SET @a_dlc1 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_dlc1, @u_newbie, NOW(3) - INTERVAL 1495 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_modder, '마크 포지 모드팩 실행하면 바로 튕겨요 (exit code 1)', '<p>포지 1.20.1 모드팩을 실행하면 로딩 화면 전에 exit code 1로 꺼집니다.</p><p>자바는 17 설치했습니다.</p>', 120, 'active', NOW(3) - INTERVAL 2880 MINUTE);
SET @q_mod_crash = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_mod_crash, @t1, NOW(3) - INTERVAL 2880 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_mod_crash, @t13, NOW(3) - INTERVAL 2880 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_mod_crash, @t9, NOW(3) - INTERVAL 2880 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at) VALUES (@q_mod_crash, @u_hoya, '<p>런처 설정에서 메모리를 4GB 이상으로 올려 보세요. 그리고 <code>crash-reports</code> 폴더 로그를 올려 주시면 원인을 찾기 쉽습니다.</p>', NOW(3) - INTERVAL 2830 MINUTE);
SET @a_mod1 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_mod1, @u_modder, NOW(3) - INTERVAL 2800 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at) VALUES (@q_mod_crash, @u_speed, '<p>최신 포지 버전과 모드 버전이 맞지 않는 경우가 많아요. 모드팩 권장 포지 버전을 다시 확인하세요.</p>', NOW(3) - INTERVAL 2680 MINUTE);
SET @a_mod2 = LAST_INSERT_ID();
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_newbie, '발로란트 입문 요원 추천해 주세요', '<p>FPS를 거의 안 해 봤습니다. 팀에 도움이 되면서 쉬운 요원이 궁금해요.</p>', 278, 'active', NOW(3) - INTERVAL 9600 MINUTE);
SET @q_valorant_agent = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_valorant_agent, @t5, NOW(3) - INTERVAL 9600 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_valorant_agent, @t15, NOW(3) - INTERVAL 9600 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at, is_accepted, accepted_at) VALUES (@q_valorant_agent, @u_heal, '<p>세이지나 킬조이를 추천해요. 스킬로 팀을 도울 수 있어서 에임 부담이 덜합니다.</p>', NOW(3) - INTERVAL 9570 MINUTE, 1, NOW(3) - INTERVAL 9000 MINUTE);
SET @a_agent1 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_agent1, @u_newbie, NOW(3) - INTERVAL 9540 MINUTE);
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_agent1, @u_tank, NOW(3) - INTERVAL 9528 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_tank, '30만원대로 롤·발로 144프레임 가능한 그래픽카드?', '<p>모니터를 144Hz로 바꿨습니다. CPU는 i5-12400입니다.</p><p>예산 30만원대 그래픽카드 추천 부탁드립니다.</p>', 610, 'active', NOW(3) - INTERVAL 12000 MINUTE);
SET @q_spec = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_spec, @t12, NOW(3) - INTERVAL 12000 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_spec, @t3, NOW(3) - INTERVAL 12000 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_spec, @t5, NOW(3) - INTERVAL 12000 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at, is_accepted, accepted_at) VALUES (@q_spec, @u_speed, '<p>RTX 4060이면 두 게임 모두 144 넉넉합니다.</p>', NOW(3) - INTERVAL 11980 MINUTE, 1, NOW(3) - INTERVAL 11400 MINUTE);
SET @a_spec1 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_spec1, @u_tank, NOW(3) - INTERVAL 11950 MINUTE);
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_spec1, @u_raid, NOW(3) - INTERVAL 11938 MINUTE);
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_spec1, @u_newbie, NOW(3) - INTERVAL 11926 MINUTE);
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_spec1, @u_heal, NOW(3) - INTERVAL 11914 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at) VALUES (@q_spec, @u_build, '<p>중고까지 보신다면 RX 6700 XT도 좋은 선택입니다.</p>', NOW(3) - INTERVAL 11940 MINUTE);
SET @a_spec2 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_spec2, @u_tank, NOW(3) - INTERVAL 11910 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_heal, '로스트아크 바드 각인 우선순위가 궁금합니다', '<p>바드를 새로 키우고 있습니다. 전설 각인서는 어떤 순서로 읽는 게 좋을까요?</p>', 77, 'active', NOW(3) - INTERVAL 840 MINUTE);
SET @q_lostark_engrave = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_lostark_engrave, @t7, NOW(3) - INTERVAL 840 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_lostark_engrave, @t11, NOW(3) - INTERVAL 840 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at) VALUES (@q_lostark_engrave, @u_raid, '<p>절실한 구원 → 각성 → 전문의 순서를 추천해요.</p>', NOW(3) - INTERVAL 800 MINUTE);
SET @a_engrave1 = LAST_INSERT_ID();
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_newbie, '스타듀밸리 1년차 가을에 돈 벌기 좋은 작물은?', '<p>1년차 가을에 들어왔습니다. 씨앗 예산은 5천 골드 정도입니다.</p>', 345, 'active', NOW(3) - INTERVAL 13200 MINUTE);
SET @q_stardew_money = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_stardew_money, @t6, NOW(3) - INTERVAL 13200 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_stardew_money, @t10, NOW(3) - INTERVAL 13200 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at, is_accepted, accepted_at) VALUES (@q_stardew_money, @u_modder, '<p>크랜베리가 한 번 심으면 여러 번 수확돼서 효율이 좋아요. 호박은 축제 납품용으로 몇 개만 두세요.</p>', NOW(3) - INTERVAL 13185 MINUTE, 1, NOW(3) - INTERVAL 12900 MINUTE);
SET @a_money1 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_money1, @u_newbie, NOW(3) - INTERVAL 13155 MINUTE);
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_money1, @u_hoya, NOW(3) - INTERVAL 13143 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_speed, '배그 감도 설정 어떻게 맞추시나요?', '<p>스코프마다 감도를 따로 맞추는지, 일반 감도 하나로 맞추는지 궁금합니다.</p>', 158, 'active', NOW(3) - INTERVAL 15000 MINUTE);
SET @q_pubg_sens = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_pubg_sens, @t8, NOW(3) - INTERVAL 15000 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_newbie, '마크 철 농장 주민이 골렘을 소환하지 않아요', '<p>주민 3명, 침대 3개, 좀비 1마리를 배치했는데 골렘이 생기지 않습니다.</p><p>버전은 1.20.4입니다.</p>', 12, 'active', NOW(3) - INTERVAL 90 MINUTE);
SET @q_mc_farm = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_mc_farm, @t1, NOW(3) - INTERVAL 90 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_mc_farm, @t2, NOW(3) - INTERVAL 90 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_tank, '롤 승급전이 없어졌다는데 랭크 시스템이 어떻게 바뀌었나요?', '<p>오랜만에 복귀했습니다. 승급전·강등 보호 규칙이 궁금합니다.</p>', 220, 'active', NOW(3) - INTERVAL 18000 MINUTE);
SET @q_lol_rank = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_lol_rank, @t3, NOW(3) - INTERVAL 18000 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at, is_accepted, accepted_at) VALUES (@q_lol_rank, @u_speed, '<p>디비전 승급전은 없어졌고, LP 100이 되면 바로 올라갑니다. 티어 강등 보호는 남아 있어요.</p>', NOW(3) - INTERVAL 17940 MINUTE, 1, NOW(3) - INTERVAL 17400 MINUTE);
SET @a_rank1 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_rank1, @u_tank, NOW(3) - INTERVAL 17910 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_raid, '엘든링 협력 플레이 비밀번호 설정이 안 돼요', '<p>친구와 같은 비밀번호를 설정했는데 소환 표식이 보이지 않습니다.</p>', 133, 'active', NOW(3) - INTERVAL 21600 MINUTE);
SET @q_elden_coop = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_elden_coop, @t4, NOW(3) - INTERVAL 21600 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_elden_coop, @t9, NOW(3) - INTERVAL 21600 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at) VALUES (@q_elden_coop, @u_build, '<p>두 사람의 맵 진행도가 달라도 보스를 안 잡은 지역이어야 표식이 보여요. 그리고 레벨 차이도 확인해 보세요.</p>', NOW(3) - INTERVAL 21555 MINUTE);
SET @a_coop1 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_coop1, @u_raid, NOW(3) - INTERVAL 21525 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_modder, '마크 서버 호스팅 월 비용 어느 정도인가요?', '<p>10명 규모 모드 서버를 운영하려고 합니다. 호스팅 비용이 궁금해요.</p>', 98, 'active', NOW(3) - INTERVAL 24000 MINUTE);
SET @q_server_cost = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_server_cost, @t1, NOW(3) - INTERVAL 24000 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_server_cost, @t14, NOW(3) - INTERVAL 24000 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_speed, '엘든링 엔딩 분기 조건 정리 부탁합니다', '<p>엔딩이 여러 개라는데 각 엔딩 조건을 정리해 주실 수 있나요?</p>', 260, 'active', NOW(3) - INTERVAL 25200 MINUTE);
SET @q_spoiler = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_spoiler, @t4, NOW(3) - INTERVAL 25200 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_spoiler, @t10, NOW(3) - INTERVAL 25200 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at) VALUES (@q_spoiler, @u_build, '<p>엔딩마다 퀘스트 라인이 달라서 위키 정리 글을 추천드려요. 별의 시대 엔딩은 라니 퀘스트를 끝까지 하면 됩니다.</p>', NOW(3) - INTERVAL 25170 MINUTE);
SET @a_spoiler1 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_spoiler1, @u_speed, NOW(3) - INTERVAL 25140 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_heal, '발로란트 랭크 배치고사는 몇 판인가요?', '<p>계정 레벨 20을 찍었습니다. 배치고사 판 수와 처음 받는 티어 기준이 궁금합니다.</p>', 140, 'active', NOW(3) - INTERVAL 28800 MINUTE);
SET @q_valorant_rank = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_valorant_rank, @t5, NOW(3) - INTERVAL 28800 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at, is_accepted, accepted_at) VALUES (@q_valorant_rank, @u_tank, '<p>5판입니다. 일반전 MMR이 반영돼서 처음 티어가 정해져요.</p>', NOW(3) - INTERVAL 28780 MINUTE, 1, NOW(3) - INTERVAL 28200 MINUTE);
SET @a_vrank1 = LAST_INSERT_ID();
INSERT INTO answer_votes (answer_id, user_id, created_at) VALUES (@a_vrank1, @u_heal, NOW(3) - INTERVAL 28750 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at, hidden_at) VALUES (@u_writeban, '[홍보] 로스트아크 골드 최저가 판매합니다', '<p>골드 최저가 판매합니다. 오픈채팅으로 문의 주세요. 대량 구매 할인 있습니다.</p>', 15, 'hidden', NOW(3) - INTERVAL 3600 MINUTE, NOW(3) - INTERVAL 3480 MINUTE);
SET @q_hidden = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_hidden, @t7, NOW(3) - INTERVAL 3600 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at, deleted_at) VALUES (@u_hoya, '질문 올렸다가 해결해서 지웁니다', '<p>해결되어 삭제한 질문입니다. 목록에 나오면 안 됩니다.</p>', 4, 'deleted', NOW(3) - INTERVAL 30000 MINUTE, NOW(3) - INTERVAL 29700 MINUTE);
SET @q_deleted = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_deleted, @t1, NOW(3) - INTERVAL 30000 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_withdrawn, '배그 에란겔 차량 스폰 위치 정리된 곳 있나요?', '<p>에란겔에서 차량이 자주 나오는 위치를 알고 싶습니다. 정리된 지도가 있으면 공유 부탁드려요.</p>', 410, 'active', NOW(3) - INTERVAL 36000 MINUTE);
SET @q_withdrawn = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_withdrawn, @t8, NOW(3) - INTERVAL 36000 MINUTE);
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_withdrawn, @t10, NOW(3) - INTERVAL 36000 MINUTE);
INSERT INTO answers (question_id, author_id, body, created_at) VALUES (@q_withdrawn, @u_tank, '<p>학교 주변 도로와 밀타 파워 쪽이 스폰이 많아요.</p>', NOW(3) - INTERVAL 35910 MINUTE);
SET @a_withdrawn1 = LAST_INSERT_ID();
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_hoya, '롤 와드 위치 추천 부탁드립니다', '<p>서폿 와드 위치를 라인별로 알고 싶습니다. 초반 2분 와드가 특히 궁금해요.</p>', 30, 'active', NOW(3) - INTERVAL 42000 MINUTE);
SET @q_extra1 = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_extra1, @t3, NOW(3) - INTERVAL 42000 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_raid, '마크 네더 포탈 좌표 계산 방법', '<p>오버월드 좌표를 8로 나누면 된다는데 Y좌표도 나눠야 하나요?</p>', 41, 'active', NOW(3) - INTERVAL 44400 MINUTE);
SET @q_extra2 = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_extra2, @t1, NOW(3) - INTERVAL 44400 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_build, '발로란트 크로스헤어 코드 공유해 주세요', '<p>깔끔한 점 크로스헤어 코드를 찾고 있습니다. 쓰시는 코드 공유 부탁해요.</p>', 52, 'active', NOW(3) - INTERVAL 46800 MINUTE);
SET @q_extra3 = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_extra3, @t5, NOW(3) - INTERVAL 46800 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_newbie, '스타듀밸리 결혼 후보 추천', '<p>처음 결혼하려는데 이벤트가 재밌는 후보가 누구인가요?</p>', 63, 'active', NOW(3) - INTERVAL 49200 MINUTE);
SET @q_extra4 = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_extra4, @t6, NOW(3) - INTERVAL 49200 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_tank, '로아 원정대 레벨 효율적으로 올리는 법', '<p>부캐 육성 중인데 원정대 레벨을 빨리 올리는 방법이 궁금합니다.</p>', 74, 'active', NOW(3) - INTERVAL 51600 MINUTE);
SET @q_extra5 = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_extra5, @t7, NOW(3) - INTERVAL 51600 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_heal, '배그 반동 제어 연습 방법', '<p>훈련장에서 반동 제어를 어떻게 연습하는 게 효과적인가요?</p>', 85, 'active', NOW(3) - INTERVAL 54000 MINUTE);
SET @q_extra6 = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_extra6, @t8, NOW(3) - INTERVAL 54000 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_speed, '엘든링 말레니아 패턴 공략', '<p>물새 난무를 도저히 못 피하겠습니다. 피하는 요령이 있을까요?</p>', 96, 'active', NOW(3) - INTERVAL 56400 MINUTE);
SET @q_extra7 = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_extra7, @t4, NOW(3) - INTERVAL 56400 MINUTE);
INSERT INTO questions (author_id, title, body, view_count, status, created_at) VALUES (@u_modder, '게이밍 노트북 발열 줄이는 방법', '<p>게임 중 CPU 온도가 95도까지 올라갑니다. 언더볼팅 말고 방법이 있을까요?</p>', 107, 'active', NOW(3) - INTERVAL 58800 MINUTE);
SET @q_extra8 = LAST_INSERT_ID();
INSERT INTO question_tags (question_id, tag_id, created_at) VALUES (@q_extra8, @t12, NOW(3) - INTERVAL 58800 MINUTE);
-- 추천 취소한 행 (추천 수에 세지 않음)
INSERT INTO answer_votes (answer_id, user_id, status, created_at) VALUES (@a_trade2, @u_newbie, 'canceled', NOW(3) - INTERVAL 1200 MINUTE);

-- ---------------------------------------------------------------------
-- 수정 이력
-- ---------------------------------------------------------------------
INSERT INTO question_edit_histories (question_id, editor_id, edit_reason, edited_at) VALUES (@q_trade, @u_hoya, '버전 정보 추가', NOW(3) - INTERVAL 1740 MINUTE);
INSERT INTO answer_edit_histories (answer_id, editor_id, edit_reason, edited_at) VALUES (@a_trade2, @u_speed, NULL, NOW(3) - INTERVAL 1500 MINUTE);

-- ---------------------------------------------------------------------
-- 게시글·댓글
-- ---------------------------------------------------------------------
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_build, '엘든링 DLC 보스 순서 정리 (스포 최소)', '<p>DLC 보스를 어떤 순서로 잡으면 편한지 정리했습니다.</p><p>레벨 150 기준이고 축복 강화 수치도 같이 적었어요.</p>', 512, NOW(3) - INTERVAL 2400 MINUTE);
SET @p_guide = LAST_INSERT_ID();
INSERT INTO comments (post_id, author_id, body, created_at) VALUES (@p_guide, @u_raid, '정리 감사합니다! 저장해 둘게요.', NOW(3) - INTERVAL 2340 MINUTE);
SET @c_guide1 = LAST_INSERT_ID();
INSERT INTO comments (post_id, author_id, body, created_at) VALUES (@p_guide, @u_newbie, '축복 강화 몇까지 해야 하나요?', NOW(3) - INTERVAL 2280 MINUTE);
SET @c_guide2 = LAST_INSERT_ID();
INSERT INTO comments (post_id, author_id, body, created_at) VALUES (@p_guide, @u_build, '최소 8은 추천해요.', NOW(3) - INTERVAL 2270 MINUTE);
SET @c_guide3 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_raid, '토요일 저녁 카멘 하드 트라이 공대원 구합니다', '<p>토요일 저녁 9시 출발, 1630 이상 트라이 공대입니다.</p><p>서폿 2명 구합니다.</p>', 88, NOW(3) - INTERVAL 600 MINUTE);
SET @p_party = LAST_INSERT_ID();
INSERT INTO comments (post_id, author_id, body, created_at) VALUES (@p_party, @u_heal, '바드 1640 신청합니다.', NOW(3) - INTERVAL 570 MINUTE);
SET @c_party1 = LAST_INSERT_ID();
INSERT INTO comments (post_id, author_id, body, created_at) VALUES (@p_party, @u_tank, '딜러 자리도 있나요?', NOW(3) - INTERVAL 555 MINUTE);
SET @c_party2 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_hoya, '오늘 마크 서버에서 지은 성 자랑합니다', '<p>친구들이랑 일주일 동안 지은 성입니다.</p><p>다음에는 지하 도시를 만들 계획이에요.</p>', 41, NOW(3) - INTERVAL 180 MINUTE);
SET @p_free = LAST_INSERT_ID();
INSERT INTO comments (post_id, author_id, body, created_at) VALUES (@p_free, @u_modder, '지붕 색 조합 예쁘네요.', NOW(3) - INTERVAL 160 MINUTE);
SET @c_free1 = LAST_INSERT_ID();
INSERT INTO comments (post_id, author_id, body, created_at) VALUES (@p_free, @u_commentban, '별로네요 ㅋㅋ', NOW(3) - INTERVAL 140 MINUTE);
SET @c_free2 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at, status, hidden_at) VALUES (@u_writeban, '게임 계정 싸게 팝니다', '<p>롤 다이아 계정 판매합니다. 쪽지 주세요.</p>', 9, NOW(3) - INTERVAL 1800 MINUTE, 'hidden', NOW(3) - INTERVAL 1620 MINUTE);
SET @p_hidden = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_speed, '이번 주 게임 업데이트 소식 모음', '<p>롤·발로·배그 이번 주 패치 요약입니다.</p><p>자세한 건 각 공식 패치 노트를 확인하세요.</p>', 230, NOW(3) - INTERVAL 1200 MINUTE);
SET @p_patch = LAST_INSERT_ID();
INSERT INTO comments (post_id, author_id, body, created_at) VALUES (@p_patch, @u_tank, '매주 올려 주셔서 감사합니다.', NOW(3) - INTERVAL 1170 MINUTE);
SET @c_patch1 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_hoya, '자유게시판 테스트 글 1: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 1번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 5, NOW(3) - INTERVAL 3600 MINUTE);
SET @p_extra1 = LAST_INSERT_ID();
INSERT INTO comments (post_id, author_id, body, created_at) VALUES (@p_extra1, @u_newbie, '저도 오늘 한 판 했어요.', NOW(3) - INTERVAL 3570 MINUTE);
SET @c_extra11 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_raid, '자유게시판 테스트 글 2: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 2번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 8, NOW(3) - INTERVAL 4680 MINUTE);
SET @p_extra2 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_build, '자유게시판 테스트 글 3: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 3번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 11, NOW(3) - INTERVAL 5760 MINUTE);
SET @p_extra3 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_newbie, '자유게시판 테스트 글 4: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 4번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 14, NOW(3) - INTERVAL 6840 MINUTE);
SET @p_extra4 = LAST_INSERT_ID();
INSERT INTO comments (post_id, author_id, body, created_at) VALUES (@p_extra4, @u_speed, '저도 오늘 한 판 했어요.', NOW(3) - INTERVAL 6810 MINUTE);
SET @c_extra41 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_tank, '자유게시판 테스트 글 5: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 5번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 17, NOW(3) - INTERVAL 7920 MINUTE);
SET @p_extra5 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_heal, '자유게시판 테스트 글 6: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 6번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 20, NOW(3) - INTERVAL 9000 MINUTE);
SET @p_extra6 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_speed, '자유게시판 테스트 글 7: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 7번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 23, NOW(3) - INTERVAL 10080 MINUTE);
SET @p_extra7 = LAST_INSERT_ID();
INSERT INTO comments (post_id, author_id, body, created_at) VALUES (@p_extra7, @u_raid, '저도 오늘 한 판 했어요.', NOW(3) - INTERVAL 10050 MINUTE);
SET @c_extra71 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_modder, '자유게시판 테스트 글 8: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 8번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 26, NOW(3) - INTERVAL 11160 MINUTE);
SET @p_extra8 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_hoya, '자유게시판 테스트 글 9: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 9번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 29, NOW(3) - INTERVAL 12240 MINUTE);
SET @p_extra9 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_raid, '자유게시판 테스트 글 10: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 10번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 32, NOW(3) - INTERVAL 13320 MINUTE);
SET @p_extra10 = LAST_INSERT_ID();
INSERT INTO comments (post_id, author_id, body, created_at) VALUES (@p_extra10, @u_tank, '저도 오늘 한 판 했어요.', NOW(3) - INTERVAL 13290 MINUTE);
SET @c_extra101 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_build, '자유게시판 테스트 글 11: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 11번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 35, NOW(3) - INTERVAL 14400 MINUTE);
SET @p_extra11 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_newbie, '자유게시판 테스트 글 12: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 12번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 38, NOW(3) - INTERVAL 15480 MINUTE);
SET @p_extra12 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_tank, '자유게시판 테스트 글 13: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 13번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 41, NOW(3) - INTERVAL 16560 MINUTE);
SET @p_extra13 = LAST_INSERT_ID();
INSERT INTO comments (post_id, author_id, body, created_at) VALUES (@p_extra13, @u_modder, '저도 오늘 한 판 했어요.', NOW(3) - INTERVAL 16530 MINUTE);
SET @c_extra131 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_heal, '자유게시판 테스트 글 14: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 14번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 44, NOW(3) - INTERVAL 17640 MINUTE);
SET @p_extra14 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_speed, '자유게시판 테스트 글 15: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 15번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 47, NOW(3) - INTERVAL 18720 MINUTE);
SET @p_extra15 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_modder, '자유게시판 테스트 글 16: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 16번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 50, NOW(3) - INTERVAL 19800 MINUTE);
SET @p_extra16 = LAST_INSERT_ID();
INSERT INTO comments (post_id, author_id, body, created_at) VALUES (@p_extra16, @u_build, '저도 오늘 한 판 했어요.', NOW(3) - INTERVAL 19770 MINUTE);
SET @c_extra161 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_hoya, '자유게시판 테스트 글 17: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 17번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 53, NOW(3) - INTERVAL 20880 MINUTE);
SET @p_extra17 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_raid, '자유게시판 테스트 글 18: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 18번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 56, NOW(3) - INTERVAL 21960 MINUTE);
SET @p_extra18 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_build, '자유게시판 테스트 글 19: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 19번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 59, NOW(3) - INTERVAL 23040 MINUTE);
SET @p_extra19 = LAST_INSERT_ID();
INSERT INTO comments (post_id, author_id, body, created_at) VALUES (@p_extra19, @u_heal, '저도 오늘 한 판 했어요.', NOW(3) - INTERVAL 23010 MINUTE);
SET @c_extra191 = LAST_INSERT_ID();
INSERT INTO posts (author_id, title, body, view_count, created_at) VALUES (@u_newbie, '자유게시판 테스트 글 20: 오늘의 게임 한 줄 후기', '<p>페이지 넘김 확인용 게시글 20번입니다.</p><p>오늘 한 게임과 느낀 점을 한 줄로 남겨 주세요.</p>', 62, NOW(3) - INTERVAL 24120 MINUTE);
SET @p_extra20 = LAST_INSERT_ID();

-- ---------------------------------------------------------------------
-- 공지
-- ---------------------------------------------------------------------
INSERT INTO notices (author_id, title, body, is_pinned, created_at) VALUES (@u_admin, 'GAMERS 커뮤니티 이용 규칙 안내', '<p>질문·답변·게시판 이용 규칙입니다.</p><p>홍보·거래·욕설 글은 숨김 및 제재 대상입니다.</p>', 1, NOW(3) - INTERVAL 86400 MINUTE);
SET @n_rule = LAST_INSERT_ID();
INSERT INTO notices (author_id, title, body, created_at) VALUES (@u_admin, '11월 정기 점검 안내', '<p>정기 점검 동안 글쓰기가 잠시 제한됩니다.</p>', NOW(3) - INTERVAL 4320 MINUTE);
SET @n_check = LAST_INSERT_ID();
INSERT INTO notices (author_id, title, body, created_at) VALUES (@u_admin, '태그 정리 안내 (lol → 리그오브레전드)', '<p>같은 뜻의 태그를 하나로 합쳤습니다.</p>', NOW(3) - INTERVAL 21600 MINUTE);
SET @n_tag = LAST_INSERT_ID();

-- ---------------------------------------------------------------------
-- 신고 (처리 대기·처리 완료·반려·취소)
-- ---------------------------------------------------------------------
-- 처리 대기: 같은 대상을 여러 회원이 신고 (관리자 화면 duplicateCount)
INSERT INTO reports (reporter_id, target_type, target_id, target_author_id, reason, detail, status, created_at) VALUES (@u_newbie, 'question', @q_spoiler, @u_speed, 'spoiler', NULL, 'pending', NOW(3) - INTERVAL 1200 MINUTE);
SET @r_spoiler1 = LAST_INSERT_ID();
INSERT INTO reports (reporter_id, target_type, target_id, target_author_id, reason, detail, status, created_at) VALUES (@u_heal, 'question', @q_spoiler, @u_speed, 'spoiler', NULL, 'pending', NOW(3) - INTERVAL 1080 MINUTE);
SET @r_spoiler2 = LAST_INSERT_ID();
INSERT INTO reports (reporter_id, target_type, target_id, target_author_id, reason, detail, status, created_at) VALUES (@u_tank, 'question', @q_spoiler, @u_speed, 'etc', '제목에 엔딩 내용이 그대로 나옵니다.', 'pending', NOW(3) - INTERVAL 360 MINUTE);
SET @r_spoiler3 = LAST_INSERT_ID();
INSERT INTO reports (reporter_id, target_type, target_id, target_author_id, reason, detail, status, created_at) VALUES (@u_hoya, 'comment', @c_free2, @u_commentban, 'abuse', '비하 댓글입니다.', 'pending', NOW(3) - INTERVAL 120 MINUTE);
SET @r_comment = LAST_INSERT_ID();
INSERT INTO reports (reporter_id, target_type, target_id, target_author_id, reason, detail, status, created_at) VALUES (@u_build, 'answer', @a_mod2, @u_speed, 'misinformation', NULL, 'pending', NOW(3) - INTERVAL 720 MINUTE);
SET @r_answer = LAST_INSERT_ID();
-- 처리 완료: 홍보 질문·거래 게시글 숨김 + 제재
INSERT INTO reports (reporter_id, target_type, target_id, target_author_id, reason, detail, status, created_at, hide_target, processed_by, processed_at) VALUES (@u_raid, 'question', @q_hidden, @u_writeban, 'spam', '골드 판매 홍보글', 'resolved', NOW(3) - INTERVAL 3540 MINUTE, 1, @u_admin, NOW(3) - INTERVAL 3480 MINUTE);
SET @r_hidden_q = LAST_INSERT_ID();
INSERT INTO reports (reporter_id, target_type, target_id, target_author_id, reason, detail, status, created_at, hide_target, processed_by, processed_at) VALUES (@u_tank, 'post', @p_hidden, @u_writeban, 'illegal', NULL, 'resolved', NOW(3) - INTERVAL 1740 MINUTE, 1, @u_admin, NOW(3) - INTERVAL 1620 MINUTE);
SET @r_hidden_p = LAST_INSERT_ID();
-- 반려
INSERT INTO reports (reporter_id, target_type, target_id, target_author_id, reason, detail, status, created_at, hide_target, processed_by, processed_at) VALUES (@u_newbie, 'question', @q_spec, @u_tank, 'misinformation', '가격 정보가 틀렸어요', 'rejected', NOW(3) - INTERVAL 9000 MINUTE, 0, @u_admin, NOW(3) - INTERVAL 8400 MINUTE);
SET @r_rejected = LAST_INSERT_ID();
-- 신고자가 접수 취소
INSERT INTO reports (reporter_id, target_type, target_id, target_author_id, reason, detail, status, created_at, canceled_at) VALUES (@u_speed, 'post', @p_guide, @u_build, 'spoiler', NULL, 'canceled', NOW(3) - INTERVAL 1800 MINUTE, NOW(3) - INTERVAL 1799 MINUTE);
SET @r_canceled = LAST_INSERT_ID();

-- ---------------------------------------------------------------------
-- 제재 (글쓰기 제한·이용 정지·댓글 제한 걸려 있음, 해제된 제재 1건)
-- ---------------------------------------------------------------------
INSERT INTO user_sanctions (user_id, type, days, reason, starts_at, ends_at, applied_by, report_id, created_at) VALUES (@u_writeban, 'write_ban', 7, CONCAT('신고 처리: 스팸 / 홍보성 / 도배성 게시물 (신고 #', @r_hidden_q, ')'), NOW(3) - INTERVAL 3480 MINUTE, NOW(3) + INTERVAL 6600 MINUTE, @u_admin, @r_hidden_q, NOW(3) - INTERVAL 3480 MINUTE);
SET @s_writeban = LAST_INSERT_ID();
INSERT INTO user_sanctions (user_id, type, days, reason, starts_at, ends_at, applied_by, created_at) VALUES (@u_suspended, 'suspend', 30, '반복적인 욕설과 분란 조장', NOW(3) - INTERVAL 2880 MINUTE, NOW(3) + INTERVAL 40320 MINUTE, @u_admin, NOW(3) - INTERVAL 2880 MINUTE);
SET @s_suspend = LAST_INSERT_ID();
INSERT INTO user_sanctions (user_id, type, days, reason, starts_at, ends_at, applied_by, created_at) VALUES (@u_commentban, 'comment_ban', 3, '비하 댓글', NOW(3) - INTERVAL 60 MINUTE, NOW(3) + INTERVAL 4260 MINUTE, @u_admin, NOW(3) - INTERVAL 60 MINUTE);
SET @s_commentban = LAST_INSERT_ID();
INSERT INTO user_sanctions (user_id, type, days, reason, starts_at, ends_at, applied_by, released_at, released_by, release_reason, created_at) VALUES (@u_newbie, 'write_ban', 3, '도배', NOW(3) - INTERVAL 12960 MINUTE, NOW(3) - INTERVAL 8640 MINUTE, @u_admin, NOW(3) - INTERVAL 11520 MINUTE, @u_admin, '오처리 확인', NOW(3) - INTERVAL 12960 MINUTE);
SET @s_released = LAST_INSERT_ID();

-- ---------------------------------------------------------------------
-- 관리자 활동 로그 (위 처리와 맞춤)
-- ---------------------------------------------------------------------
INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail, created_at) VALUES (@u_admin, 'CREATE_NOTICE', 'notice', @n_rule, CONCAT('공지 #', @n_rule), NULL, NOW(3) - INTERVAL 86400 MINUTE);
INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail, created_at) VALUES (@u_admin, 'GRANT_PERMISSION', 'user', @u_mod, CONCAT('회원 #', @u_mod), 'content_manage', NOW(3) - INTERVAL 28800 MINUTE);
INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail, created_at) VALUES (@u_admin, 'MERGE_TAG', 'tag', @t_merged, CONCAT('태그 #', @t_merged), 'lol → 리그오브레전드', NOW(3) - INTERVAL 21600 MINUTE);
INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail, created_at) VALUES (@u_admin, 'CREATE_NOTICE', 'notice', @n_tag, CONCAT('공지 #', @n_tag), NULL, NOW(3) - INTERVAL 21600 MINUTE);
INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail, created_at) VALUES (@u_admin, 'DELETE_TAG', 'tag', @t_blocked, CONCAT('태그 #', @t_blocked), '거래 유도 태그', NOW(3) - INTERVAL 14400 MINUTE);
INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail, created_at) VALUES (@u_admin, 'SANCTION_USER', 'user', @u_newbie, CONCAT('회원 #', @u_newbie), '글쓰기 제한 3일: 도배', NOW(3) - INTERVAL 12960 MINUTE);
INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail, created_at) VALUES (@u_admin, 'RELEASE_SANCTION', 'user', @u_newbie, CONCAT('회원 #', @u_newbie), '오처리 확인', NOW(3) - INTERVAL 11520 MINUTE);
INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail, created_at) VALUES (@u_admin, 'CREATE_NOTICE', 'notice', @n_check, CONCAT('공지 #', @n_check), NULL, NOW(3) - INTERVAL 4320 MINUTE);
INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail, created_at) VALUES (@u_admin, 'REJECT_REPORT', 'report', @r_rejected, CONCAT('신고 #', @r_rejected), NULL, NOW(3) - INTERVAL 8400 MINUTE);
INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail, created_at) VALUES (@u_admin, 'HIDE_QUESTION', 'question', @q_hidden, CONCAT('질문 #', @q_hidden), NULL, NOW(3) - INTERVAL 3480 MINUTE);
INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail, created_at) VALUES (@u_admin, 'RESOLVE_REPORT', 'report', @r_hidden_q, CONCAT('신고 #', @r_hidden_q), '대상 숨김, 글쓰기 제한 7일', NOW(3) - INTERVAL 3480 MINUTE);
INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail, created_at) VALUES (@u_admin, 'SANCTION_USER', 'user', @u_writeban, CONCAT('회원 #', @u_writeban), '글쓰기 제한 7일: 스팸 / 홍보성 / 도배성 게시물', NOW(3) - INTERVAL 3480 MINUTE);
INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail, created_at) VALUES (@u_admin, 'SANCTION_USER', 'user', @u_suspended, CONCAT('회원 #', @u_suspended), '이용 정지 30일: 반복적인 욕설과 분란 조장', NOW(3) - INTERVAL 2880 MINUTE);
INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail, created_at) VALUES (@u_admin, 'HIDE_POST', 'post', @p_hidden, CONCAT('게시글 #', @p_hidden), NULL, NOW(3) - INTERVAL 1620 MINUTE);
INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail, created_at) VALUES (@u_admin, 'RESOLVE_REPORT', 'report', @r_hidden_p, CONCAT('신고 #', @r_hidden_p), '대상 숨김', NOW(3) - INTERVAL 1620 MINUTE);
INSERT INTO activity_logs (admin_id, action, target_type, target_id, target_label, detail, created_at) VALUES (@u_admin, 'SANCTION_USER', 'user', @u_commentban, CONCAT('회원 #', @u_commentban), '댓글 제한 3일: 비하 댓글', NOW(3) - INTERVAL 60 MINUTE);

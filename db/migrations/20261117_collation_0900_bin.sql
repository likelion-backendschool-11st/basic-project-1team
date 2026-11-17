-- =====================================================================
-- 정렬 규칙 utf8mb4_0900_as_cs → utf8mb4_0900_bin
--
-- 운영 DB(TiDB)에는 utf8mb4_0900_as_cs가 없어 MySQL·TiDB 모두 있는 utf8mb4_0900_bin으로 맞춥니다.
-- 둘 다 대소문자·악센트를 구분하고 끝 공백을 다른 값으로 보므로(NO PAD) 중복 검사 결과는 같습니다.
-- 외래키는 모두 BIGINT id 컬럼이라 정렬 규칙 변경과 상관없습니다.
--   mysql -u gamers -p gamers_db < db/migrations/20261117_collation_0900_bin.sql
-- =====================================================================
SET NAMES utf8mb4;

ALTER DATABASE gamers_db CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;

ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE user_permissions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE password_reset_tokens CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE questions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE question_edit_histories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE answers CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE answer_edit_histories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE answer_votes CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE tags CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE question_tags CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE attachments CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE attachment_links CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE posts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE comments CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE reports CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE user_sanctions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE notices CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE view_histories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE activity_logs CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE point_histories CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE notifications CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE tag_merges CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE tag_merge_questions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE user_main_games CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;
ALTER TABLE report_temp_hides CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_bin;

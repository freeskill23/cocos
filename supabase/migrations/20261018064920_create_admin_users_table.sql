/*
# Create admin_users table

1. New Tables
- `admin_users` — 관리자 권한을 가진 사용자 ID 목록. id는 auth.users의 id와 동일.
2. Security
- RLS 활성화. 인증된 사용자가 자신의 관리자 여부만 확인할 수 있도록 SELECT 정책 적용.
  (실제 관리자 검증은 admin-users 엣지 함수가 서비스 롤 키로 수행하므로 클라이언트가 이 테이블을 직접 조작하지 않음.)
3. Important Notes
- 기존에 존재하지 않던 테이블을 새로 생성함 (admin-users 엣지 함수가 참조하던 테이블).
- 기존 관리자 계정 jpgcorp@naver.com 과 새로 가입한 freeskillwls@naver.com 을 관리자로 등록.
*/

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_admin_users" ON admin_users;
CREATE POLICY "select_own_admin_users" ON admin_users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

INSERT INTO admin_users (id)
SELECT id FROM auth.users
WHERE email IN ('jpgcorp@naver.com', 'freeskillwls@naver.com')
ON CONFLICT (id) DO NOTHING;
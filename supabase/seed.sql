-- ============================================================
-- ENJIN CRM  デモ用ダミーデータ（課題提出用 / 個人情報なし）
-- ------------------------------------------------------------
-- 課題は「DBに双方向で読み書きできる」ことを見せるのが目的なので、
-- 中身は全部 架空の人・架空のイベント です（本物の個人情報は入れない）。
--
-- 使い方: Supabase の SQL Editor に貼って Run。
-- （schema.sql を実行済みであることが前提）
-- 何度Runしても重複しないよう、メール/タイトルで衝突回避しています。
-- ============================================================

-- ── デモ会員（4名・全員架空）──
insert into members (name, email, joined_at, status) values
  ('デモ 太郎', 'demo-taro@example.com',  '2025-10-01', 'active'),
  ('デモ 花子', 'demo-hanako@example.com','2025-11-15', 'active'),
  ('デモ 次郎', 'demo-jiro@example.com',  '2026-01-20', 'new'),
  ('デモ 美咲', 'demo-misaki@example.com','2024-12-05', 'dormant')
on conflict do nothing;
-- ※ members.email には unique 制約を付けていないため、
--   このSQLを2回流すと重複します。デモ用なので再投入時は先に下記で掃除してOK:
--   delete from members where email like 'demo-%@example.com';

-- ── デモイベント（3件）── 種別マスタ「朝活」「ENJIN Lab」「勉強会」に紐付け
insert into events (title, date, time, format, host, type_id)
select v.title, v.date::date, v.time, v.format::event_format, v.host, et.id
from (values
  ('デモ朝活 6/1',   '2026-06-01', '07:00-07:30', 'online',  'デモ運営', '朝活'),
  ('デモLab #1',     '2026-06-05', '20:00-22:00', 'offline', 'デモ運営', 'ENJIN Lab'),
  ('デモ勉強会 SQL', '2026-06-08', '21:00-22:00', 'online',  'デモ運営', '勉強会')
) as v(title, date, time, format, host, type_name)
left join event_types et on et.name = v.type_name
on conflict do nothing;

-- ── 参加記録（中間テーブル）を少しだけ投入 ──
--   member の email と event の title を「キー」にして紐付ける（id を直接書かない）。
--   ※ ここに入る行が、会員側からもイベント側からも見える「双方向管理」の実体。
insert into event_participants (event_id, member_id, status, note)
select e.id, m.id, v.status::participation_status, v.note
from (values
  ('デモ朝活 6/1',   'demo-taro@example.com',   'present', '皮切りの参加'),
  ('デモ朝活 6/1',   'demo-hanako@example.com', 'late',    '5分遅刻'),
  ('デモLab #1',     'demo-taro@example.com',   'present', '登壇'),
  ('デモ勉強会 SQL', 'demo-misaki@example.com', 'present', '')
) as v(event_title, member_email, status, note)
join events  e on e.title = v.event_title
join members m on m.email = v.member_email
on conflict (event_id, member_id) do nothing;  -- 同じ人を同じイベントに二重登録しない

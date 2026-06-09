-- ============================================================
-- ENJIN CRM  データベース・スキーマ（Supabase / PostgreSQL）
-- 要件定義書 v0.4 §5「データモデル」に対応
-- ------------------------------------------------------------
-- 【このファイルは何？】
--   Supabase（中身は PostgreSQL という本格的なデータベース）に
--   「どんな表（テーブル）を、どんな列で作るか」を命令するSQLです。
--
-- 【使い方（バックエンド未経験者向け）】
--   1. ブラウザで Supabase のプロジェクトを開く
--   2. 左メニュー「SQL Editor」→「New query」
--   3. このファイルの中身を全部コピペして「Run」を押す
--   → 下に並ぶテーブル・型・セキュリティ設定が一気に作られます
--
-- 【用語ミニ解説】
--   ・テーブル = エクセルの1シート（行＝1件、列＝項目）
--   ・型(enum) = 「選べる値のリスト」を固定する仕組み（例: present/late/absent）
--   ・主キー(PK) = その行を一意に指す番号（重複しない背番号）
--   ・外部キー(FK) = 別テーブルの行を指す列（会員⇄イベントを繋ぐ）
--   ・RLS = ログインした人しか読み書きできなくする最後の砦（後半で設定）
--
-- 【作り直したいとき】
--   このファイル先頭の「リセット用ブロック」のコメントを外して一度Runすると、
--   全部消してから作り直せます（※本番データが入った後は絶対に実行しないこと）。
-- ============================================================


-- ============================================================
-- 0. リセット用ブロック（ふだんはコメントのまま。作り直す時だけ使う）
-- ------------------------------------------------------------
-- ↓ 行頭の「-- 」を消すと有効になります。順番が大事なので一括で。
-- ------------------------------------------------------------
-- drop table if exists sns_reactions, sns_posts,
--   content_posts, funnel_metrics,
--   proposal_notes, proposal_updates, proposal_links, proposal_docs,
--   proposal_events, proposal_cofounders, proposals,
--   event_participants, events, event_types,
--   members, acquisition_sources, acquisition_owners, app_users cascade;
-- drop type if exists user_role, member_status, conversion_path,
--   event_format, event_cadence, participation_status, funnel_route,
--   proposal_status cascade;
-- ============================================================


-- ============================================================
-- 1. 型(enum) の定義 = 「選べる値」を先に決めておく
-- ------------------------------------------------------------
-- enum にしておくと、想定外の文字列が保存されるのを DB が防いでくれる。
-- ============================================================

create type user_role          as enum ('owner', 'editor');                       -- 利用者ロール
create type member_status       as enum ('active', 'dormant', 'new', 'withdrawn'); -- 会員ステータス
create type conversion_path     as enum ('line_nurture', 'event_experience', 'direct'); -- 軸2 入会経路
create type event_format        as enum ('online', 'offline');                    -- 開催形式
create type event_cadence       as enum ('routine', 'adhoc');                     -- 定期 / 突発
create type participation_status as enum ('present', 'late', 'absent');           -- 出欠
create type funnel_route        as enum ('line_nurture', 'event_experience');     -- ファネルの経路（2本）
create type proposal_status     as enum ('drafting', 'adopted', 'running', 'rejected'); -- 起案ステータス


-- ============================================================
-- 2. 共通の小道具：updated_at（最終更新時刻）を自動で入れる関数
-- ------------------------------------------------------------
-- 行を更新するたびに updated_at を「今」に書き換えるための仕掛け。
-- 各テーブルに trigger として後で取り付けます（細かい話なので最初は気にしなくてOK）。
-- ============================================================
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ============================================================
-- 3. マスタ / 利用者テーブル（他から参照される土台になる表）
-- ============================================================

-- ── app_users（この CRM にログインする運営側の人。初期は三木・中澤・下山の3名）──
--   ※ 会員(members)とは別物。Supabase の認証(auth.users)と1対1で紐づくプロフィール表。
--   ※ 名前を "users" にすると Supabase 内部の予約語と紛らわしいので app_users にしています。
create table app_users (
  id         uuid primary key references auth.users(id) on delete cascade, -- 認証ユーザーのidをそのまま使う
  email      text not null,                 -- ログインID（メール）
  name       text not null,                 -- 表示名（三木 / 中澤 / 下山 …）
  role       user_role not null default 'editor', -- owner / editor
  is_active  boolean not null default true, -- 退任時などに false にして無効化
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_app_users_updated before update on app_users
  for each row execute function set_updated_at();

-- ── acquisition_owners（軸1：担当創業者マスタ）──
--   要件は「FK(users)」だが、"公式" "その他・紹介" はログインユーザーではないため、
--   ここを独立マスタにして 5 択すべてを扱う。創業者本人は user_id で app_users と連動（表記ゆれ防止）。
create table acquisition_owners (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,          -- 慎太郎(=中澤) / 下山 / 三木 / 公式 / その他・紹介
  user_id    uuid references app_users(id), -- 創業者本人なら紐付け（公式/その他は null）
  is_active  boolean not null default true,
  sort_order int not null default 0,        -- 画面での並び順
  created_at timestamptz not null default now()
);

-- ── acquisition_sources（軸3：ファーストタッチ チャネル マスタ。任意・設定画面から追加可）──
create table acquisition_sources (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,          -- 個人SNS / 公式SNS / 公式LINE / 紹介 / イベント / その他
  is_active  boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ── event_types（イベント種別マスタ）──
create table event_types (
  id             uuid primary key default gen_random_uuid(),
  name           text not null unique,       -- ENJIN Lab / 朝活 / オンライン飲み会 / 勉強会 …
  default_format event_format not null,      -- 既定の開催形式
  cadence        event_cadence not null,     -- routine(定期) / adhoc(突発)
  color          text,                       -- グラフ表示用の色（任意）
  sort_order     int not null default 0,
  created_at     timestamptz not null default now()
);


-- ============================================================
-- 4. 会員・イベント・参加記録（このアプリの中核）
-- ============================================================

-- ── members（会員）──
create table members (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  email               text,                  -- 重複チェックは運用で（同名の別人もあり得るため unique にはしない）
  phone               text,
  birthday            date,                  -- NEW: 誕生日アラート用
  joined_at           date not null,         -- 入会日
  withdrawn_at        date,                  -- NEW: 退会日（チャーン算出用）
  status              member_status not null default 'new',
  acquisition_owner_id uuid references acquisition_owners(id),  -- 軸1 担当創業者
  conversion_path     conversion_path,       -- 軸2 入会経路（固定enum）
  acquisition_source_id uuid references acquisition_sources(id), -- 軸3 ファーストタッチ（任意）
  tags                text[] not null default '{}', -- タグの配列
  job                 text,
  skills              text[] not null default '{}',
  interests           text[] not null default '{}',
  note                text[] not null default '{}', -- 運営メモ（複数行）
  last_seen_at        date,                  -- イベント参加記録から自動更新（運用ルールは要件§5参照）
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger trg_members_updated before update on members
  for each row execute function set_updated_at();

-- ── events（イベント）──
create table events (
  id         uuid primary key default gen_random_uuid(),
  type_id    uuid references event_types(id), -- NEW: 種別マスタ参照
  title      text not null,
  date       date not null,
  time       text,                            -- "20:00-22:00" のような表記をそのまま保持
  format     event_format,
  host       text,
  theme      text,
  summary    text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_events_updated before update on events
  for each row execute function set_updated_at();

-- ── event_participants（参加記録・中間テーブル）──
--   会員詳細からでもイベント詳細からでも、この表に行を足す＝双方向追加の基盤。
create table event_participants (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  member_id  uuid not null references members(id) on delete cascade,
  status     participation_status not null,
  note       text,
  created_at timestamptz not null default now(),
  unique (event_id, member_id)              -- 同じイベントに同じ人を二重登録させない
);


-- ============================================================
-- 5. 起案（proposals）= 現状の mock 構造をそのまま移植（⚪今回変更なし）
-- ============================================================

-- ── proposals（起案の本体）──
create table proposals (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  status      proposal_status not null default 'drafting',
  proposed_at date,                          -- 起案日
  proposer_id uuid references members(id),   -- 起案者（会員）
  summary     text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_proposals_updated before update on proposals
  for each row execute function set_updated_at();

-- ── proposal_cofounders（共同創業者：起案⇄会員の多対多）──
create table proposal_cofounders (
  proposal_id uuid not null references proposals(id) on delete cascade,
  member_id   uuid not null references members(id) on delete cascade,
  primary key (proposal_id, member_id)
);

-- ── proposal_events（起案に関連するイベント：多対多）──
create table proposal_events (
  proposal_id uuid not null references proposals(id) on delete cascade,
  event_id    uuid not null references events(id) on delete cascade,
  primary key (proposal_id, event_id)
);

-- ── proposal_docs（添付書類）──
create table proposal_docs (
  id          uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references proposals(id) on delete cascade,
  kind        text,                          -- 種類（資料 / 議事録 など）
  title       text,
  url         text,
  created_at  timestamptz not null default now()
);

-- ── proposal_links（関連リンク）──
create table proposal_links (
  id          uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references proposals(id) on delete cascade,
  label       text,
  url         text,
  created_at  timestamptz not null default now()
);

-- ── proposal_updates（ステータス変更などの更新タイムライン = mock の history）──
create table proposal_updates (
  id            uuid primary key default gen_random_uuid(),
  proposal_id   uuid not null references proposals(id) on delete cascade,
  changed_at    date,
  from_status   proposal_status,             -- null = 新規登録
  to_status     proposal_status,
  by_name       text,                        -- 変更者（mock は氏名文字列なので踏襲）
  note          text,
  created_at    timestamptz not null default now()
);

-- ── proposal_notes（自由メモ）──
create table proposal_notes (
  id          uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references proposals(id) on delete cascade,
  noted_at    date,
  text        text,
  created_at  timestamptz not null default now()
);


-- ============================================================
-- 6. 入会前メトリクス・コンテンツ投稿数（集計専用。会員には紐づかない）
-- ============================================================

-- ── funnel_metrics（入会前ファネルの母数・月次・経路別）──
--   同じ period に route ごとで2行持つ（LINE育成型 / イベント体験型）。
--   ※ 入会数(ゴール)はここに持たない。members の軸1・軸2から自動集計する。
create table funnel_metrics (
  id                 uuid primary key default gen_random_uuid(),
  period             text not null,          -- 例: 2026-06
  route              funnel_route not null,  -- line_nurture / event_experience
  impressions        int,                    -- インプレッション
  line_followers     int,                    -- 公式LINE 登録者数（LINE育成型）
  free_consultations int,                    -- 初回無料面談数（任意）
  event_applications int,                    -- イベント申込数（イベント体験型）
  event_participants int,                    -- イベント参加数（イベント体験型）
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (period, route)                     -- 同じ月×経路は1行だけ
);
create trigger trg_funnel_updated before update on funnel_metrics
  for each row execute function set_updated_at();

-- ── content_posts（自分たちのコンテンツ投稿数・手動カウント）──
create table content_posts (
  id         uuid primary key default gen_random_uuid(),
  period     text,                           -- 例: 2026-06（日次なら date を使ってもよい）
  posted_on  date,
  platform   text,                           -- X / Instagram / LINE …（任意）
  count      int not null default 0,
  created_at timestamptz not null default now()
);


-- ============================================================
-- 7. SNS（🔵 Phase 2 予約。テーブルだけ先に確保し、画面は後で作る）
-- ------------------------------------------------------------
-- 今は使わないが、「会員 ⇄ SNS反応」の関係を予約定義しておく。
-- ============================================================

create table sns_posts (
  id         uuid primary key default gen_random_uuid(),
  platform   text,                           -- x / instagram / facebook …
  posted_at  timestamptz,
  excerpt    text,                           -- 投稿の抜粋
  theme      text,
  created_at timestamptz not null default now()
);

create table sns_reactions (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references sns_posts(id) on delete cascade,
  member_id  uuid not null references members(id) on delete cascade,
  type       text,                           -- like / comment / share …
  note       text,
  reacted_at timestamptz,
  created_at timestamptz not null default now()
);


-- ============================================================
-- 8. RLS（行レベルセキュリティ）= ログインした人しか触れないようにする
-- ------------------------------------------------------------
-- 個人情報を扱うため必須。まず全テーブルで RLS を「有効化」し、
-- 次に「認証済みユーザーなら全部 read/write 可」というポリシーを貼る。
-- （未認証は一切アクセス不可になる ＝ 既定で全部拒否されるため）
-- ============================================================

-- 8-1. 全テーブルで RLS を有効化
alter table app_users           enable row level security;
alter table acquisition_owners  enable row level security;
alter table acquisition_sources enable row level security;
alter table event_types         enable row level security;
alter table members             enable row level security;
alter table events              enable row level security;
alter table event_participants  enable row level security;
alter table proposals           enable row level security;
alter table proposal_cofounders enable row level security;
alter table proposal_events     enable row level security;
alter table proposal_docs       enable row level security;
alter table proposal_links      enable row level security;
alter table proposal_updates    enable row level security;
alter table proposal_notes      enable row level security;
alter table funnel_metrics      enable row level security;
alter table content_posts       enable row level security;
alter table sns_posts           enable row level security;
alter table sns_reactions       enable row level security;

-- 8-2. 「認証済みユーザーは全データを read/write 可」ポリシーを各テーブルに付与
--   to authenticated = ログイン済みの人だけ。using/with check (true) = 行の制限なし（全行OK）。
do $$
declare t text;
begin
  foreach t in array array[
    'acquisition_owners','acquisition_sources','event_types',
    'members','events','event_participants',
    'proposals','proposal_cofounders','proposal_events',
    'proposal_docs','proposal_links','proposal_updates','proposal_notes',
    'funnel_metrics','content_posts','sns_posts','sns_reactions'
  ]
  loop
    execute format(
      'create policy "authenticated full access" on %I
         for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- 8-3. app_users（利用者テーブル）はロールで分ける
--   ・全員: 自分含む利用者一覧を read 可（名前表示などに使う）
--   ・作成/更新/削除: Owner だけ（= アプリ内ユーザー管理は Owner 限定）
--   ※ RLS の中で app_users を直接読むと無限ループになるため、
--     SECURITY DEFINER 関数で「今ログイン中の人が owner か」を安全に判定する。
create or replace function is_owner()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from app_users
    where id = auth.uid() and role = 'owner' and is_active
  );
$$;

create policy "app_users readable by authenticated" on app_users
  for select to authenticated using (true);
create policy "app_users insert by owner" on app_users
  for insert to authenticated with check (is_owner());
create policy "app_users update by owner" on app_users
  for update to authenticated using (is_owner()) with check (is_owner());
create policy "app_users delete by owner" on app_users
  for delete to authenticated using (is_owner());


-- ============================================================
-- 9. 新規ログインユーザーの自動プロフィール作成（Supabase 標準パターン）
-- ------------------------------------------------------------
-- Supabase 管理画面から利用者を「Add user」すると auth.users に行ができる。
-- そのタイミングで public.app_users にもプロフィール行を自動で作る。
-- （初期の1人目だけ後から role を owner に手で変えればOK。下の §10 メモ参照）
-- ============================================================
create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_users (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();


-- ============================================================
-- 10. 初期マスタデータ（種別・経路の選択肢を投入）
-- ------------------------------------------------------------
-- 会員/イベントを登録する前に、選択肢になるマスタを入れておく。
-- ============================================================

-- 軸1 担当創業者（user_id は後で app_users ができてから UPDATE で紐付けてもOK）
insert into acquisition_owners (name, sort_order) values
  ('三木',        1),
  ('中澤',        2),  -- = 慎太郎（同一人物）
  ('下山',        3),
  ('公式',        4),
  ('その他・紹介', 5)
on conflict (name) do nothing;

-- 軸3 ファーストタッチ チャネル
insert into acquisition_sources (name, sort_order) values
  ('個人SNS', 1),
  ('公式SNS', 2),
  ('公式LINE', 3),
  ('紹介',    4),
  ('イベント', 5),
  ('その他',  6)
on conflict (name) do nothing;

-- イベント種別マスタ（要件§4-3 の初期マスタ）
insert into event_types (name, default_format, cadence, sort_order) values
  ('ENJIN Lab',     'offline', 'routine', 1),  -- オフライン固定・月1
  ('朝活',           'online',  'routine', 2),  -- オンライン・毎日
  ('オンライン飲み会', 'online',  'routine', 3),  -- 月1
  ('勉強会',         'online',  'adhoc',   4)   -- 突発・オンライン
on conflict (name) do nothing;


-- ============================================================
-- 完了！ 次にやること（このSQLの後の手順）
-- ------------------------------------------------------------
-- (1) Supabase 管理画面 Authentication → Users → "Add user" で
--     三木・中澤・下山の3名を作成（メール＋パスワード）。
--     → §9 のトリガーで app_users に自動でプロフィールが入ります。
-- (2) 自分(オーナー)の行だけ role を owner にする:
--       update app_users set role = 'owner' where email = 'あなたのメール';
-- (3) （任意）担当創業者マスタを app_users と紐付ける:
--       update acquisition_owners ao set user_id = au.id
--       from app_users au where ao.name = au.name;  -- 名前が一致するものだけ
-- (4) Authentication → Providers → Email で「Allow new users to sign up」をOFF
--     （招待制にするため。新規サインアップを無効化）
-- ============================================================

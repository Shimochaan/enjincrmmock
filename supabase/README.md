# ENJIN CRM — Supabase セットアップ手順

要件定義書 v0.4 §9「実装の進め方」の **ステップ2: Supabase でテーブル作成** の作業ガイド。
バックエンド未経験でも進められるよう、ブラウザ操作中心でまとめています。

---

## このフォルダの中身

| ファイル     | 役割                                                           |
| ------------ | -------------------------------------------------------------- |
| `schema.sql` | テーブル・型・RLS（セキュリティ）・初期マスタを一括作成するSQL |
| `README.md`  | この手順書                                                     |

---

## ステップ A：Supabase プロジェクトを作る（ブラウザ）

1. https://supabase.com/ → **Start your project**（GitHubアカウントでサインインが手軽）
2. **New project** を押す
   - **Name**: `enjin-crm`（任意）
   - **Database Password**: 自動生成でOK。**必ずメモ/パスワード管理に保存 **（後で使う）
   - **Region**: **Northeast Asia (Tokyo)** を選ぶ
     （個人情報を国内保管する方針。要件§10-9）
   - Plan: Free でOK
3. 「Setting up project…」が数分。完了まで待つ。

---

## ステップ B：スキーマSQLを実行する（テーブル作成）

1. 左メニュー **SQL Editor** → **New query**
2. このフォルダの `schema.sql` の中身を**全部コピー**して貼り付け
3. 右下 **Run**（または ⌘+Enter）
4. `Success. No rows returned` と出れば成功
5. 左メニュー **Table Editor** を開くと、`members` `events` … が並んでいるはず

> ⚠️ もう一度Runするとエラーになります（型やテーブルが既にあるため）。
> 作り直したいときは `schema.sql` 冒頭の「リセット用ブロック」のコメントを外して先にRun。

---

## ステップ C：利用者3名を作る（認証）

1. 左メニュー **Authentication** → **Users** → **Add user** → **Create new user**
2. メール＋パスワードで **三木・中澤・下山** の3名を作成
   - → `schema.sql` のトリガーで `app_users` に自動でプロフィール行が入る
3. **自分(オーナー)を owner にする**。SQL Editor で実行:
   ```sql
   update app_users set role = 'owner' where email = 'あなたのメール';
   ```
4. （任意）担当創業者マスタを利用者と紐付け:
   ```sql
   update acquisition_owners ao set user_id = au.id
   from app_users au where ao.name = au.name;
   ```

---

## ステップ D：サインアップを無効化（招待制にする）

1. **Authentication** → **Providers** → **Email**
2. **Allow new users to sign up** を **OFF**
   （一般の新規登録を止め、管理者が Add user で発行する運用にする。要件§4-0）

---

## 次のステップ（今日の範囲外・メモ）

要件§9 の続き:

- **3. 既存スプレッドシートのデータ投入**（会員・イベント・参加実績）
- **4. フロント**: 既存 mock を Next.js に移植し、Supabase からデータを読む
  - 接続情報は Supabase の **Project Settings → API** にある
    `Project URL` と `anon public key` を使う（フロントのenvに入れる）
- 書き込み機能 → ダッシュボード集計、の順

---

## メモ：設計上の判断（要確認）

- **軸1 担当創業者** は要件で「FK(users)」とされていたが、`公式` `その他・紹介` は
  ログインユーザーではないため、独立した `acquisition_owners` マスタにした。
  創業者本人は `user_id` で `app_users` に紐付け、表記ゆれ防止の狙いは維持。
- `members.id` などの主キーは mock の `"m01"` 形式ではなく **UUID 自動採番** にした。
  移行時のキー照合は要件§6どおり email / event_title で行うため問題なし。

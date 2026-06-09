// ============================================================
// Supabase 接続クライアント（このアプリとDBをつなぐ入り口）
// ------------------------------------------------------------
// 【役割】
//   Supabase(クラウド上のDB)に「どのプロジェクトへ・どの鍵で」つなぐかを
//   1か所にまとめたファイル。他の画面はここで作った window.sb を使って
//   DBを読み書きする。
//
// 【2つの値をどこから取るか】
//   Supabase管理画面 → 左下 Project Settings → 「API」を開くと:
//     ・Project URL      … 下の SUPABASE_URL に貼る
//     ・anon public key   … 下の SUPABASE_ANON_KEY に貼る
//   ※ anon key は「公開してよい鍵」。守りは RLS(行レベルセキュリティ)が担うので、
//     フロントのコードに書いて公開リポジトリに置いても問題ない設計になっている。
//     （本当に秘密の service_role キーは絶対にここに貼らないこと）
// ============================================================

// ↓↓↓ ここ2行を、自分のプロジェクトの値に書き換える ↓↓↓
const SUPABASE_URL      = "https://irzaacozhsvctqfhzcbd.supabase.co"; // 例: https://abcd1234.supabase.co
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyemFhY296aHN2Y3RxZmh6Y2JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NTAwNTYsImV4cCI6MjA5NjUyNjA1Nn0.S-1kZRMfczA6ZrIfE4e91qmqvPx9rm7o-Ucd44jqNWA";                 // 例: eyJhbGciOiJIUzI1NiI... (長い文字列)
// ↑↑↑ ここ2行を書き換える ↑↑↑

// まだ書き換えていない（プレースホルダのまま）かどうかの判定。
// 画面側で「設定がまだですよ」という案内を出すために使う。
const SUPABASE_CONFIGURED =
  !SUPABASE_URL.includes("YOUR-PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR-ANON");

// supabase-js（CDNで読み込んだライブラリ）から接続クライアントを1個作る。
// window.supabase は index.html で読み込んだ supabase-js が用意するグローバル。
// 設定が未入力のときに createClient を呼ぶとエラーになるので、その時は null にしておく。
const sb = SUPABASE_CONFIGURED
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// 他のファイル（デモ画面）からも使えるよう window に載せておく。
Object.assign(window, { sb, SUPABASE_CONFIGURED });

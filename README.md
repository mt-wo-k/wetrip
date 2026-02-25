# WETRIP

## ページ構成

- ホーム（/）
  - 旅行のパネルを表示
  - 押下すると旅行詳細ページへ遷移
- 旅行詳細（/trip/[id]）
  - 旅行の詳細情報を表示
    - 旅行先
    - 日程
    - 移動手段

## API

### GET `/api/trips`

- 返却: 旅行一覧

### POST `/api/trips`

旅行先追加API

- リクエスト:

```json
{
  "destination": "京都・奈良",
  "startDate": "2026-02-28",
  "endDate": "2026-03-02",
  "transportation": "車"
}
```

### GET `/api/trips/:id`

旅行先詳細取得API

- 返却: 旅行1件

### GET `/api/trips/:id/schedules`

旅行の日程一覧取得API

- 返却: 旅行日程一覧

### POST `/api/trips/:id/schedules`

旅行の日程追加API

- リクエスト:

```json
{
  "dayIndex": 1,
  "startTime": "09:00",
  "endTime": "10:30",
  "name": "集合",
  "detail": "○○駅東口",
  "reservationStatus": "pending"
}
```

### PATCH `/api/trips/:id/schedules/:scheduleId/reservation`

予約状態更新API（予約済に変更）

- リクエスト:

```json
{
  "reservationStatus": "reserved"
}
```

## AWS 構築手順（Console）

1. DynamoDBテーブルを作成

- テーブル名例: `wetrip-trips-dev`
- パーティションキー: `id` (String)
- キャパシティモード: `On-demand`
- GSIを作成
  - インデックス名例: `listPartitionKey-index`
  - パーティションキー: `listPartitionKey` (String)

1. DynamoDBテーブルを作成（日程）

- テーブル名例: `wetrip-trip-schedules-dev`
- パーティションキー: `tripId` (String)
- ソートキー: `scheduleId` (String)
- キャパシティモード: `On-demand`

1. IAMユーザーを作成（アプリ専用）

- `dynamodb:GetItem`, `dynamodb:PutItem` のみ許可
- リソースは `wetrip-trips-*` に絞る

1. AWS Budgetsでアラートを設定（$1, $5）

## 環境変数

`.env.local` に以下を設定します（Vercelにも同名で設定）。

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `DYNAMODB_TRIPS_TABLE`
- `DYNAMODB_TRIPS_LIST_INDEX`
- `DYNAMODB_TRIP_SCHEDULES_TABLE`

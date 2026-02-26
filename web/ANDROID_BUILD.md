# Android アプリ化の手順

## 前提条件

- Node.js 18以上
- Android Studio (最新版)
- JDK 17

## セットアップ

```bash
cd web

# 依存関係インストール
npm install

# Android プラットフォーム追加
npm install @capacitor/android
npx cap add android
```

## ビルド & 同期

```bash
# Webアプリをビルドしてandroidに同期
npm run build:android
```

## Android Studio で開く

```bash
npm run open:android
```

Android Studio が開いたら：

1. Gradleの同期が完了するまで待機
2. エミュレーターまたは実機を選択
3. **Run** ボタンで実行

## APK の生成

Android Studio で:
1. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. `android/app/build/outputs/apk/debug/app-debug.apk` にAPKが生成される

## リリース版 (署名付きAPK)

1. **Build** → **Generate Signed Bundle / APK**
2. キーストアを作成 or 選択
3. リリース設定でビルド

## アプリID / アプリ名の変更

`capacitor.config.ts` を編集:
```ts
appId: "com.yourcompany.yourapp",   // パッケージ名
appName: "アプリ名",
```

変更後:
```bash
npm run build:android
```

## テスト方法

### Webブラウザでテスト (推奨: まずこちらで動作確認)
```bash
npm run dev
# http://localhost:3000 をブラウザで開く
# Chrome DevToolsのモバイルエミュレーションで確認
```

### PWAとしてテスト
1. スマホのChromeで開く
2. 「ホーム画面に追加」でインストール
3. ネイティブアプリのように動作

### Androidアプリとしてテスト
```bash
npm run build:android
npm run open:android
# Android Studio でエミュレーターまたは実機に実行
```

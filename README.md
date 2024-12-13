# 2024-2 capstone_project

24-2 중앙대학교 캡스톤 디자인 프로젝트.

# EyeToAI 실행 가이드

## 프로젝트 개요

EyeToAI는 시각적 데이터를 인공지능과 결합하여 사용자에게 새로운 경험을 제공하는 캡스톤 디자인 프로젝트입니다.
이 프로젝트는 React Native와 Firebase를 활용하여 Android와 iOS에서 작동하는 것을 목표로 하였으나, 현재 Android 우선으로 개발되었습니다.

## 주요 기능

- 사용자 인증 (Firebase Auth를 이용한 로그인 및 회원가입)
- FCM을 활용한 푸시 알림
- AI 기반 데이터 분석
- 직관적인 사용자 인터페이스
- Metro 서버 기반의 빠른 개발 환경 제공

## 1. 프로젝트 받기

```bash
git clone [repository-url]
cd eyetoai
```

## 2. 패키지 설치

```bash
npm install
# 또는
yarn install
```

## 3. Metro 서버 시작 (필수!)

```bash
# 터미널 1에서
npx react-native start
# 또는
yarn start
```

## 4. 앱 실행 (새 터미널에서)

```bash
# Android (터미널 2에서)
npx react-native run-android
# 또는
yarn android

# iOS (Mac only)
npx react-native run-ios
# 또는
yarn ios
```

## 환경 변수 설정

Firebase 및 기타 민감한 정보는 `.env` 파일로 관리됩니다.

### 1. `.env` 파일 생성

프로젝트 루트에 `.env` 파일을 생성하고 다음 정보를 추가하세요:

```env
FIREBASE_API_KEY=<Your_Firebase_API_Key>
FIREBASE_APP_ID=<Your_Firebase_App_ID>
FIREBASE_PROJECT_ID=<Your_Firebase_Project_ID>
FIREBASE_STORAGE_BUCKET=<Your_Firebase_Storage_Bucket>
```

### 2. `.env` 파일 예제

다른 협업자가 참고할 수 있도록 `.env.example` 파일을 제공합니다:

```env
FIREBASE_API_KEY=your-api-key
FIREBASE_APP_ID=your-app-id
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-storage-bucket
```

`.env.example` 파일은 Git에 포함됩니다.

## 문제 해결

### Metro 서버 문제 시

```bash
# Metro 캐시 초기화 후 재시작
npx react-native start --reset-cache
```

### 빌드 문제 시

```bash
# Android 빌드 초기화
cd android
./gradlew clean
cd ..
```

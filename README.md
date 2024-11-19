# capstone_project

24-2 중앙대학교 캡스톤 디자인 프로젝트. 레포 이름은 추후 수정 예정
for subcribe test

# EyeToAI 실행 가이드

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

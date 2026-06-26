# 레몬이를 이겨라!

초등학교 2학년이 구구단을 재미있게 연습할 수 있도록 만든 정적 웹 게임입니다. 레몬이와 대결하듯 제한 시간 안에 구구단 문제를 풀며, 연습 모드와 도전 모드를 제공합니다.

## 주요 기능

- 2단부터 9단까지의 구구단 문제 출제
- `N x 1` 제외, 곱하는 수는 2부터 9까지 사용
- 난이도 선택
  - 슈퍼 레몬이: 문제당 3초
  - 평범 레몬이: 문제당 5초
  - 허약 레몬이: 문제당 7초
- 연습 모드
  - 원하는 단을 하나 또는 여러 개 선택
  - 틀린 문제만 다시 풀기 지원
- 도전 모드
  - 30문제를 연속으로 맞히면 성공
  - 오답 또는 시간 초과 시 즉시 실패
- 정답 포함 3지선다 선택 방식
- 모바일, 태블릿, 데스크톱 반응형 UI

## 기술 구성

별도 빌드 도구 없이 동작하는 정적 웹앱입니다.

- HTML
- CSS
- JavaScript ES Modules
- GitHub Pages 배포 가능

## 파일 구조

```text
.
├── index.html
├── styles.css
├── assets/
│   ├── apple-touch-icon.png
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── lemon-icon.svg
│   ├── lemoni-character.png
│   └── lemoni-character-small.png
└── src/
    ├── game.js
    ├── main.js
    ├── state.js
    ├── timer.js
    └── ui.js
```

## 로컬 실행

루트 디렉터리에서 정적 서버를 실행합니다.

```bash
python3 -m http.server 4173
```

브라우저에서 아래 주소를 엽니다.

```text
http://127.0.0.1:4173/
```

## GitHub Pages 배포

빌드 과정이 필요 없으므로 GitHub Pages에서 루트 디렉터리를 바로 배포하면 됩니다.

권장 설정:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/root`

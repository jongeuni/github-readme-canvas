# 컴포넌트 기여하기

_[English](CONTRIBUTING.md)로 보기._

이 프로젝트의 라이브러리(뱃지, 아이콘, 카드, 링크 등)는 사용자들이 함께 만들어가는 것입니다. 이 문서는 라이브러리에 새로운 걸 추가하는 두 가지 방법과, 그 전에 먼저 알아두면 좋은 개념 하나 — **Component**와 **Preset**의 차이 — 를 설명합니다.

## 가장 쉬운 방법: 앱 안의 마법사 사용하기

1. 앱에서 라이브러리 패널을 열고 **+ Add Component**를 클릭합니다.
2. 실제로 작동하는 예시 URL을 붙여넣습니다 (shields.io 뱃지 URL, 아이콘 URL 등 이미지를 렌더링하는 아무 URL이나 가능). `?` 뒤에 오는 값들 — 예를 들어 `?style=flat&color=blue` — 은 자동으로 편집 가능한 필드로 바뀝니다.
3. 이름, 카테고리, 필드 이름을 입력하고 **Add**를 클릭합니다.
4. GitHub 계정을 연결하면, 앱이 자동으로 라벨과 함께 Pull Request를 열어줍니다.

코드 작성이나 저장소 포크가 필요 없습니다 — 대부분의 컴포넌트(교체 가능한 값 몇 개를 가진 이미지 URL인 뱃지/아이콘/링크)는 이 방법으로 충분합니다.

## Component와 Preset — 뭐가 다른가요?

라이브러리에는 서로 다른 두 종류가 함께 들어있는데, 이 둘을 헷갈리는 게 가장 흔한 혼란 포인트예요.

**Component**는 README 요소의 독립된 *종류*예요. 자기만의 설정값, 자기만의 모양, 자기만의 마크다운 출력 방식을 가져요. 예: "Language Badge", "GitHub Stats card", "Divider", "Tech Icon".

**Preset**은 이미 있는 Component의 *변형본*이에요 — 설정 구조도, 렌더링 방식도, 마크다운 변환 로직도 똑같고, 데이터(값)만 달라요. 예를 들어 "C++"와 "Python"은 서로 다른 두 개의 Component가 아니에요 — 둘 다 같은 "Language Badge" Component의 **preset**이에요. 하나를 고르면 그냥 라벨/색상/링크만 바뀔 뿐, 어떻게 만들어지고 그려지는지는 전혀 안 바뀌어요.

간단한 기준:

- "똑같은 종류인데 텍스트/색상/링크만 다른 것"을 추가하고 싶다 (새로운 프로그래밍 언어, 새로운 툴 로고, 새로운 소셜 플랫폼)? → 거의 항상 이미 존재하는 Component의 새로운 **Preset**이에요.
- 설정 자체가 다르거나, 모양이 완전히 다르거나, 아예 다른 용도로 쓰이는 걸 추가하고 싶다? → **새로운 Component**예요.

이게 PR을 열 때 중요한 이유: preset 추가는 데이터 몇 줄짜리의 작고 안전한 변경이고, 새 Component 추가는 보통 코드 작성이 필요해요(아래 참고). 내가 만들려는 게 둘 중 뭔지 헷갈리면, 이슈나 초안(draft) PR을 열고 물어봐 주세요 — 같이 정리해드릴게요.

## 직접 Pull Request 열기

커뮤니티 컴포넌트는 `src/data/community-components/` 아래에 파일 하나당 하나씩 들어있어요 — 그래서 PR을 열면 본인이 새로 만든 파일 하나만 건드리게 되고, 다른 사람의 PR과 절대 충돌하지 않아요.

1. 저장소를 포크합니다.
2. `src/data/community-components/<본인id>.json` 파일을 새로 추가합니다 (id는 소문자, 하이픈으로 구분 — 예: `social-mastodon.json`).
3. 아래 형식을 사용합니다 (실제 예시 파일 하나를 참고해서 만든 예시예요):

```json
{
  "id": "social-mastodon",
  "type": "url-component",
  "name": "Mastodon",
  "description": "Link to your Mastodon profile. Not GitHub-specific.",
  "category": "Social",
  "tags": ["Social", "Badge"],
  "defaultSettings": { "username": "yourname", "link": "" },
  "meta": {
    "urlTemplate": "https://img.shields.io/badge/Mastodon-{username}-6364FF?logo=mastodon&logoColor=white",
    "linkable": true,
    "fields": [{ "key": "username", "label": "Username", "type": "text" }]
  }
}
```

- **`urlTemplate`** — 이미지 URL이고, 사용자가 편집할 수 있어야 하는 부분마다 `{필드이름}`을 넣어요.
- **`fields`** — 템플릿에서 쓴 `{필드이름}`마다 하나씩 항목을 넣어요. `type`은 `"text"`, `"color"`, `"select"`, `"number"`(슬라이더 — `min`/`max`/`step` 추가 가능), `"checkbox-group"`(여러 체크박스를 골라 하나의 필드에 콤마로 합쳐서 넣음 — `hide=issues,prs`처럼) 중 하나이고, `"number"`를 뺀 나머지는 `options: [{ value, label }]` 배열이 필요해요.
- **`linkable: true`**를 설정하면 뱃지/아이콘을 클릭했을 때 이동할 "Link" 설정이 추가돼요 — `defaultSettings`에 `"link": ""`도 같이 넣어주세요. 링크를 사용자가 직접 입력하는 게 아니라 다른 필드값으로부터 계산해야 한다면(예: username으로 만들어지는 프로필 링크) **`linkTemplate`**을 대신 쓰세요 — `urlTemplate`과 같은 `{필드이름}` 문법이고, 사용자에게는 읽기 전용 계산값으로 보여져요.
- **`category`**는 라이브러리에서 어느 카테고리 칩 아래 들어갈지 정해요 (`Languages`, `Frameworks`, `Databases`, `Tools`, `Stats`, `Social`, `Decorations`, 또는 새로운 카테고리도 가능해요).
- **`presets`** — 선택 사항. 만들려는 게 사실 완전히 같은 컴포넌트의 변형 여러 개(라벨/색상/링크만 다르고 나머지는 전부 동일 — 위 Component vs Preset 기준 참고)라면, 파일을 여러 개 만들지 말고 이 JSON 파일 안에 바로 `presets` 배열을 추가하세요:
  ```json
  "presets": [
    { "id": "social-mastodon-fosstodon", "name": "Fosstodon", "settings": { "username": "yourname" } }
  ]
  ```
  이게 메커니즘의 전부예요 — 코드도, 별도 파일도 필요 없이 데이터만 추가하면 됩니다. `id`는 서로 겹치지 않아야 하고, 한번 배포되면 이후 다른 용도로 재사용하면 안 돼요(저장된 문서나 즐겨찾기가 이 id를 직접 참조하기 때문).

4. Pull Request를 엽니다. 머지되고 나면 다른 파일은 하나도 안 건드려도 모두의 라이브러리에 바로 나타나요.

## 기존 Component에 Preset 추가하기

새로 추가하는 뱃지/아이콘/링크 대부분은 새 Component가 아니라 이 경우예요 — 위 판단 기준을 참고하세요.

- **Component가 `.json` 파일이라면** (기본 제공 뱃지들 — `lang-badge.json`, `social-github.json` 등을 포함해 대부분이 여기 해당) — 그 파일을 열어서 `presets` 배열에 항목 하나를 추가하세요 (배열이 아직 없다면 새로 만들면 됩니다). 다른 건 전혀 건드릴 필요 없어요.
- **Component가 코드 디렉터리라면** (예: `tech-icon/` — 크기 슬라이더처럼 순수 URL 템플릿으로는 표현 안 되는 UI가 필요해서 코드로 만들어진 경우) — 그 디렉터리의 `presets.ts`를 열어서 해당 배열에 항목 하나를 추가하세요. `component.ts`는 건드릴 필요 없어요.

## 완전히 새로운 Component 추가하기 (코드 필요)

"URL 템플릿에 필드 몇 개 채우기"로는 아예 표현이 안 되는 경우에만 필요해요 — 설정 UI나 렌더링 로직 자체가 완전히 다른 경우지, 단순히 새 preset을 추가하는 게 아니에요. `src/data/community-components/<본인type>/` 아래에 자기만의 디렉터리가 필요해요 (예: `tech-icon/` — 디렉터리 이름은 그 컴포넌트의 `type` 문자열과 같아요). 필요한 파일은 전부 그 디렉터리 하나 안에 있고, 그 밖의 파일은 아무것도 건드릴 필요가 없어요. `src/data/community-components/tech-icon/`을 열어서 패턴을 참고하세요:

- `types.ts` — 설정값 구조 (`<Name>Settings` 인터페이스와, 상수들)
- `Preview.tsx` — `Preview`를 export, 캔버스와 라이브러리 카드에서 어떻게 그려지는지
- `SettingsForm.tsx` — `SettingsForm`을 export, 설정 패널 UI
- `presets.ts` — 이 컴포넌트가 이름 붙은 변형(preset)을 가질 때만 필요해요; 변형 그룹마다 `PresetDefinition[]` 배열 하나씩 export
- `component.ts` — 위 파일들을 전부 엮어서 `export const module: ComponentModule` 하나로 만들어요 — 렌더러인 `definition`(`type`, `layout`, `Preview`, `SettingsForm`, `toMarkdown`)과, 이 컴포넌트가 만드는 라이브러리 카드(들)인 `entries`(preset이 있다면 `presets: yourPresetsArray`도 함께)

이게 끝이에요 — `src/registry/index.ts`가 빌드 시점에 `community-components/*/component.ts`를 전부 자동으로 찾아 등록하기 때문에, 따로 등록하는 단계가 없어요. JSON 하나로 끝나는 컴포넌트보다는 큰 PR이니, 시작하기 전에 이슈를 먼저 열어주시면 범위 잡는 걸 같이 도와드릴게요.

# community-components/ 가이드

이 프로젝트의 모든 "라이브러리에서 고를 수 있는" README 컴포넌트(뱃지, 카드, 링크 ...)는 이 디렉터리 아래에 있습니다. `src/registry/index.ts`는 이 디렉터리를 빌드 시점에 자동으로 스캔해서 라이브러리를 구성하므로, **여기 파일/디렉터리를 추가하는 것 외에 다른 파일을 손댈 필요가 없습니다.**

(순수 마크다운을 직접 생성하는 `heading`/`divider`/`code-block`/`table`은 여기 없습니다 — URL 이미지가 아니라 서비스/URL 없이도 동작하는 에디터 자체의 기본 요소라서 `src/components/widgets/`에 따로 있습니다. 헷갈리면 맨 아래 표를 보세요.)

두 가지 형태가 있고, **압도적으로 대부분의 경우 첫 번째만으로 충분합니다:**

- **`<id>.json` 한 파일** — shields.io 같은 서비스의 URL에 값 몇 개만 채워 넣으면 끝나는 컴포넌트. 프리셋(변형)이 있어도 코드 없이 이 파일 안에서 다 됩니다. `lang-badge.json`, `social-github.json`, `stats-github.json`을 포함해 이 디렉터리의 거의 전부가 여기 해당합니다.
- **`<type>/` 디렉터리** — 순수 URL 템플릿으로는 표현이 안 되는 커스텀 UI/렌더링이 정말로 필요할 때만 (예: `tech-icon/`은 크기 슬라이더가 필요해서 코드로 되어 있습니다).

아래는 실제로 겪게 되는 상황별 레시피입니다.

---

## 1. 새 컴포넌트 추가하기

### 대부분의 경우 — JSON 파일 하나

`src/data/community-components/<id>.json` 파일 하나를 만드세요:

```json
{
  "id": "social-mastodon",
  "type": "url-component",
  "name": "Mastodon",
  "description": "Link to your Mastodon profile.",
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

- `urlTemplate`의 `{fieldName}` 부분이 `fields`에 정의한 값으로 채워집니다.
- `fields[].type` — `"text"` / `"color"` / `"select"` / `"number"`(슬라이더, `min`/`max`/`step`) / `"checkbox-group"`(체크박스 여러 개를 콤마로 합쳐 한 필드에 — `hide=issues,prs`처럼). `"number"`를 뺀 나머지는 `options: [{ value, label }]` 필요.
- `linkable: true` — "Link" 입력창 추가, `defaultSettings`에 `"link": ""`도 필요. 링크가 사용자 입력이 아니라 다른 필드로 계산되어야 한다면(예: username으로 만든 프로필 URL) `linkable` 대신 **`linkTemplate`**을 쓰세요 — `urlTemplate`과 같은 문법이고, 읽기 전용 계산값으로 보여집니다.

파일을 저장하는 순간 끝입니다.

### 순수 URL 템플릿으로 안 되는 경우만 — 디렉터리

색상 스와치가 아니라 정말 새로운 렌더링 로직/입력 UI가 필요할 때만(예: `tech-icon/`의 슬라이더). `src/data/community-components/<type>/`를 만들고:

```
community-components/
└── my-widget/
    ├── types.ts         # 설정값 타입 (MyWidgetSettings 등)
    ├── Preview.tsx       # export function Preview(...)
    ├── SettingsForm.tsx   # export function SettingsForm(...)
    └── component.ts       # 위 셋을 엮어서 module로 export
```

`component.ts`는 이런 모양입니다 (실제 예시: [`tech-icon/component.ts`](tech-icon/component.ts) 참고):

```ts
import type { ComponentModule, ComponentTypeDefinition } from '../../../types/component';
import type { LibraryEntry } from '../../../types/library';
import type { MyWidgetSettings } from './types';
import { Preview } from './Preview';
import { SettingsForm } from './SettingsForm';

const definition: ComponentTypeDefinition<MyWidgetSettings> = {
  type: 'my-widget',        // 디렉터리 이름과 동일하게
  layout: 'inline',          // 옆으로 나란히면 'inline', 한 줄 전체 차지하면 'block'
  Preview,
  SettingsForm,
  toMarkdown: (s) => `...`,  // 이 컴포넌트가 실제로 내보낼 마크다운 문자열
};

const entries: LibraryEntry<MyWidgetSettings>[] = [
  {
    id: 'my-widget',
    type: 'my-widget',
    name: 'My Widget',
    description: '...',
    category: 'Decorations',
    tags: ['Decorations'],
    defaultSettings: { /* ... */ },
  },
];

export const module: ComponentModule<MyWidgetSettings> = { definition, entries };
```

저장하면 끝 — `registry/index.ts`가 `community-components/*/component.ts`를 전부 자동으로 찾아 등록합니다.

---

## 2. 프리셋이 있는 컴포넌트 새로 추가하기

"C++/Python/Java..."처럼 **설정 구조와 렌더링은 완전히 같고 데이터(라벨/색상/링크 등)만 다른 변형**이 여러 개 있는 컴포넌트는, 변형마다 새 Component를 만들지 말고 하나의 Component + 여러 Preset으로 만듭니다.

**JSON 컴포넌트라면** (대부분 이 경우) — 같은 파일에 `presets` 배열만 추가하면 끝입니다. 코드도, 새 파일도 필요 없습니다:

```json
{
  "id": "my-badge",
  "type": "url-component",
  "name": "My Badge",
  "defaultSettings": { "label": "A", "color": "blue", "link": "https://a.example", "style": "flat" },
  "meta": { "urlTemplate": "...", "fields": [...] },
  "presetsLabel": "variants",
  "presets": [
    { "id": "my-badge-a", "name": "A", "settings": { "label": "A", "color": "blue", "link": "https://a.example" } },
    { "id": "my-badge-b", "name": "B", "settings": { "label": "B", "color": "green", "link": "https://b.example" } }
  ]
}
```

실제 예시: [`lang-badge.json`](lang-badge.json) — C++/Python/TypeScript/Java/Go/Rust 6개가 전부 이 방식으로 `presets` 배열 안에 들어있습니다.

**코드 디렉터리라면** (드묾 — 위 "디렉터리" 방식으로 만든 경우) `presets.ts` 파일 하나를 추가하고 `component.ts`의 `entries`에서 `presets: yourPresets`로 연결합니다. 실제 예시: [`tech-icon/presets.ts`](tech-icon/presets.ts).

결과: 라이브러리에는 "My Badge" 카드 하나만 뜨고, 그 안에서 A/B 중 고르는 프리셋 선택기가 나타납니다.

---

## 3. 기존 컴포넌트에 프리셋만 추가하기

가장 자주 있을 일입니다 — 예를 들어 Language Badge에 "Kotlin"을 추가하고 싶은 경우.

**JSON 컴포넌트라면** — `lang-badge.json`을 열어서 `presets` 배열에 항목 하나만 추가하면 끝입니다:

```json
{ "id": "lang-kotlin", "name": "Kotlin", "settings": { "label": "Kotlin", "color": "purple", "link": "https://kotlinlang.org" } }
```

**코드 디렉터리라면** — `component.ts`는 건드릴 필요 없이, 그 디렉터리의 `presets.ts`만 열어서 배열에 항목 하나를 추가하면 됩니다.

두 경우 모두:

- `id`는 다른 프리셋과 겹치지 않는 고유 값이어야 합니다 (한번 배포되면 즐겨찾기/저장된 문서가 이 id를 참조하므로 이후에는 바꾸지 마세요).
- `settings`는 그 컴포넌트의 `defaultSettings` 위에 덮어씌워지는 값만 적으면 됩니다 (전체를 다시 쓸 필요 없음).
- 이 배열 하나가 라이브러리 카드의 프리셋 목록과, 이미 캔버스에 놓인 위젯의 "Preset" 선택기 양쪽 모두의 유일한 출처입니다 — 두 군데를 따로 관리할 필요가 없습니다.

## 처음엔 프리셋 없이 만들고, 나중에 프리셋을 추가하고 싶다면?

**아무 문제 없습니다 — 코드/디렉터리로 옮길 필요가 전혀 없습니다.** JSON 컴포넌트는 `presets` 필드가 있고 없고의 차이일 뿐, 다른 구조가 아닙니다. 1번처럼 `presets` 없이 JSON 하나만 만들어 두었다가, 나중에 변형이 필요해지면 그 파일에 위 2번처럼 `presets` 배열만 추가하면 됩니다. 실제로 이 저장소의 badge/social/stats 컴포넌트들도 전부 이 방식(순수 JSON, 필요한 경우 `presets` 포함)으로 되어 있습니다.

---

## 어떤 경우가 "Component"이고 어떤 경우가 "Preset"인가?

- 텍스트/색상/링크 같은 **데이터만 다르고** 설정 구조·렌더링·마크다운 로직이 완전히 같다 → 기존 Component의 새 **Preset** (위 3번)
- 설정 구조가 다르거나, 렌더링 방식이 다르거나, 애초에 목적이 다르다 → 새 **Component** (위 1번 또는 2번)

헷갈리면 가장 가까운 기존 파일을 그대로 따라 하는 게 제일 빠릅니다 — `lang-badge.json`이 JSON+프리셋 예시, `tech-icon/`이 코드 디렉터리 예시입니다.

# 컴포넌트 기여하기

_[English](CONTRIBUTING.md)로 보기._

이 프로젝트의 라이브러리(뱃지, 아이콘, 카드, 링크 등)는 사용자들이 함께 만들어가는 것입니다. 이 문서는 그 자체로 완결되도록 썼습니다 — 이 코드베이스를 한 번도 본 적이 없어도, 실제로 배포된 라이브러리에서 그대로 가져온 예시들과 함께, 컴포넌트를 추가하는 데 필요한 내용이 전부 여기 들어있습니다.

## 가장 쉬운 방법: 앱 안의 마법사 사용하기

1. 앱에서 라이브러리 패널을 열고 **+ Add Component**를 클릭합니다.
2. 실제로 작동하는 예시 URL을 붙여넣습니다 (shields.io 뱃지 URL, 아이콘 URL 등 이미지를 렌더링하는 아무 URL이나 가능). `?` 뒤에 오는 값들 — 예를 들어 `?style=flat&color=blue` — 은 자동으로 편집 가능한 필드로 바뀝니다.
3. 이름, 카테고리, 필드 이름을 입력하고 **Add**를 클릭합니다.
4. GitHub 계정을 연결하면, 앱이 자동으로 라벨과 함께 Pull Request를 열어줍니다.

코드 작성이나 저장소 포크가 필요 없습니다 — 대부분의 컴포넌트(교체 가능한 값 몇 개를 가진 이미지 URL인 뱃지/아이콘/링크)는 이 방법으로 충분합니다.

**마법사로 안 되는 것들** — 아래 중 하나라도 필요하다면, [직접 Pull Request 열기](#직접-pull-request-열기)로 건너뛰어서 JSON을 직접 손으로 편집하세요:

- **Preset**(아래 설명) — 마법사는 항상 변형(variant) 없는 컴포넌트 하나만 만듭니다. Preset을 추가하려면 마법사가 생성한 JSON을 나중에 직접 수정하거나, 처음부터 손으로 작성해야 합니다.
- `text`, `color`, `select` 외의 필드 타입 — `number` 슬라이더, `checkbox-group`, `combo` 박스(전부 아래에서 설명)는 마법사 2단계에서 선택할 수 없습니다.
- `defaultAlign`, `statusReason`, `meta.altTemplate`, `meta.linkTemplate`, 또는 태그 2개 이상 — 이 중 마법사에 입력창이 있는 건 하나도 없습니다. 전부 비워지거나 기본값으로 남습니다.
- "이미지 URL에 필드 몇 개"로 아예 표현이 안 되는, 완전히 새로운 렌더링 방식 — [완전히 새로운 Component 추가하기](#완전히-새로운-component-추가하기-코드-필요)를 참고하세요.

## Component와 Preset — 뭐가 다른가요?

라이브러리에는 서로 다른 두 종류가 함께 들어있는데, 이 둘을 헷갈리는 게 가장 흔한 혼란 포인트예요.

**Component**는 README 요소의 독립된 *종류*예요. 자기만의 설정값, 자기만의 모양, 자기만의 마크다운 출력 방식을 가져요. 예: "Language Badge", "GitHub Stats card", "Divider", "Tech Icon".

**Preset**은 이미 있는 Component의 *변형본*이에요 — 설정 구조도, 렌더링 방식도, 마크다운 변환 로직도 똑같고, 데이터(값)만 달라요. 예를 들어 "C++"와 "Python"은 서로 다른 두 개의 Component가 아니에요 — 둘 다 같은 "Language Badge" Component의 **preset**이에요. 하나를 고르면 그냥 라벨/색상/링크만 바뀔 뿐, 어떻게 만들어지고 그려지는지는 전혀 안 바뀌어요.

간단한 기준:

- "똑같은 종류인데 텍스트/색상/링크만 다른 것"을 추가하고 싶다 (새로운 프로그래밍 언어, 새로운 툴 로고, 새로운 소셜 플랫폼)? → 거의 항상 이미 존재하는 Component의 새로운 **Preset**이에요.
- 설정 자체가 다르거나, 모양이 완전히 다르거나, 아예 다른 용도로 쓰이는 걸 추가하고 싶다? → **새로운 Component**예요.

이게 PR을 열 때 중요한 이유: preset 추가는 데이터 몇 줄짜리의 작고 안전한 변경이고, 새 Component 추가는 보통 코드 작성이 필요해요(아래 참고). 내가 만들려는 게 둘 중 뭔지 헷갈리면, 이슈나 초안(draft) PR을 열고 물어봐 주세요 — 같이 정리해드릴게요.

## 설정창의 드롭다운 vs. Preset — 어느 쪽을 써야 하나요?

위의 "Component vs Preset"과는 다른, 별개의 질문인데 이것도 사람들이 자주 헷갈려요: 필드 하나도 드롭다운이 될 수 있거든요 (`meta.fields` 안의 `"type": "select"` — 아래에서 전체 설명). 그럼 "몇 개 중 하나 고르기"를 언제는 `select` 필드로, 언제는 `presets` 배열로 만들어야 할까요?

둘 다 결과적으로 "이름 붙은 옵션 몇 개 중 하나 고르기" UI가 되긴 하지만, 구조적으로는 완전히 달라요:

|  | `select` **필드** | **Preset** |
|---|---|---|
| 어디에 있나 | 한 Component 안의 `meta.fields`에 있는 항목 하나 | Component의 최상위 `presets` 배열 |
| 어디서 고르나 | 캔버스에 **이미 배치된** 그 위젯 자신의 Settings 패널 안에서 | 배치하기 **전** 라이브러리에서 (또는 이미 배치된 위젯의 Settings에 있는 "Preset" 드롭다운에서) |
| 자기만의 라이브러리 카드가 생기거나 검색에 걸리나? | 아니요 — 브라우징/검색에는 안 걸리고, 그 컴포넌트의 다른 설정값들과 똑같이 그냥 컨트롤 하나일 뿐이에요 | 예 — preset마다 독립적으로 검색/즐겨찾기가 가능하고, 개수가 적으면 각각 자기만의 카드로도 보여요 |
| 자기만의 `id`/`name`이 있나? | 아니요 — `value`/`label` 짝만 있어요 | 예 — Component와 똑같이 전역적으로 유일한 `id`와 `name`이 있어요 |

**판단 기준:** 어떤 걸 골랐든 상관없이 적용되는 렌더링/형식상의 디테일이면(뱃지의 시각적 스타일, 테마, 크기) `select` 필드를 쓰세요. 그 선택 자체가 곧 "그 물건"이라면(특정 언어, 특정 툴 로고, 특정 소셜 플랫폼 — 사용자가 실제로 그걸 검색하거나 찾아볼 만한 것) `presets` 항목을 쓰세요.

같은 아이디어에 **둘 다** 쓴 실제 예시를 보면 바로 비교가 될 거예요: [`social-jongeuni-box-generator.json`](src/data/community-components/social-jongeuni-box-generator.json) ("Box Generator" 컴포넌트)에는 `style` **필드**(`type: "select"`, `GITHUB`/`MEDIUM`/`GLOW` 등의 옵션)가 있어서 Settings 패널에서 언제든 바꿀 수 있고, *동시에* 스타일마다 하나씩 대응하는 `presets` 배열도 있어서 라이브러리에서 "Box Generator" 카드 하나에 "Choose a style" 선택기가 붙어서 보여요. 둘 중 하나만 골라야 하는 게 아니에요 — 여기서는 둘 다 있어서, 이미 GitHub 스타일 박스를 원하는 사람은 라이브러리에서 바로 찾아 배치할 수 있고, 배치한 뒤에도 누구나 Settings 패널에서 스타일을 바꿀 수 있어요.

## 직접 Pull Request 열기

커뮤니티 컴포넌트는 `src/data/community-components/` 아래에 파일 하나당 하나씩 들어있어요 — 그래서 PR을 열면 본인이 새로 만든 파일 하나만 건드리게 되고, 다른 사람의 PR과 절대 충돌하지 않아요.

### 1. 저장소를 포크하고, 파일을 만듭니다

`src/data/community-components/<파일명>.json` 파일을 새로 추가하세요. 파일명 규칙은 **`{tag}-{username}-projectname.json`**이에요:

- **`tag`** — 이 컴포넌트가 속한 카테고리를 나타내는 영문 소문자 단어(`decoration`, `emotion`, `social`, `status`, `tech` ...). 실제 `category` 필드에 넣을 이모지+텍스트 값이 아니라, 그 카테고리를 가리키는 접두어예요.
- **`username`** — 이 컴포넌트가 감싸는 **외부 서비스를 실제로 만든 사람**의 GitHub 아이디(아래 `author` 필드와 같은 값). 백엔드가 특정 개발자 한 명으로 귀속시킬 수 없는 범용 서비스라면(shields.io 등) 이 부분을 통째로 생략하고 **`{tag}-projectname.json`**(2단 구성, username 없이)로 쓰세요.
- **`projectname`** — 이게 뭔지 알아볼 수 있는 짧은 이름.

예: `decoration-kyechan99-capsule-render.json`(GitHub 사용자 `kyechan99`가 만든 프로젝트를 감쌈), `social-github.json`(shields.io 뱃지라 특정 개발자 귀속이 없어서 username 부분이 없음).

이건 코드가 강제하는 규칙이 아니라 관례예요 — 실제로 중요한 건 파일명이 아니라 파일 안의 `id` 필드예요(아래 참고). (오래된 파일 중에는 이 규칙을 완벽히 안 따른 경우가 가끔 보일 수 있는데, 그건 신경 쓰지 마시고 새 파일은 이 관례를 따라주세요.)

### 2. JSON을 채웁니다 — 필드 전체 설명

기능을 골고루 쓰고 있어서 고른 실제 완성된 예시입니다([`status-anuraghazra-github-stats.json`](src/data/community-components/status-anuraghazra-github-stats.json)) — `select` 필드, `checkbox-group` 필드가 있고, 마침 현재 저장소에서 유일하게 실제로 배포된 `status: "inactive"` 예시이기도 해요:

```json
{
  "id": "status-anuraghazra-github-stats",
  "type": "url-component",
  "name": "GitHub Stats",
  "description": "A live card of your GitHub statistics.",
  "category": "📊 status",
  "tags": ["📊 status", "Card"],
  "status": "inactive",
  "author": "anuraghazra",
  "projectUrl": "https://github.com/anuraghazra/github-readme-stats",
  "defaultSettings": { "username": "alex123", "theme": "default", "hide": "" },
  "meta": {
    "urlTemplate": "https://github-readme-stats.vercel.app/api?username={username}&show_icons=true&theme={theme}&hide={hide}",
    "altTemplate": "{username}'s GitHub stats",
    "linkable": false,
    "fields": [
      { "key": "username", "label": "Username", "type": "text" },
      {
        "key": "theme",
        "label": "Theme",
        "type": "select",
        "options": [
          { "value": "default", "label": "Default" },
          { "value": "dark", "label": "Dark" },
          { "value": "radical", "label": "Radical" },
          { "value": "merko", "label": "Merko" }
        ]
      },
      {
        "key": "hide",
        "label": "Hide",
        "type": "checkbox-group",
        "options": [
          { "value": "issues", "label": "Issues" },
          { "value": "prs", "label": "Pull Requests" },
          { "value": "contrib", "label": "Contributions" }
        ]
      }
    ]
  }
}
```

#### 최상위 필드

| 필드 | 필수 여부 | 하는 일 |
|---|---|---|
| `id` | **필수** | 안정적인 식별자예요 — React 리스트 key로도 쓰이고, 누군가의 캔버스에 배치된 위젯이 실제로 참조하는 값이기도 하고, "즐겨찾기" 토글의 키이기도 해요. **라이브러리 전체에서 유일해야 하고**(자기 파일 안에서만이 아니라), PR이 머지된 뒤에는 **절대 바꾸거나 재사용하면 안 돼요** — 누군가의 저장된 문서나 즐겨찾기 목록이 이 값을 직접 참조하고 있을 수 있어요. |
| `type` | **필수** | 거의 항상 `"url-component"`예요 — 이 문서 전체가 다루는, "URL 템플릿에 필드 몇 개 채우기"용 범용 렌더러예요. (다른 값은 `src/components/widgets/` 아래에 직접 코드로 만들어진 소수의 타입뿐이에요 — heading, divider, table 등 — 커뮤니티 JSON 파일이 설정하는 게 아니에요. 정말 다른 렌더링이 필요하면 [완전히 새로운 Component 추가하기](#완전히-새로운-component-추가하기-코드-필요)를 보세요.) |
| `name` | **필수** | 라이브러리 카드에 보이는 이름. |
| `description` | **필수** | 이름 아래에 보이는 한두 문장 설명. |
| `category` | **필수** | 라이브러리에서 어느 카테고리 칩 아래 들어갈지. 고정 목록이 아니라 자유 문자열이에요 — 앱에는 기본 카테고리 6개(`🏷️ markdown`, `🧑‍💻 tech`, `🌐 social`, `📊 status`, `✨ decoration`, `💭 emotion`; 커스텀/커뮤니티 컴포넌트가 하나라도 생기면 7번째로 `🎨 custom`이 자동으로 나타남)가 있는데, 이건 순전히 칩이 나열되는 *순서*를 정하기 위한 것뿐이에요 — 완전히 새로운 카테고리 문자열을 써도 다른 파일 하나도 안 건드리고 바로 작동하고, 그냥 기본 카테고리들 뒤에 정렬될 뿐이에요. 정말 새 카테고리가 필요한 게 아니면 기존 카테고리의 이모지+텍스트를 정확히 맞춰서 쓰세요. |
| `tags` | **필수** | 카드에 작은 태그 알약으로 보이는 문자열 배열. 관례상 category 값 + 형태를 나타내는 단어 한두 개(`"Badge"`, `"Card"`, `"Link"`)를 넣어요. 순전히 설명용이라 카테고리 칩 말고 다른 필터링 로직에는 안 쓰여요. |
| `defaultSettings` | **필수** | 모든 필드의 시작값을, 평평한(flat) 객체로 — `meta.fields[].key`마다 하나씩, `linkable: true`로 설정했다면 `"link": ""`도 추가로. 새 preset 자신의 `settings`가 바로 이 값 *위에* 덮어씌워지므로(아래 Preset 참고), 그 자체로도 말이 되는 기본값을 넣어주세요. |
| `meta` | 선택 | URL이 어떻게 만들어지고 어떤 필드를 편집할 수 있는지에 관한 전부 — `urlTemplate`, `fields`, `linkable`, 필요하면 `altTemplate`/`linkTemplate`까지. 바로 아래에서 필드별로 설명해요. |
| `presets` | 선택 | 이 컴포넌트와 완전히 동일한, 이름 붙은 변형들 — 아래 [Preset 배열 섹션](#presets-배열-전체-설명) 참고. |
| `presetsLabel` | 선택 | 이 항목에 preset이 있을 때, 라이브러리 카드 요약 문구와 선택기 제목에 쓰이는 명사예요 — 예를 들어 `"languages"`면 `"6 languages · C++ · Java · ..."`와 `"Choose a language"` 제목이 나와요. 생략하면 기본값 `"presets"`(→ `"Choose a preset"`)가 쓰여요. `presets`가 있을 때만 의미가 있고, 없으면 무시돼요. |
| `defaultAlign` | 선택 | `"left"`(기본값, 생략과 동일), `"center"`, `"right"` 중 하나 — 막 배치된 인스턴스가 어떤 정렬로 시작할지. 배치 후에도 사용자가 캔버스에서 바꿀 수 있어요 — 이건 그냥 *시작* 값이에요. 컴포넌트의 시각적 목적 자체가 가운데 정렬을 전제로 하는 경우(장식용 배너 등)에만 설정할 가치가 있고, 그 외에는 그냥 안 건드리는 게 맞아요. |
| `status` | 선택 | `"active"`(기본값) 또는 `"inactive"`. `"inactive"`인 항목은 라이브러리 브라우징/검색에서 완전히 숨겨져요 — 하지만 이미 그 컴포넌트로 배치된 위젯은 예전과 똑같이 렌더링/내보내기가 돼요. 막히는 건 오직 *새로* 배치하는 것뿐이에요. 이 컴포넌트가 의존하는 백엔드 서비스가 죽거나 중단됐을 때, 파일을 지우는 대신 이걸 써서 이미 그 컴포넌트를 쓰고 있던 예전 문서들이 깨지지 않게 하세요. |
| `statusReason` | `status`가 `"inactive"`일 때 필수 | 왜 비활성인지 짧게 설명하는 문자열(예: `"백엔드(some-api.example.com)가 2026-08부로 응답하지 않음"`). **솔직히 말씀드리면**: 지금은 앱 UI 어디에도 표시되지 않아요 — JSON 파일 안에 미래의 유지보수자를 위한 메모로만 존재해요. 그래도 정확하게 적어두는 게 좋아요. |
| `author` | 선택 | 이 컴포넌트의 `urlTemplate`이 가리키는 **외부 서비스**를 실제로 만든 사람의 GitHub 아이디(파일명의 `username` 부분과 같은 값). 특정 소유자가 없는 범용 서비스(shields.io 등)라면 빈 문자열 `""`로 두세요 — 추측해서 채우지 마세요. 앱 안 마법사로 컴포넌트를 제출할 때 자동 생성되는 PR 설명 텍스트에만 쓰이고, 라이브러리 UI에는 안 보여요. |
| `projectUrl` | 선택 | 같은 외부 서비스/프로젝트의 홈페이지나 GitHub 저장소(예: `"https://shields.io"`, 또는 `author`가 있다면 그 사람의 업스트림 저장소). `author`와 마찬가지로 PR 설명에만 쓰여요. |

#### `meta` 필드

```json
"meta": {
  "urlTemplate": "https://.../api?a={fieldA}&b={fieldB}",
  "altTemplate": "선택사항 alt 텍스트, 똑같은 {fieldA} 문법",
  "linkable": true,
  "linkTemplate": "선택사항 — 아래 'linkable vs linkTemplate' 참고",
  "fields": [ /* 위에서 쓴 {fieldName}마다 하나씩 */ ]
}
```

- **`urlTemplate`**(필수) — 이미지 URL이고, `fields`/`defaultSettings`의 값이 들어가야 하는 자리마다 `{fieldKey}`를 넣어요(자동으로 URI 인코딩됨). **선택적 구간** 문법도 있어요, `{-fieldKey}` — 값이 비어있지 않을 때만 `-` 뒤에 값이 삽입되고, 비어있으면 아무것도(대시조차) 안 들어가요. 선택적 필드가 채워졌는지에 따라 뱃지 모양 자체가 바뀌어야 할 때 쓰는 문법이에요 — [`generic-badge.json`](src/data/community-components/generic-badge.json)의 `"{label}{-message}-{color}"`을 보면, `message`가 비어있으면 3구간 `LABEL-MESSAGE-COLOR` 뱃지가 2구간 `LABEL-COLOR`로 줄어들어요.
- **`altTemplate`**(선택) — 이미지의 alt 텍스트, `urlTemplate`과 같은 `{fieldKey}` 치환 문법. 생략하면 첫 번째 필드의 현재 값으로 대체돼요.
- **`linkable`**(선택, 생략 시 `false`) — `true`로 설정하면 Settings 패널에 "Link" 입력창이 추가돼서, 렌더링된 뱃지/아이콘을 사용자가 직접 입력한 링크로 감쌀 수 있어요. `defaultSettings`에도 `"link": ""`가 있어야 해요. **실제로는 `linkTemplate`과 함께 안 씀**(바로 아래) — 둘 중 하나만 쓰세요.
- **`linkTemplate`**(선택) — 링크를 사용자가 자유롭게 입력하는 게 아니라 다른 필드값으로부터 *계산*해야 할 때 씁니다(예: `username` 필드로 만들어지는 프로필 URL). `urlTemplate`과 같은 `{fieldKey}` 문법. 이걸 설정하면 Settings 패널에 편집 가능한 "Link" 입력창 대신 읽기 전용 계산값이 보여요.
- **`fields`**(URL에 진짜로 가변 부분이 하나도 없는 게 아니라면 필수) — `urlTemplate`/`altTemplate`에서 쓴 `{fieldKey}`마다 하나씩 들어가는 배열이에요. 각 항목:

  | 속성 | 필수 대상 | 의미 |
  |---|---|---|
  | `key` | 항상 | `{key}`(또는 `{-key}`) 자리표시자와 정확히 일치해야 하고, `defaultSettings`에도 대응하는 항목이 있어야 해요. |
  | `label` | 항상 | Settings 패널에 보이는 필드 이름. |
  | `type` | 항상 | 아래 6가지 값 중 하나. |
  | `options` | `color`, `select`, `combo`, `checkbox-group` | `{ "value": "...", "label": "...", "swatch"?: "..." }` 배열. `swatch`는 `color`일 때만 의미가 있어요(작은 미리보기 사각형의 CSS 색상 — 생략하면 `value` 자체를 대신 써요, 그래서 `"blue"`같은 이름 있는 색이면 생략해도 잘 작동해요). |
  | `min` / `max` / `step` | `number`만 | 전부 선택사항, 생략하면 각각 `0`/`100`/`1`. |

  `type`의 6가지 값, 각각 어떻게 렌더링되고 `settings[key]`에 뭐가 들어가는지:

  | `type` | 렌더링 | 결과값 |
  |---|---|---|
  | `text` | 일반 텍스트 입력창 | 사용자가 입력한 그대로 |
  | `select` | `<select>` 드롭다운 | 선택한 옵션의 `value` |
  | `combo` | 검색 가능한 드롭다운인데, **목록에 없는 텍스트도 직접 입력 가능** | 선택한 옵션의 `value`, 또는 목록에 없는 걸 입력했다면 사용자가 입력한 그 값 — "흔히 고르는 몇 개는 있지만 고정된 집합은 아닌" 경우에 씀 (예: 색상 이름/hex, shields.io 로고 슬러그) |
  | `color` | 클릭 가능한 색상 스와치 그리드 | 클릭한 옵션의 `value` |
  | `number` | 슬라이더(`min`~`max`, 간격 `step`), 라벨 옆에 현재 값 표시 | 슬라이더의 현재 값, **문자열**로(숫자로 변환 안 됨) |
  | `checkbox-group` | 옵션마다 체크박스 하나씩 | 체크된 옵션들의 `value`를 **콤마로 합친 문자열 하나**(예: `"issues,prs"`) — CSV를 받는 API 파라미터에 그대로 넣기 위한 것(위 예시의 `hide=issues,prs`처럼) |

  `fields`에 선언 안 해도 모든 `url-component` 인스턴스에 자동으로 딸려오는 설정이 두 개 더 있어요: 자유 텍스트 **"Display width"** 입력창(`settings.width` — 값이 있으면 내보낼 때 `![alt](url)`이 `<img src="..." width="...">`로 바뀜)과, `linkable`/`linkTemplate`을 설정했다면 위에서 설명한 **"Link"** 입력창/읽기전용 표시.

#### `presets` 배열, 전체 설명

```json
"presetsLabel": "languages",
"presets": [
  { "id": "lang-kotlin", "name": "Kotlin", "settings": { "label": "Kotlin", "color": "purple", "link": "https://kotlinlang.org" } }
]
```

각 항목:

| 필드 | 필수 여부 | 하는 일 |
|---|---|---|
| `id` | **필수** | 최상위 `id`와 규칙이 같아요 — 이 파일 안의 preset들끼리만이 아니라 *라이브러리 전체*에서 유일해야 하고, 한번 배포되면 절대 바꾸거나 재사용하면 안 돼요. 배치된 위젯/즐겨찾기/저장된 문서가 실제로 참조하는 값은 이거예요 — 부모 Component의 `id`가 아니라. |
| `name` | **필수** | preset의 표시 이름(자기만의 카드로 보이거나, 선택기/칩 목록의 항목 하나로 보임). |
| `description` | 선택 | 생략하면 부모 Component의 `description`을 그대로 씀. |
| `settings` | 선택 | 부모의 `defaultSettings`와 다른 키만 적으면 돼요 — 그 위에 **덮어씌워지는** 방식이라 모든 필드를 반복할 필요 없어요. |
| `meta` | 선택 | 같은 방식으로 부모의 `meta` 위에 덮어씌워져요 — preset이 정말로 다른 `urlTemplate`이 필요한 경우에만 씀(드문 경우, 보통은 `settings`만 다름). |

Component에 `presets`가 생기면 UI에서 벌어지는 일:

- 여전히 라이브러리에는 **카드 딱 하나**로 보여요 — 그리드에 preset마다 카드가 따로 뜨는 게 절대 아니에요 — 카드를 펼치면 preset 선택기가 나타나요. 단, preset 개수가 정말 많으면 예외가 있어요(다음 항목).
- 라이브러리의 "All"(컴포넌트+preset이 섞인) 뷰는 원래 preset을 전부 각각 독립적으로 검색 가능한 카드로 풀어서 보여주는데, **Component의 preset이 8개를 초과하거나**(또는 특수 타입인 `text-art`인 경우) 예외적으로 거기서도 카드 하나로 묶여서 보여요 — 그래서 비슷비슷한 카드가 벽처럼 늘어서는 대신 검색 가능한 선택기가 나와요. `tech-lang-badge.json`의 언어 preset 33개가 바로 이 예외가 존재하는 이유예요.
- 펼쳐진 카드 안에서 preset 개수에 따라 다른 선택기 UI가 나와요: 8개 이하면 클릭 가능한 이름 칩들이 한 줄로, 8개 초과면 검색 가능한 콤보박스로. (`text-art`는 옵션 텍스트 자체가 이름이 아니라 실제 캐릭터 아트인 특수한 세 번째 UI를 써요 — 일반 뱃지/아이콘에서는 신경 쓸 필요 없어요.)
- 카드가 접혀있을 때 요약 문구는 `"<개수> <presetsLabel> · <처음 3개 preset 이름> + <N>개 더"` 형식이에요(3개 이하면 `+ N개 더` 없이).
- 이미 펼쳐둔 카드를 다시 열면 선택기는 항상 배열의 *첫 번째* preset으로 리셋돼요 — "마지막으로 고른 걸 기억"하는 기능은 없어요.
- "Use Component"는 그 순간 선택기에서 골라져 있는 preset을(그 preset 자신의 flatten된 `id`로) 배치해요 — preset이 존재하는 이상, 부모 Component 자신의 `id`가 직접 쓰이는 일은 없어요.

### 3. Pull Request를 엽니다

머지되고 나면 다른 파일은 하나도 안 건드려도 모두의 라이브러리에 바로 나타나요.

## 기존 Component에 Preset 추가하기

새로 추가하는 뱃지/아이콘/링크 대부분은 새 Component가 아니라 이 경우예요 — 위 [Component vs Preset](#component와-preset--뭐가-다른가요) 기준을 참고하세요.

- **Component가 `.json` 파일이라면**(기본 제공 뱃지들 — `tech-lang-badge.json`, `social-github.json` 등을 포함해 대부분이 여기 해당) — 그 파일을 열어서 `presets` 배열에 항목 하나를 추가하세요(아직 없다면 배열을 새로 만들고, `"presets"`라는 기본 명사가 어색하다면 `presetsLabel`도 같이 추가하세요). 다른 건 전혀 건드릴 필요 없어요. Component를 처음엔 `presets` 없이 만들었다가 나중에 별도 PR로 추가해도 전혀 문제 없어요 — 구조적으로 다른 게 아니라, 그냥 그 배열(과 `presetsLabel`)이 있는지 없는지의 차이일 뿐이에요.
- **Component가 코드 디렉터리라면**(예: `tech-icon/` — 크기 슬라이더처럼 순수 URL 템플릿으로는 표현 안 되는 UI가 필요해서 코드로 만들어진 경우) — 그 디렉터리의 `presets.ts`를 열어서 해당 배열에 항목 하나를 추가하세요. `component.ts`는 건드릴 필요 없어요.

어느 쪽이든: `id`는 전역적으로 유일하고 영구적이어야 하고(위 표 참고), `settings`는 부모의 `defaultSettings`와 다른 부분만 적으면 돼요.

## 완전히 새로운 Component 추가하기 (코드 필요)

"URL 템플릿에 필드 몇 개 채우기"로는 아예 표현이 안 되는 경우에만 필요해요 — 설정 UI나 렌더링 로직 자체가 완전히 다른 경우지, 단순히 새 preset을 추가하는 게 아니에요. `src/data/community-components/<본인type>/` 아래에 자기만의 디렉터리가 필요해요(예: `tech-icon/` — 디렉터리 이름은 그 컴포넌트의 `type` 문자열과 같아요). 필요한 파일은 전부 그 디렉터리 하나 안에 있고, 그 밖의 파일은 아무것도 건드릴 필요가 없어요. `src/data/community-components/tech-icon/`을 열어서 패턴을 참고하세요:

- `types.ts` — 설정값 구조(`<Name>Settings` 인터페이스와, 상수들)
- `Preview.tsx` — `Preview`를 export, 캔버스와 라이브러리 카드에서 어떻게 그려지는지
- `SettingsForm.tsx` — `SettingsForm`을 export, 설정 패널 UI
- `presets.ts` — 이 컴포넌트가 이름 붙은 변형(preset)을 가질 때만 필요해요; 변형 그룹마다 `PresetDefinition[]` 배열 하나씩 export
- `component.ts` — 위 파일들을 전부 엮어서 `export const module: ComponentModule` 하나로 만들어요 — 렌더러인 `definition`(`type`, `layout`, `Preview`, `SettingsForm`, `toMarkdown`)과, 이 컴포넌트가 만드는 라이브러리 카드(들)인 `entries`(preset이 있다면 `presets: yourPresetsArray`도 함께) — 여기 `entries`도 위에서 설명한 `status`/`statusReason`/`author`/`projectUrl`을 그대로 받아요, 의미도 동일하고 JSON 대신 TypeScript로 쓰는 것뿐이에요(파일명 규칙은 여기 해당 없지만, 디렉터리 이름은 여전히 `type`과 같아야 해요).

이게 끝이에요 — `src/registry/index.ts`가 빌드 시점에 `community-components/*/component.ts`를 전부 자동으로 찾아 등록하기 때문에, 따로 등록하는 단계가 없어요. JSON 하나로 끝나는 컴포넌트보다는 큰 PR이니, 시작하기 전에 이슈를 먼저 열어주시면 범위 잡는 걸 같이 도와드릴게요.

## 파일 구조 / 파일명 규칙에 대해 더 자세히

`community-components/`가 정확히 어떻게 구성되어 있는지 더 깊이 알고 싶거나(또는 위 내용 중 뭔가를 다른 표현으로 한 번 더 보고 싶다면), [`src/data/community-components/README.md`](src/data/community-components/README.md)에 조금 다른 예시들로 같은 내용을 다루고 있어요 — 두 문서가 서로 모순되면 안 되지만, 혹시 차이가 보이면 실제 코드와 더 일치하는 쪽을 믿으시고, PR에서 알려주셔도 좋아요.

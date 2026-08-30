# Contributing a Component

_Read this in [한국어](CONTRIBUTING.ko.md)._

This project's library (badges, icons, cards, links, ...) is built by its users. This doc is meant to be self-contained — if you've never touched this codebase before, everything you need to add a component should be here, with real examples pulled straight from the shipped library.

## The easiest way: use the in-app wizard

1. In the app, open the Library panel and click **+ Add Component**.
2. Paste a real, already-working example URL (a shields.io badge URL, an icon URL, anything that already renders an image). Values after the `?` — like `?style=flat&color=blue` — are automatically turned into editable fields.
3. Fill in a name, category, and field labels, then click **Add**.
4. Connect your GitHub account and the app opens a pull request for you automatically, pre-labeled and ready for review.

No code, no forking required — this covers the vast majority of components (any badge/icon/link that's really just an image URL with a few swappable values).

**What the wizard can't do** — if you need any of these, skip to [Opening the Pull Request yourself](#opening-the-pull-request-yourself) and hand-edit the JSON instead:

- **Presets** (see below) — the wizard only ever creates a single component with no variants. Adding presets always means editing the generated JSON afterward, or writing it by hand from the start.
- Field types other than `text`, `color`, and `select` — a `number` slider, a `checkbox-group`, or a `combo` box (all explained below) aren't offered in the wizard's step 2.
- `defaultAlign`, `statusReason`, `meta.altTemplate`, `meta.linkTemplate`, or more than one tag — none of these have a wizard input; they default to unset/empty.
- A brand-new rendering type that isn't "an image URL with a few fields" at all — see [Adding a brand-new Component](#adding-a-brand-new-component-needs-code).

## Component vs. Preset — what's the difference?

Two different things live in the library, and mixing them up is the most common point of confusion:

**A Component** is a distinct _kind_ of README element. It has its own settings, its own look, and its own markdown output. Examples: "Language Badge", "GitHub Stats card", "Divider", "Tech Icon".

**A Preset** is a ready-made _variant_ of an existing Component — same settings shape, same rendering, same markdown logic, just different data. For example, "C++" and "Python" are not two separate Components — they're both **presets** of the same "Language Badge" Component. Picking one just changes the label, color, and link; nothing about how it's built or rendered changes.

A simple rule of thumb:

- Adding "the same kind of thing, just with different text/color/link" (a new programming language, a new tool logo, a new social platform)? → It's almost always a new **Preset** of a Component that already exists.
- Adding something that needs genuinely different settings, a different look, or serves a different purpose? → It's a **new Component**.

This matters for a PR: adding a preset is a tiny, low-risk change (a few lines of data); adding a new Component usually means new code (see below). If you're not sure which one your idea is, open an issue or a draft PR and ask — happy to help sort it out.

## A settings dropdown vs. a Preset — which one do I want?

This is a separate question from "Component vs. Preset" above, and it trips people up just as often: a single field can *also* be a dropdown (`"type": "select"` in `meta.fields`, explained in full below) — so when should a set of options be a `select` field, and when should it be a `presets` array?

They look similar (both end up as "pick one of a few named options" in the UI) but they're structurally different:

|  | a `select` **field** | a **preset** |
|---|---|---|
| Where it lives | One entry inside `meta.fields`, on a single Component | A top-level `presets` array on the Component |
| Where you pick it | Inside that one widget's own Settings panel, **after** it's already placed on the canvas | In the Library, **before** placing it (or via a "Preset" dropdown in Settings for an already-placed widget) |
| Does it get its own Library card / show up in search? | No — it's invisible to browsing/search, just one control among the component's other settings | Yes — each preset is independently searchable, favoritable, and (if there are few enough) shown as its own card |
| Has its own `id`/`name`? | No — just a `value`/`label` pair | Yes — a globally-unique `id` and a `name`, same as a Component |

**Rule of thumb:** use a `select` field when the choice is a rendering/format detail that applies no matter which "thing" the user picked — a badge's visual style, a theme, a size. Use a `presets` entry when the choice **is** the thing itself — something a user would actually search or browse for as its own item (a specific language, a specific tool logo, a specific social platform).

A real example that uses **both**, for the same underlying idea, so you can compare them directly: [`social-jongeuni-box-generator.json`](src/data/community-components/social-jongeuni-box-generator.json) (the "Box Generator" component) has a `style` **field** (`type: "select"`, options like `GITHUB`/`MEDIUM`/`GLOW`/...) that's always available in its Settings panel no matter what — *and* a `presets` array with one preset per style, so "Box Generator" also shows up in the Library as one card with a "Choose a style" picker. Nothing forces you to pick one or the other; here, having both means people who already know they want the GitHub-styled box can find and place it directly from the Library, while anyone can still switch styles afterward from the Settings panel.

## Opening the Pull Request yourself

Community components live one-per-file under `src/data/community-components/` — your PR only ever touches your own new file, so it can never conflict with anyone else's PR.

### 1. Fork the repo, then create your file

Add a new file at `src/data/community-components/<filename>.json`. The filename convention is **`{tag}-{username}-projectname.json`**:

- **`tag`** — a lowercase English word for the category this belongs to (`decoration`, `emotion`, `social`, `status`, `tech`, ...). This is a prefix pointing at the category, not the emoji+label value you'll put in the actual `category` field.
- **`username`** — the GitHub username of whoever actually built the **external service** this component wraps (same value you'll put in the `author` field below). If the backend is a generic, multi-purpose service with no single attributable developer (e.g. shields.io) — drop this segment entirely and use the shorter **`{tag}-projectname.json`** (two parts, no username).
- **`projectname`** — a short, recognizable name for what this is.

Examples: `decoration-kyechan99-capsule-render.json` (wraps a project built by GitHub user `kyechan99`), `social-github.json` (a shields.io badge — no single attributable developer, so no username segment).

This is a convention, not something the code enforces — what's actually load-bearing is the `id` field inside the file (see below), not the filename. (You may occasionally see this rule not perfectly followed in an older file — don't worry about matching that, follow the convention for new files.)

### 2. Fill in the JSON — every field explained

Here's a real, complete example ([`status-anuraghazra-github-stats.json`](src/data/community-components/status-anuraghazra-github-stats.json)), chosen because it uses a good spread of features — a `select` field, a `checkbox-group` field, and (as it happens) is currently the one shipped example of `status: "inactive"`:

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

#### Top-level fields

| Field | Required? | What it does |
|---|---|---|
| `id` | **Required** | A stable identifier — used as the React list key, as what a placed widget on someone's canvas actually points back to, and as the key for the "favorite" toggle. **Must be globally unique across the entire library** (not just unique within your file), and once your PR is merged, **never change or reuse it** — someone's saved document or favorites list may already reference it directly. |
| `type` | **Required** | Almost always `"url-component"` — the generic "fill a URL template with some fields" renderer this whole doc is about. (The only other values are the handful of hand-coded types under `src/components/widgets/` — headings, dividers, tables, etc. — which aren't something a community JSON file sets; see [Adding a brand-new Component](#adding-a-brand-new-component-needs-code) if you need genuinely different rendering.) |
| `name` | **Required** | The display name shown on the Library card. |
| `description` | **Required** | One or two sentences shown under the name in the Library. |
| `category` | **Required** | Which chip this is filed under in the Library. This is a free-text string, not a fixed list — the app ships with 6 seed categories (`🏷️ markdown`, `🧑‍💻 tech`, `🌐 social`, `📊 status`, `✨ decoration`, `💭 emotion`; a 7th, `🎨 custom`, appears automatically once any custom/community component exists) purely to control chip *order* — using a brand-new category string works immediately with zero other files to edit, it just sorts after the seed ones. Match an existing category's exact emoji+text unless you genuinely need a new one. |
| `tags` | **Required** | An array of strings shown as small tag pills on the card. Conventionally includes the category value plus a word or two describing the shape (`"Badge"`, `"Card"`, `"Link"`). Purely descriptive — not used for filtering logic beyond the category chips. |
| `defaultSettings` | **Required** | The starting value for every field, as a flat object — one key per `meta.fields[].key`, plus `"link": ""` if you set `linkable: true` (see below). This is also what a fresh preset's own `settings` gets merged *over* (see Presets below), so pick sensible, working defaults. |
| `meta` | Optional | Everything about how the URL gets built and what fields are editable — `urlTemplate`, `fields`, `linkable`, and optionally `altTemplate`/`linkTemplate`. Covered field-by-field just below. |
| `presets` | Optional | Named variants of this exact same Component — see [the Preset section](#the-presets-array-in-full) below. |
| `presetsLabel` | Optional | The noun used in the Library card's summary text and picker heading when this entry has presets — e.g. `"languages"` produces `"6 languages · C++ · Java · ..."` and a `"Choose a language"` picker heading. Defaults to the generic `"presets"` (→ `"Choose a preset"`) if omitted. Only ever matters together with `presets` — ignored otherwise. |
| `defaultAlign` | Optional | `"left"` (the default, same as omitting this), `"center"`, or `"right"` — what alignment a freshly-placed instance starts with. The user can still change it afterward from the canvas; this only sets the *starting* value. Only worth setting when a component's whole visual purpose assumes centering (a decorative banner, say) — leave it unset for anything else. |
| `status` | Optional | `"active"` (the default) or `"inactive"`. An `"inactive"` entry is completely hidden from Library browsing and search — but a widget someone already placed from it keeps rendering and exporting exactly as before; only *new* placements are blocked. Use this instead of deleting the file when the backend service it depends on goes down or is discontinued, so old documents that already used it don't break. |
| `statusReason` | Required *if* `status` is `"inactive"` | A short note explaining why it's inactive (e.g. `"Backend (some-api.example.com) stopped responding as of 2026-08"`). **Honest caveat:** this currently isn't displayed anywhere in the app UI — it exists purely as a note-to-future-maintainers inside the JSON file itself. Still worth filling in accurately. |
| `author` | Optional | The GitHub username of whoever actually built the **external service** this component's `urlTemplate` points at (same value as the filename's `username` segment). Leave it an empty string `""` for a generic, no-single-owner service (shields.io, etc.) — don't guess. Only ever shown in the auto-generated PR description text when someone submits a component through the in-app wizard; not shown in the Library UI. |
| `projectUrl` | Optional | The homepage or GitHub repo of that same external service/project (e.g. `"https://shields.io"`, or the upstream repo when `author` is set). Same visibility as `author` — PR description only. |

#### `meta` fields

```json
"meta": {
  "urlTemplate": "https://.../api?a={fieldA}&b={fieldB}",
  "altTemplate": "optional alt text, same {fieldA} syntax",
  "linkable": true,
  "linkTemplate": "optional — see 'linkable vs. linkTemplate' below",
  "fields": [ /* one entry per {fieldName} used above */ ]
}
```

- **`urlTemplate`** (required) — the image URL, with `{fieldKey}` wherever a value from `fields`/`defaultSettings` should be substituted in (URI-encoded automatically). There's also an **optional-segment** variant, `{-fieldKey}` — this inserts a literal `-` followed by the value, but *only* when the value is non-empty; when empty, nothing is inserted at all (not even the dash). This is for badges whose shape genuinely changes shape depending on whether an optional field is filled in — see [`generic-badge.json`](src/data/community-components/generic-badge.json)'s `"{label}{-message}-{color}"`, which collapses from a 3-segment `LABEL-MESSAGE-COLOR` badge to a 2-segment `LABEL-COLOR` one when `message` is left blank.
- **`altTemplate`** (optional) — the image's alt text, same `{fieldKey}` substitution as `urlTemplate`. If omitted, it defaults to the first field's current value.
- **`linkable`** (optional, `false` if omitted) — set to `true` to add a "Link" input to the Settings panel, so the rendered badge/icon can be wrapped in a link to somewhere the user types in themselves. Needs `"link": ""` present in `defaultSettings` too. **Mutually exclusive in practice with `linkTemplate`** (see next) — use one or the other, not both.
- **`linkTemplate`** (optional) — for when the link shouldn't be freely typed but *computed* from the other field values instead (e.g. a profile URL built straight from a `username` field). Same `{fieldKey}` syntax as `urlTemplate`. When set, the Settings panel shows the computed link as read-only instead of an editable "Link" input.
- **`fields`** (required unless the URL genuinely has zero variable parts) — an array, one entry per `{fieldKey}` your `urlTemplate`/`altTemplate` uses. Each entry:

  | Property | Required for | Meaning |
  |---|---|---|
  | `key` | always | Must exactly match a `{key}` (or `{-key}`) placeholder, and must have a matching entry in `defaultSettings`. |
  | `label` | always | The field's name in the Settings panel. |
  | `type` | always | One of the six values below. |
  | `options` | `color`, `select`, `combo`, `checkbox-group` | An array of `{ "value": "...", "label": "...", "swatch"?: "..." }`. `swatch` only matters for `color` (a CSS color for the little preview square; falls back to `value` itself if omitted — so it works fine even for named colors like `"blue"`). |
  | `min` / `max` / `step` | `number` only | All optional; default to `0`/`100`/`1` if omitted. |

  The six `type` values, what they render, and what ends up in `settings[key]`:

  | `type` | Renders as | Resulting value |
  |---|---|---|
  | `text` | A plain text input | Whatever the user typed, verbatim |
  | `select` | A `<select>` dropdown | The chosen option's `value` |
  | `combo` | A searchable dropdown that **also accepts free-typed text** not in the list | The chosen option's `value`, *or* whatever the user typed if it's not one of the options — use this for "a handful of common picks, but not a closed set" (e.g. a color name/hex, or a shields.io logo slug) |
  | `color` | A grid of clickable color swatches | The clicked option's `value` |
  | `number` | A slider (`min`–`max`, step `step`) with the live value shown next to the label | The slider's current value, as a **string** (not coerced to a number) |
  | `checkbox-group` | One checkbox per option | A **single comma-joined string** of every checked option's `value` (e.g. `"issues,prs"`) — built for substituting straight into an API param that accepts a CSV list, like `hide=issues,prs` above |

  Two more settings exist automatically on every `url-component` instance, *not* declared in `fields`: a free-text **"Display width"** input (`settings.width`, switches the exported markdown from `![alt](url)` to `<img src="..." width="...">` when set) and, if `linkable`/`linkTemplate` is set, the **"Link"** input/read-out described above.

#### The `presets` array, in full

```json
"presetsLabel": "languages",
"presets": [
  { "id": "lang-kotlin", "name": "Kotlin", "settings": { "label": "Kotlin", "color": "purple", "link": "https://kotlinlang.org" } }
]
```

Each entry:

| Field | Required? | What it does |
|---|---|---|
| `id` | **Required** | Same rules as the top-level `id` — globally unique across the *entire* library (not just this file's own presets), never changed or reused once shipped. This becomes the actual id a placed widget/favorite/saved-document references — not the parent Component's `id`. |
| `name` | **Required** | The preset's display name (shown as its own card, or as one entry in the picker/chip list). |
| `description` | Optional | Falls back to the parent Component's `description` if omitted. |
| `settings` | Optional | Only the keys that differ from the parent's `defaultSettings` — merged **over** it, so you don't need to repeat every field. |
| `meta` | Optional | Same idea, merged over the parent's `meta` — only needed if a preset genuinely needs, say, a different `urlTemplate`, which is rare (usually only `settings` differs). |

What happens in the UI once a Component has `presets`:

- It still shows as **exactly one card** in the Library — never one card per preset directly in the grid — that grows a preset picker in its expanded state, unless there's a genuinely huge number of presets, see next point.
- The Library's "All" (mixed component-and-preset) view *would* normally flatten every preset into its own separate, individually searchable card — **except** when a Component has more than 8 presets (or is the special `text-art` type), in which case it deliberately stays as one grouped card even there, so you get a searchable picker instead of a wall of near-identical cards. `tech-lang-badge.json`'s 33 language presets are the reason this exception exists.
- Inside the expanded card, which picker UI shows depends on preset count: 8 or fewer → a flat row of clickable name chips; more than 8 → a searchable combobox. (`text-art` gets a third, special-cased native `<select>` where the option text itself is the actual character art, not a name — not something you'll need to replicate for a normal badge/icon.)
- The card's collapsed summary line reads `"<count> <presetsLabel> · <first 3 preset names> + <N> more"` (or without the `+ N more` if there are 3 or fewer).
- Re-opening an already-expanded card always resets the picker back to the *first* preset in the array — there's no "remember what I picked last" behavior.
- "Use Component" places whichever preset is currently selected in the picker (its own flattened `id`) — never the parent Component's own `id` directly, once presets exist.

### 3. Open the pull request

Once it's merged, your component shows up in the library for everyone — no other file needs to change.

## Adding a Preset to an existing Component

Most new badges/icons/links are this, not a new Component — see the [Component vs. Preset](#component-vs-preset--whats-the-difference) rule above.

- **If the Component is a `.json` file** (true for the vast majority, including all the built-in badges — `tech-lang-badge.json`, `social-github.json`, etc.): open that file and add one entry to its `presets` array (create the array — and a `presetsLabel`, if it doesn't have one yet and the default `"presets"` noun doesn't read naturally — if it doesn't exist yet). Nothing else changes. It's fine for a Component to ship with *no* `presets` at first and gain them later in a separate PR — there's no structural difference, just whether the array (and `presetsLabel`) happen to be present.
- **If the Component is a coded directory** (e.g. `tech-icon/`, because it needs UI a plain URL template can't express — a size slider, in that case): open that directory's `presets.ts` and add one entry to the relevant array. `component.ts` doesn't need to change.

Either way: `id` must be globally unique and permanent (see the table above), and `settings` only needs to list what differs from the parent's `defaultSettings`.

## Adding a brand-new Component (needs code)

Only needed when your idea can't be expressed as "fill a URL template with a few fields" at all — genuinely different settings UI or rendering logic, not just a new preset. It gets its own directory under `src/data/community-components/<your-type>/` (e.g. `tech-icon/` — directory name = the component's `type` string). Everything it needs lives inside that one directory; nothing outside it needs to change. Look at `src/data/community-components/tech-icon/` for the pattern:

- `types.ts` — the settings shape (a `<Name>Settings` interface, plus any constants)
- `Preview.tsx` — exports `Preview`, how it renders on the canvas and in the library card
- `SettingsForm.tsx` — exports `SettingsForm`, the settings-panel UI
- `presets.ts` — only needed if the component has named variants; exports one `PresetDefinition[]` array per variant group
- `component.ts` — wires all of the above into one `export const module: ComponentModule`: a `definition` (`type`, `layout`, `Preview`, `SettingsForm`, `toMarkdown`) and `entries` (the library card(s) it backs, with `presets: yourPresetsArray` if applicable) — its entries accept the exact same `status`/`statusReason`/`author`/`projectUrl` fields described above, same meaning, just written in TypeScript instead of JSON (the filename convention doesn't apply here, but the directory name still needs to equal `type`).

That's it — `src/registry/index.ts` discovers every `community-components/*/component.ts` automatically at build time, so there's no separate registration step. This is a bigger PR than a JSON-only component — open an issue first if you'd like help scoping it out before you start.

## More detail on the file layout / filename convention

If you want more depth on exactly how `community-components/` is organized (or want a second explanation of anything above in a different phrasing), [`src/data/community-components/README.md`](src/data/community-components/README.md) covers the same ground with a slightly different set of examples — the two docs shouldn't contradict each other, but if you ever spot a difference, trust whichever one matches the actual current code (or flag it in your PR).

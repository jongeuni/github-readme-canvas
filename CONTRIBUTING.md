# Contributing a Component

_Read this in [한국어](CONTRIBUTING.ko.md)._

This project's library (badges, icons, cards, links, ...) is built by its users. This doc explains the two ways to add something new to it, and the one concept worth understanding first: the difference between a **Component** and a **Preset**.

## The easiest way: use the in-app wizard

1. In the app, open the Library panel and click **+ Add Component**.
2. Paste a real, already-working example URL (a shields.io badge URL, an icon URL, anything that already renders an image). Values after the `?` — like `?style=flat&color=blue` — are automatically turned into editable fields.
3. Fill in a name, category, and field labels, then click **Add**.
4. Connect your GitHub account and the app opens a pull request for you automatically, pre-labeled and ready for review.

No code, no forking required — this covers the vast majority of components (any badge/icon/link that's really just an image URL with a few swappable values).

## Component vs. Preset — what's the difference?

Two different things live in the library, and mixing them up is the most common point of confusion:

**A Component** is a distinct _kind_ of README element. It has its own settings, its own look, and its own markdown output. Examples: "Language Badge", "GitHub Stats card", "Divider", "Tech Icon".

**A Preset** is a ready-made _variant_ of an existing Component — same settings shape, same rendering, same markdown logic, just different data. For example, "C++" and "Python" are not two separate Components — they're both **presets** of the same "Language Badge" Component. Picking one just changes the label, color, and link; nothing about how it's built or rendered changes.

A simple rule of thumb:

- Adding "the same kind of thing, just with different text/color/link" (a new programming language, a new tool logo, a new social platform)? → It's almost always a new **Preset** of a Component that already exists.
- Adding something that needs genuinely different settings, a different look, or serves a different purpose? → It's a **new Component**.

This matters for a PR: adding a preset is a tiny, low-risk change (a few lines of data); adding a new Component usually means new code (see below). If you're not sure which one your idea is, open an issue or a draft PR and ask — happy to help sort it out.

## Opening the Pull Request yourself

Community components live one-per-file under `src/data/community-components/` — your PR only ever touches your own new file, so it can never conflict with anyone else's PR.

1. Fork the repo.
2. Add a new file at `src/data/community-components/<your-id>.json` (id = lowercase, hyphenated — e.g. `social-mastodon.json`).
3. Use this shape (this is a real example, adapted from an existing one):

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

- **`urlTemplate`** — the image URL, with `{fieldName}` wherever a value should be user-editable.
- **`fields`** — one entry per `{fieldName}` used in the template. `type` is `"text"`, `"color"`, `"select"`, `"number"` (a range slider — add `min`/`max`/`step`), or `"checkbox-group"` (multiple checkboxes whose checked values get comma-joined into one field, for a param like `hide=issues,prs`) — the latter three need an `options: [{ value, label }]` array (except `"number"`).
- **`linkable: true`** adds a "Link" setting so the badge/icon can be wrapped in a link to somewhere — pair it with `"link": ""` in `defaultSettings`. If the link should instead be computed from other fields rather than typed in (e.g. a profile URL built from a username), use **`linkTemplate`** instead — same `{fieldName}` syntax as `urlTemplate`, shown to the user as a read-only computed value.
- **`category`** controls which chip it's filed under in the Library (`Languages`, `Frameworks`, `Databases`, `Tools`, `Stats`, `Social`, `Decorations`, or a new one of your own).
- **`presets`** — optional. If your idea is really several variants of the exact same component (different label/color/link, same everything else — see the Component vs. Preset rule above), add a `presets` array right in this same JSON file instead of one file per variant:
  ```json
  "presets": [
    { "id": "social-mastodon-fosstodon", "name": "Fosstodon", "settings": { "username": "yourname" } }
  ]
  ```
  This is the whole mechanism — no code, no separate file, just data. `id`s must be unique and, once shipped, never reused for something else (saved documents and favorites reference them directly).

4. Open a pull request. Once it's merged, your component shows up in the library for everyone — no other file needs to change.

## Adding a Preset to an existing Component

Most new badges/icons/links are this, not a new Component — see the rule above.

- **If the Component is a `.json` file** (true for the vast majority, including all the built-in badges — `lang-badge.json`, `social-github.json`, etc.): open that file and add one entry to its `presets` array (create the array if it doesn't exist yet). Nothing else changes.
- **If the Component is a coded directory** (e.g. `tech-icon/`, because it needs UI a plain URL template can't express — a size slider, in that case): open that directory's `presets.ts` and add one entry to the relevant array. `component.ts` doesn't need to change.

## Adding a brand-new Component (needs code)

Only needed when your idea can't be expressed as "fill a URL template with a few fields" at all — genuinely different settings UI or rendering logic, not just a new preset. It gets its own directory under `src/data/community-components/<your-type>/` (e.g. `tech-icon/` — directory name = the component's `type` string). Everything it needs lives inside that one directory; nothing outside it needs to change. Look at `src/data/community-components/tech-icon/` for the pattern:

- `types.ts` — the settings shape (a `<Name>Settings` interface, plus any constants)
- `Preview.tsx` — exports `Preview`, how it renders on the canvas and in the library card
- `SettingsForm.tsx` — exports `SettingsForm`, the settings-panel UI
- `presets.ts` — only needed if the component has named variants; exports one `PresetDefinition[]` array per variant group
- `component.ts` — wires all of the above into one `export const module: ComponentModule`: a `definition` (`type`, `layout`, `Preview`, `SettingsForm`, `toMarkdown`) and `entries` (the library card(s) it backs, with `presets: yourPresetsArray` if applicable)

That's it — `src/registry/index.ts` discovers every `community-components/*/component.ts` automatically at build time, so there's no separate registration step. This is a bigger PR than a JSON-only component — open an issue first if you'd like help scoping it out before you start.

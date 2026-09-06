# Changelog

## v1.0.0 — Production readiness pass

This release is a full compatibility and security audit of every module
ahead of the first stable tag. Nothing in the public, documented API
surface (`Onigiri.ajax`, `Onigiri.security`, `Onigiri.storage`,
`Onigiri.router`, `Onigiri.pjax`, `Onigiri.i18n`, `Onigiri.mode`,
`Onigiri.emojis`, `Onigiri.validation`, `Onigiri.portal`, `Onigiri.humhub`)
had its call signature changed. The two internal, undocumented paths that
did change (`Onigiri.prototype.Component` / `Onigiri.prototype.EventEmitter`)
still work, but now emit a one-time deprecation warning — see below.

### Fixed — crashes

- **Router: form submissions always threw.** `_handleFormSubmit()` called
  `_renderContent()` with `route = null`, but `_renderContent` read
  `route.options.transition` unconditionally. Any `<form data-route>`
  submission handled by the router crashed. `_renderContent` now falls
  back to the default transition behavior when no route is available.

### Fixed — security

- **Prototype pollution in `Onigiri.extend()`.** The merge helper used by
  nearly every module (`ajax`, `pjax`, `router`, `security`, `mode`, …)
  copied every enumerable key from its source objects, including
  `__proto__`. Config merged from `JSON.parse()`'d server/user input could
  repoint an object's prototype. `Onigiri.extend()` and the new
  `Onigiri.deepExtend()` now both skip `__proto__`, `constructor`, and
  `prototype`.
- **CSRF token leakage to cross-origin URLs.** `onigiri-ajax.js`,
  `onigiri-pjax.js`, and `onigiri-router.js` all attached the CSRF token
  header/field to whatever URL they were given, with no origin check.
  All three now check `Onigiri.security.isSameOrigin()` first and skip
  the token (falling back to a normal full-page navigation for PJAX/router
  link and form handling) for anything cross-origin.
- **PJAX/router could fetch and inject cross-origin HTML.** Same root
  cause as above — a same-origin check now gates content loading, not
  just the CSRF token.
- **Router link interception ignored `target`, `download`, and non-http(s)
  schemes.** Clicking a `data-route` link that opened a new tab, pointed
  at a download, or used `mailto:`/`tel:`/`javascript:` was intercepted
  and mis-handled. These are now left to the browser's native handling.
- **Misleading `Onigiri.storage._encrypted` flag.** This existed on the
  storage config but was never implemented anywhere — it looked like an
  encryption toggle but did nothing. Removed, and replaced with an
  explicit doc comment: `localStorage`/`sessionStorage` are plain text
  and unsuitable for tokens or secrets.
- **Example app (`example/`):** two API endpoints used `$_SESSION` without
  calling `session_start()` first (CSRF verification in `contact.php` was
  always comparing against an empty session value, meaning legitimate
  requests were always rejected; the locale write in `menu.php` never
  persisted). Both now start the session. Removed the wildcard
  `Access-Control-Allow-Origin: *` from the demo menu endpoints (the demo
  is always same-origin, and it's a bad pattern to hand a session-touching
  endpoint as a "copy this" example). `menu.php` no longer echoes raw
  exception messages back to the client. Replaced `FILTER_SANITIZE_STRING`
  everywhere it appeared (`contact.php`, `set_locale.php`) — it was
  deprecated in PHP 8.1 and is removed in PHP 9.0.

### Fixed — cross-module compatibility

- **`onigiri-plugins.js` silently overwrote dedicated modules.** The
  bundled legacy "plugins" (`storage`, `router`, `animation`, `security`)
  are near-duplicates of `onigiri-storage.js`, `onigiri-router.js`,
  `onigiri-animate.js`, and `onigiri-security.js`, but with smaller,
  incompatible APIs. If both were loaded and `Onigiri.use('storage')` (etc.)
  was called, the dedicated module's implementation was replaced —
  silently, and dependent purely on load order. Each of these plugin
  installers now checks `Onigiri.modules.<name>` and refuses (with a
  `console.warn`) if the fuller module is already present.
- **`Onigiri.ajax()` broke on `FormData`.** Passing a `FormData` body (e.g.
  file uploads) was forced through `JSON.stringify()` with a hardcoded
  `Content-Type: application/json` header, silently corrupting the
  request. `FormData`, `URLSearchParams`, and `Blob` bodies are now passed
  through untouched with no forced `Content-Type`, so the browser sets its
  own (including the multipart boundary).
- **`Onigiri.prototype.Component` / `Onigiri.prototype.EventEmitter`.**
  These were factory functions living on the *instance* prototype, which
  meant every `Onigiri('.selector')` DOM-query result inherited them as
  own-feeling properties, despite having nothing to do with DOM wrapping.
  They're now static classes — `Onigiri.Component` and
  `Onigiri.EventEmitter` — matching every other module's convention
  (`Onigiri.security`, `Onigiri.storage`, `Onigiri.router`, …).
  `onigiri-humhub.js` was updated to use the new location. The old
  `Onigiri.prototype.Component` / `Onigiri.prototype.EventEmitter` paths
  still resolve (via a getter) so nothing already built against them
  breaks, but each logs a one-time `console.warn` pointing at the new
  location.
- **`onigiri-mode.js` used a shallow merge on nested config.** Calling
  `Onigiri.mode.init({ classes: { light: { bg: 'custom' } } })` used to
  wipe out the entire `classes.dark` object because `Onigiri.extend()` is
  a shallow merge. Added `Onigiri.deepExtend()` to core and switched
  `onigiri-mode.js`'s `init()` to use it, so partial nested overrides no
  longer clobber sibling keys.

### Added

- `Onigiri.deepExtend(target, ...sources)` — recursive merge for config
  objects with nested structure. Same prototype-pollution guard as
  `Onigiri.extend()`.
- `Onigiri.noConflict(alsoRestoreShortAlias = true)` — restores whatever
  previously occupied `window.Onigiri` / `window.O` and returns the
  Onigiri reference, so it can be reassigned to a custom name. Useful when
  embedding alongside another library that also claims the `O` global.
- `credentials: 'same-origin'` is now an explicit default on every
  `fetch()` call made by `onigiri-ajax.js` and `onigiri-router.js`.

### Notes for existing integrations

- If your code calls `new Onigiri.prototype.Component(...)` or
  `new Onigiri.prototype.EventEmitter(...)` directly: it still works, but
  switch to `Onigiri.Component(...)` / `new Onigiri.EventEmitter()` to
  silence the deprecation warning. `Onigiri.Component` does not require
  `new` (it always returns an explicit object).
- If you were relying on `onigiri-plugins.js`'s `storage`/`router`/
  `animation`/`security` plugins *overwriting* the dedicated modules on
  purpose (e.g. to intentionally downgrade to the simpler hash router):
  that no longer happens automatically. Don't load the dedicated module
  if you want the plugin's version, or call its `install()` function
  directly instead of through `Onigiri.use()`.

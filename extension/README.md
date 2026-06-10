# GitPulse Extension

WXT browser extension for opening GitHub pages in GitPulse.

This is an independently installed WXT package. The repository root scripts are convenience
wrappers, but a clean checkout still needs `bun install` from this directory before extension
builds or type-aware editor checks generate `.wxt` state.

## Commands

```sh
bun install
bun run build
bun run build:firefox
bun test
```

From the repository root:

```sh
bun run extension:build
bun run extension:build:firefox
bun run extension:test
```

## Release

The extension is released independently from the main GitPulse app.

- `extension/package.json` is the source of truth for the extension version.
- Create extension release tags as `extension-v<version>`, for example `extension-v0.1.0`.
- The release workflow validates that the tag version matches `extension/package.json` before
  building zip artifacts or submitting to stores.
- Main app tags such as `v0.0.5` do not publish the browser extension.

The built Chrome extension is emitted under `extension/.output/chrome-mv3`; the Firefox build is
emitted under `extension/.output/firefox-mv2`.

## Behavior

- The default GitPulse base URL is `https://gitpulse.euphony.ink`.
- On `https://github.com/*` and `https://www.github.com/*`, the content script adds a fixed
  GitPulse button.
- The button opens `<base>/dashboard?url=<current-github-url>` in a new tab.
- The popup and options page can update the stored base URL.
- HTTP GitPulse base URLs are only accepted for localhost/loopback development targets.

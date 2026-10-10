# ainkun Portfolio — Project Summary and Future Handoff

Last updated: 2026-10-10.

This is the portable project memory for future work on this website. Read it before making changes, then inspect the relevant source files. It records the current implementation, the owner's preferences, and decisions reached during the design conversation. Paths are relative to the repository root so this document works on Windows, macOS, Linux, and hosted development environments.

If the source has changed since this summary was written, reconcile the differences rather than overwriting newer work. Update this document when future changes alter the design or behavior.

**Git workflow:** Prepare commits at major changes, but always ask the owner for approval before committing. Complete and verify the changes first, then present the proposed commit. Never commit without that approval.

## 1. Owner and purpose

- **Full name:** Muhammad Hussain Kas.
- **Online identity:** ainkun.
- **Role:** Cybersecurity Analyst.
- **Hero name:** `AINKUN.` with an interactive transformation to `HUSSAIN K.`.
- **Purpose:** A personal portfolio for security work, projects, achievements, research notes, Medium articles, and social links.
- **Hosting requirement:** Easy to host on GitHub Pages, including a repository subpath, without a build pipeline or backend.

Projects, achievements, and most social URLs still contain intentional placeholders. Medium is now `https://ainkun.medium.com`, and blog articles are fetched from that account's RSS. Do not invent credentials, awards, publications, competition results, or other working social profiles.

## 2. Current design direction — preserve this

The approved direction is a calm, wholesome Japanese anime-inspired neighborhood atmosphere. The anime influence comes from the illustrated environment, typography, bilingual labels, and gentle motion.

Important preferences established by the owner:

- Do not add an extra anime character as a decorative mascot or hero illustration. Use the supplied profile avatar, `mainimage.png`. The owner subsequently authorized a nerdy adult female VTuber-style host specifically for the Blog section; this is a scoped exception, not a hero redesign.
- Favor a relaxing residential street, trees, plants, and soft natural light over a dense futuristic cyber city.
- Keep the visual identity professional and approachable. Avoid exaggerated sharp edges, aggressive blade decorations, and overly soft bubble-style lettering.
- Use meaningful Japanese words alongside English labels.
- Keep the background fixed while scrolling, including behind the final contact section.
- Place translucent section surfaces over the shared background. Do not reintroduce a separate duplicate background image in the contact section.
- Theme changes should feel slow, smooth, and natural; the background image must visibly fade too.
- The hero name should remain still on initial page load. Its letter animation is for interaction only.
- Keep the period on the text baseline at the end of both hero-name states.

The original style reference was `https://2026.ctf.sekai.team/`. Later feedback established the softer street-scene direction above; do not revert to the earlier cyberpunk direction simply because that reference appears in the conversation history.

### Typography

- **Barlow Condensed:** bold/italic hero name and condensed headings.
- **DM Sans:** body copy.
- **Noto Sans JP:** Japanese text.
- **Space Mono:** small labels, metadata, and terminal styling.

Fonts load from Google Fonts with local fallback fonts. Japanese labels include `朝` (morning), `夕暮れ` (evening/dusk), `夜` (night), `探究` (inquiry), and the existing bilingual navigation and section headings.

## 3. Page structure and implemented features

The main page is `index.html`.

- Desktop navigation uses a fixed left sidebar with the logo and bilingual chapter links.
- On smaller screens, navigation becomes a fixed horizontal header.
- Three theme buttons and a live PKT clock sit at the top right.
- The hero contains the animated name, real full name and role, editable introduction, calls to action, and the supplied avatar in a lightly tilted card.
- Clicking or tapping that avatar opens a collectible analyst card with a flip-and-zoom animation, centered across the full viewport. Its content is editable in `profile.js`.
- Three chapter cards link into the portfolio content.
- Homepage sections: Home, About Me, Projects, Achievements, and Connect. Blog & Field Notes lives on a separate `blog.html` page; both the sidebar and homepage chapter tile link there in the same tab.
- About includes skill chips and a decorative terminal-style panel.
- Projects, achievements, and social links are rendered from `profile.js`. Blog articles come from `data/medium.json`, fetched from Medium RSS by `scripts/refresh_medium.py`.
- Empty URLs produce a clear coming-soon notice; usable links are validated before being assigned.
- Additional interactions include scroll reveals, active-section navigation, subtle particles, avatar pointer tilt, and a motion pause button.
- Keyboard focus states, accessible control labels, a skip link, reduced-motion support, and responsive layouts are present.

### Blog implementation handoff

- `blog.js`/`blog.css` own the Medium shelf and nerdy adult female VTuber-style host. Navigation says BLOG and links to `blog.html`. That page retains `#writing` as its article section ID. The browser loads `data/medium.json` on page entry, with a five-minute cache, shared in-flight request, ten-second timeout, retry state, and a visible sync date. Articles use safe text nodes, HTTPS Medium links, lazy images, and native new-tab navigation.
- `scripts/refresh_medium.py` fetches `https://ainkun.medium.com/feed` with Python's standard library, extracts ten recent titles/URLs/dates/thumbnails/tags/short excerpts, and atomically writes the JSON. The current snapshot contains ten real articles, including DLL Injection and DLL Hijacking — OneDrive. It does not fabricate posts or embed full RSS article HTML. `--direct` bypasses a broken environment proxy; `--allow-stale` retains the bundled feed if a refresh fails.
- `.github/workflows/pages.yml` refreshes on push to main, manual dispatch, and daily around 08:17 PKT, then stages the static site with `scripts/build_site.py` and deploys it. **No automated Git commits.** The user must select GitHub Actions as the Pages source to enable this. No workflow has been pushed or run remotely in this session. Branch-based Pages/other hosts need manual JSON refreshes. Localhost serves the bundled feed without contacting Medium itself.
- The blog-only generated transparent character is `assets/blog/nerd-female-host.png` (1024 x 1536 RGBA). The current host is based on the supplied `nerd-female-character.jpeg`: glasses, high ponytail, and a cream lab coat with sage accents. The user replaced the earlier male host while preserving the large waist-up framing. She rises from below the bottom-right edge, stays visible during scrolling, and slides below the window when leaving. `.blog-guide-portrait` clips the lower body at the window bottom; desktop height is min(53svh,460px), mobile min(34svh,285px). Portrait width is 84% of this height, so the full image extends below the visible frame. A six-second subtle breathing animation respects reduced/paused motion. The speech bubble sits to the left of her head, and the host never intercepts clicks.
- All three host images are horizontally mirrored with `scaleX(-1)` on `.blog-guide-portrait`, separate from the breathing/exit transform. Morning uses `nerd-female-host.png`; evening uses `nerd-female-evening.png`; night uses `nerd-female-night.png` with sleepy eyelids and moonlight. A MutationObserver follows `html[data-theme]` for PKT and manual switching. The incoming image must decode before switching; request versions ignore stale loads, failures preserve the visible portrait, and opacity fades share `--theme-fade-duration` (3.2s). Prompts: `assets/blog/THEME-HOST-PROMPTS.md`.
- Entry says `こんにちは！ / Konnichiwa!`; exit says `ありがとうございます！ / Arigatou gozaimasu!`. The user rejected the childlike delivery; the active greetings now use softer mature female synthesized speech, **VOICEVOX:冥鳴ひまり**, normal style (speaker 14). Local files: `assets/blog/adult-female-konnichiwa.mp3` (~0.90s) and `assets/blog/adult-female-arigatou-gozaimasu.mp3` (~1.40s). Both fit the 1.75-second farewell delay. Retain visible VOICEVOX credit and the terms in `assets/blog/CREDITS.md`. No runtime TTS dependency. Earlier recordings and artwork remain only as design history.
- Following a portfolio navigation link or a Medium link dismisses the host once. Ordinary same-tab portfolio navigation waits 1.75 seconds for the farewell; article/new-tab links, downloads, and modifier keys retain native behavior. Scrolling does not dismiss the host. A Medium click suppresses reentry until a new visit/return; normal link behavior and modifier keys are preserved. Rapid returns cancel stale exit timers; new speech cancels previous speech. The voice toggle remembers its state in sessionStorage. A blocked playback changes the control to Enable voice. Reduced/paused motion removes sliding, independently of voice mute.
- Browser autoplay can block sound on a first page visit; the visible greeting still works, and clicking Enable voice plays it. Actual visual/audio browser verification remains outstanding because the available automation tool cannot start with the installed Node runtime.

## 4. Morning, evening, and night themes

The initial theme follows **Pakistan Standard Time**, using `Intl.DateTimeFormat` with `timeZone: 'Asia/Karachi'`. It must not depend on the visitor's local timezone.

| Theme | Automatic PKT schedule | General palette | AINKUN text and logo color |
| --- | --- | --- | --- |
| Morning / 朝 | 05:00–16:59 | Cream and sage green | `#304e38` — deep green |
| Evening / 夕暮れ | 17:00–19:59 | Warm parchment and terracotta | `#6b402e` — warm brown |
| Night / 夜 | 20:00–04:59 | Indigo, soft sage, and warm amber | `#e5ebd8` — pale cream |

This is a fixed schedule, not an astronomical sunrise/sunset calculation.

### Theme controls and state

- Morning, Evening, and Night buttons manually preview their respective themes.
- `Use PKT time` restores automatic mode.
- Manual selection lasts for the current page session. Reloading returns to the current PKT theme; no saved theme preference is stored.
- Automatic mode checks the time every minute and when the tab becomes visible again.
- The clock always shows Pakistan time, including during manual previews.
- `themes.js` runs early in the document head to select the initial theme before first paint and preload that scene.
- Without JavaScript, the morning theme is the fallback.

### Background artwork

| Asset | Purpose |
| --- | --- |
| `assets/morning-street.png` | Approved original morning scene, preserved unchanged |
| `assets/evening-street.png` | Sunset edit of the same street |
| `assets/night-street.png` | Night edit of the same street |

All three are 1672 × 940 PNGs. The scene includes the same residential street, trees, houses, bicycle, shop, plants, and viewpoint. Evening and night were generated from the morning reference; they preserve the composition closely but may contain small generated detail differences.

### Current transition implementation

**Current duration: 3.2 seconds**, with `cubic-bezier(.4,0,.2,1)` easing.

- Images load and decode before the new scene and palette are applied.
- A fixed `.scene-stack` holds background layers. The incoming `.scene-layer.scene-arriving` plays the explicit `scene-crossfade` opacity keyframe from 0 to 1.
- The previous scene remains underneath during the fade. Rapid selections preserve the existing blend while another scene fades in above it.
- Completed animations retire earlier layers. A timeout also cleans up when animation completion events do not fire.
- The original `body::before` background is a fallback and is hidden once the scene stack is active.
- Registered color properties in `theme-motion.css` blend text, logo, panels, borders, gradient stops, and translucent overlays together.
- OS reduced-motion preferences and the motion pause control make theme changes immediate.
- Request tracking prevents slow or stale image loads from overriding the latest choice.

**Keep these timing values synchronized:** `fadeDuration = 3200` in `themes.js` and `--theme-fade-duration: 3.2s` in `theme-motion.css`.

Earlier iterations used 2.2 seconds and an opacity transition started with a layout flush. The owner reported that the background also needed to transition slowly. The current version uses a dedicated 3.2-second keyframe animation instead. Preserve that correction.

## 5. Hero name animation

Resting state: **`AINKUN.`**

Hovered/revealed state: **`HUSSAIN K.`**

The animation reuses the actual letter groups:

1. `UN` fades out.
2. `HUSS` appears before `AIN`.
3. The existing `AIN` and `K` move into their new positions.
4. A space opens before `K`.
5. The period remains visible at the end, aligned to the text baseline.

Moving the mouse away reverses the animation. Keyboard focus also reveals the alternate name, and touch/keyboard activation supports toggling.

Current letter movement lasts **1.3 seconds**, with a **0.65-second opacity fade** and small staggered delays. `fitName()` measures glyph widths and fits both states within the available width, updating for font loading and resizing.

The heading must not animate in during page load. The hero-copy entrance animation was removed, and the `name-animating` class is enabled only for an interaction. Initial layout/font fitting should stay still. Reduced-motion and paused-motion states remove these transitions.

Implementation: `index.html` markup, the name-related rules in `styles.css`, and the final name-animation block in `script.js`.

### Collectible analyst card popup

Keep the original profile card directly clickable, with no visible "View Analyst Card" button or label. The transparent native button remains for keyboard accessibility.

Keep the original profile card at its original natural size from `styles.css`, fitted to `mainimage.png`; the owner rejected the taller 3:5 version. Measure the original card on opening/resizing and apply its ratio to the popup through `--analyst-card-ratio`. Animate a single uniform scale, never independent width/height scaling. The front clone retains the original card's measured layout size and scales as a whole, preventing image/text reflow at the start and end of the flip. The shorter detail face has no "Let's connect" button, and its artwork fills the available space. It scrolls internally if edited content exceeds the available height.

**Passive interaction hint:** Every 10 seconds between starts, the main-page card turns through 360° on a diagonal `(1,1,0)` axis, with perspective viewed from the upper middle. Its center and original size stay in place. The animation is a continuous three-second rotation with linear timing and no pause at the reverse; the owner rejected the earlier two-second version with a one-second back hold. A decorative, inert copy shows the actual editable detail face; the real native button stays clickable throughout. No visible CTA label is added. `hintInterval` in `analyst-card.js` controls the cadence; `profile-hint-turn` in `analyst-card.css` controls the rotation. Hints stop for the modal, paused/reduced motion, hidden tabs, and cards less than halfway visible, then wait a fresh 10 seconds when eligible again. Clicking during a hint clears it before opening the modal. Resize cancels the current hint, and a 3100ms animation-end fallback restores the original if the event is missed.

The owner later requested a Pokémon-style detail card, designed in code so its skills and other information remain editable. This is an approved use of additional supplied artwork inside the popup, not a new decorative character on the main page.

- `card-design-reference.jpeg` supplies the layout inspiration: corner portrait, large art window, identity/stat header, ability and skill rows, and a compact footer.
- `card-back-main-clip.mp4` is the central artwork video, with `card-main-image.jpeg` as its poster/fallback; `card-top-left-small.jpeg` is the small upper-left portrait. Use these exact supplied files rather than generating replacements. Do not infer the real identity of the person in the portrait.
- `analystCard.mainVideo` selects the optional muted, zero-volume, inline looping video. It plays during the popup and passive flip preview, and pauses when closed, the tab is hidden, or motion is disabled. Media errors reveal the original image. The Pages build includes the MP4.
- The `analystCard` object in `profile.js` controls all card copy, artwork paths/crop, ability, techniques, traits, decorative stat, card number, and footer. Defaults reuse the site's interests and skills; the infinity stat is decorative, not a claim of competence.
- `analyst-card.js` builds the card with DOM text nodes and adds an accessible overlay button to the existing hero figure. `analyst-card.css` supplies the trading-card border, theme-aware surfaces, layout, and animation.
- A native `<dialog>` opens above the entire website, not just the main column. The original profile face is cloned for the flip; the detail face appears on its reverse. The opening travels/scales from the source card and rotates over 1.15 seconds; closing reverses over 0.85 seconds.
- Escape, the close button, and outside clicks close it. Native modal behavior contains focus; the script locks background scrolling and restores focus/visibility to the original avatar.
- Short viewports scroll inside the dialog. Resizing and reduced-motion changes settle an in-progress animation; reduced/paused motion opens and closes immediately.
- Tests in `tests/analyst-card.test.cjs` cover eleven scenarios, including proportional desktop/mobile geometry, modal behavior, hint timing, click interruption, visibility/motion suspension, silent video playback, and media fallback. Actual browser rendering and native focus containment still need visual/browser QA.

## 6. Selected logo and theme versions

**Current approved logo source:** `assets/logo-clean/ainkun-clean.png`.

It is a transparent 1536 × 1024 PNG, based on `ainkunlogo-reference.png`. It retains the reference's green italic `a刀` design, with these requested edits:

- Remove the yellow/gold diagonal line entirely.
- Shorten and soften the sharp projecting end of `刀` near its junction with `a`.
- Preserve the rest of the chosen design.

The owner rejected the earlier generated alternatives and returned to this reference. Do not substitute a rejected option or restart the earlier logo exploration without a new request.

### How the three logo versions work

The website uses the **same PNG alpha shape for all three themes**. CSS masks tint it with `var(--title)`, the exact color used by the AINKUN heading. This keeps the geometry identical across themes and avoids color-only image generations drifting in shape.

There are not three separate recolored PNG files in the current implementation. The three versions are rendered through CSS. If standalone recolored downloads are requested later, that would be additional work.

The top-left link remains accessible through its label. The original image provides a fallback where masking is unsupported; night has a light-image fallback. The old pale rectangular background behind the night logo was removed.

Useful previews:

- `logo-clean.html`: cleaned source logo and download.
- `logo-themes.html`: morning, evening, and night logo colors beside matching AINKUN text samples.

The main site already uses this cleaned logo and its theme colors. Logo selection is no longer pending.

## 7. Design history and reference files

These files preserve earlier directions and are useful context, but are not the current design specification:

| File or page | Role/status |
| --- | --- |
| `mainimage.png` | Supplied profile avatar; currently used |
| `example1.jpeg` | Relaxing street-scene reference |
| `example-logo.png` | Earlier logo reference |
| `ainkunlogo-reference.png` | Reference selected for the cleaned final logo |
| `take-logo-position-and-size.png` | Separate, nearly equal-size character layout explored and later rejected |
| `assets/cyber-city.png` | Earlier futuristic background, archived |
| `assets/ainkun-logo.png` | Earlier active logo with the gold accent, archived |
| `logo-options.html` | Six earlier softer/rounded concepts |
| `logo-subscript.html` | Six earlier professional concepts with a smaller lower-right 刀 |
| `logo-reference-options.html` | Six reference-based variants with diagonal accents |
| `logo-separated.html` | Six separate-character typographic variants |

The owner initially explored smaller subscript `刀` arrangements, then nearly equal-size separate characters, and ultimately chose the cleaned original reference. The last decision supersedes those earlier requests.

Some chat messages reported that a local image could not be read, but the named references were subsequently found in the project folder. If an attachment appears missing in a future session, check the actual project files before assuming it is unavailable.

Generated artwork was created with the built-in imagegen tool. Final assets were copied into the project, so the site does not rely on machine-specific generated-image directories. Prompts and artwork notes are retained in:

- `assets/ARTWORK.md`
- `assets/morning-street-prompt.md`
- `assets/day-scenes.md`
- `assets/logo-clean/PROMPT.md`
- The `PROMPTS.md` files within the historical logo asset directories

## 8. Source file map

| File | Responsibility |
| --- | --- |
| `index.html` | Main structure, hero letter groups, scene container, navigation, theme controls, stylesheet/script loading |
| `profile.js` | Editable biography, skills, social links, projects, achievements, blog display settings |
| `blog.html`, `blog.js`, `blog.css` | Separate Medium article page and bottom-right female host greetings |
| `data/medium.json` | Real Medium RSS snapshot; ten recent article summaries |
| `scripts/refresh_medium.py` | Fetch and sanitize the public RSS feed |
| `scripts/build_site.py`, `.github/workflows/pages.yml` | Stage/deploy static Pages files with daily feed refresh; no automatic commits |
| `assets/blog/` | Transparent host, local greeting audio, and source credits |
| `tests/blog.test.cjs`, `tests/test_medium.py` | Blog interaction and RSS-parser checks |
| `script.js` | Content rendering, link handling, notices, reveals, particles, portrait tilt, motion control, scroll spy, hero-name interaction |
| `styles.css` | Layout, responsive rules, component styling, typography, hero-name animation |
| `themes.js` | PKT schedule, early theme initialization, image loading/decoding, crossfade layers, manual/automatic state |
| `themes.css` | Three palettes, scene references, logo masks/colors, theme-control styling; also shared preview palettes |
| `theme-motion.css` | Registered palette colors, 3.2-second theme interpolation, fixed scene layers, background keyframes, motion-preference overrides |
| `analyst-card.css` | Collectible card styling, modal layout, flip/zoom animations, and responsive/motion handling |
| `analyst-card.js` | Editable card rendering, modal lifecycle, close/navigation actions, and focus restoration |
| `tests/themes.test.cjs` | Node tests for theme timing, loading, state, fades, and motion behavior |
| `tests/analyst-card.test.cjs` | DOM-model tests for popup interaction and cleanup |
| `README.md` | Windows/macOS/Linux localhost commands, Git or browser uploads, GitHub Pages setup, future publishing, troubleshooting, and customization |
| `SUMMARY.md` | This portable handoff and decision history |
| `.nojekyll` | GitHub Pages static-site support |
| `assets/favicon.svg` | Existing favicon; separate from the cleaned main logo |

Both pages load `styles.css`, `themes.css`, and `theme-motion.css`, with `themes.js` early in the head. The homepage then loads `analyst-card.css`, with deferred `profile.js`, `script.js`, and `analyst-card.js`. The blog instead loads `blog.css`, with deferred `profile.js` and `blog.js`; do not load homepage scripts there. Blog JS owns its motion toggle and footer year. Homepage chapter tracking filters local hash links so the separate Blog page link cannot break scrolling.

## 9. Content still to personalize

`profile.js` currently has:

- An editable cybersecurity introduction and about paragraph.
- Six suggested skill labels: threat analysis, network security, security research, incident response, Linux, and Python. These are editable suggestions, not verified credentials.
- Three project placeholders: Threat investigation, Security lab, Tools & automation.
- Three achievement placeholders: certification, competition/CTF, research milestone.
- Blog writing placeholders have been replaced with the real Medium feed.
- Empty GitHub, LinkedIn, X, and email fields; Medium is configured.

Use complete HTTP(S) URLs for social/project/article links and a plain email address in the email field. Confirm owner-supplied facts before turning placeholders into claims.

## 10. Run and host in any environment

This is plain HTML, CSS, and JavaScript. There is no package installation, framework, database, authentication service, or build step. Node is only needed for development checks. Artwork is local; Google Fonts is the external font dependency.

From the repository root:

```sh
python -m http.server 8000
```

Use `python3` instead of `python` where appropriate. Open `http://localhost:8000/`. Any static HTTP server can be used instead; a previous session's localhost process or port is not guaranteed to remain available.

Opening `index.html` directly is possible, but a local server is preferable for checking image loading, fonts, masks, and transitions.

For GitHub Pages, publish the repository root containing `index.html`, `.nojekyll`, the JavaScript/CSS files, and the required images. Keep asset URLs relative so a repository subpath works. See `README.md` for the publishing steps. No deployment or public live URL has been confirmed in this conversation.

Do not hardcode the original workstation path or rely on session-specific tool IDs. Preserve UTF-8 when editing Japanese text. Use the repository files as the portable source of truth.

## 11. Verification status and limits

The latest blog update passed **all 34 checks: 10 theme, 9 collectible-card, 11 blog, and 4 RSS-parser tests**, plus JavaScript syntax checks. Local HTTP checks returned 200 for the feed, character, audio, and new scripts/styles. Static Pages staging succeeded; remote deployment has not been performed. Commands:

```sh
node tests/themes.test.cjs
node tests/analyst-card.test.cjs
node tests/blog.test.cjs
python tests/test_medium.py
node --check blog.js
node --check themes.js
node --check script.js
node --check analyst-card.js
```

The test file runs directly with Node's test API. In the previous restricted Windows environment, `node --test ...` encountered a child-process `EPERM`; direct execution worked. This is an environment detail, not a hosting dependency.

Coverage includes PKT time boundaries, initial preload, rapid selection races, manual/automatic mode, load failure/retry, crossing a time boundary during loading, layer cleanup, reduced/paused motion, and waiting for image decoding.

Local HTTP asset checks, PNG transparency/dimensions, CSS variable references, and JavaScript syntax were also checked during development. Core text contrast was checked for the three final palettes earlier in the work.

**Browser visual verification remains outstanding for the latest theme transitions and collectible-card popup.** The browser service reported no available browser, including when checked during the popup implementation. The automated tests model DOM behavior; they do not prove actual browser rendering, native dialog focus containment, frame smoothness, responsive layout, or font appearance.

During the passive-flip update, computer-use verification was also attempted but its JavaScript tool could not start: the installed Node v22.18.0 is below its required v22.22.0. No visual confirmation of the diagonal flip has been made. Check the continuous three-second 360° turn, return to the front, and click handling during the hint when a browser tool is available.

When a browser is available, verify:

1. Initial PKT theme appears without an unwanted morning flash.
2. All three scene images visibly crossfade over 3.2 seconds with the colors.
3. Rapid switching never flashes a stale image or removes the incoming layer.
4. The fixed background remains visible behind the translucent contact section at the bottom.
5. The logo matches the hero name color in all themes.
6. `AINKUN.` stays still on load, transforms smoothly on interaction, and keeps a baseline period.
7. Mobile header controls fit, navigation works, and the longer name does not overflow.
8. Reduced-motion and pause controls behave correctly.
9. The collectible card opens from the avatar, flips to the supplied artwork/details, fits or scrolls on small screens, contains keyboard focus, and restores the avatar on close.

Older gallery captions may contain stale descriptions or encoding-damaged punctuation/Japanese labels. The README's damaged theme labels and outdated logo-selection notes were corrected when its setup instructions were expanded. The current source, README, and this summary establish that the cleaned reference logo is selected and installed.

## 12. How to continue future work

- Start from the current implementation, not an earlier rejected design.
- Read this summary plus the files relevant to the requested change.
- Preserve the approved street art, selected logo shape, exact theme title/logo colors, fixed-background behavior, and interaction-only hero animation unless the owner asks to change them.
- Keep enhancements compatible with static GitHub Pages hosting.
- Reuse existing theme variables instead of adding hardcoded colors to individual components.
- Keep background fade timing and cleanup timing synchronized when adjusting animation speed.
- Run checks appropriate to the change and report any inability to perform browser verification honestly.
- Update this summary after substantive changes so future sessions have accurate context.

A future session can be started with: **“Read SUMMARY.md in this project, inspect the current files, and continue with the following update: …”**

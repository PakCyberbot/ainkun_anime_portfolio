# ainkun — Cybersecurity Portfolio

An anime-inspired, responsive portfolio for **ainkun**. Plain HTML, CSS, and JavaScript: no build, installation, or framework required. Features three matching morning, evening, and night neighborhood panoramas that stay fixed behind the full page, bilingual Japanese/English navigation, warm cream and sage-green game-menu panels, your profile avatar, sunlit drifting particles, scroll reveals, a translucent final contact section, and system reduced-motion support. Respects reduced-motion preferences.

**Start here:** [Run on localhost](#run-on-localhost) · [Publish on GitHub Pages](#publish-on-github-pages) · [Update the live website](#update-the-live-website) · [Troubleshooting](#troubleshooting)

For the complete design history, approved choices, file map, and future handoff, read [SUMMARY.md](SUMMARY.md).

When working with an assistant, ask the owner before making Git commits. Complete and validate major changes, then request approval for the concrete commit.

## Customize

Hover over the hero name to transform `AINKUN` into `HUSSAIN K`, keeping the final dot. The shared `AIN` and `K` move into place while `UN` fades out and `HUSS` appears. Moving away reverses it. Keyboard focus reveals the name, and mobile taps toggle it. The heading fits both names to the available width and respects the motion pause button and reduced-motion preferences.

Click or tap the hero avatar card to open an editable collectible analyst card. It flies from the avatar, grows into the center of the whole window, and flips to its detailed side. Escape, the close button, or a click outside reverses the animation. The popup traps focus through a native modal dialog, locks page scrolling, and restores focus to the avatar when closed. Short windows can scroll within the popup.

Every 10 seconds while visible, the avatar gives a subtle preview: a continuous diagonal 360° turn in place over three seconds, with no pause at the reverse. The turn uses a constant angular speed, preserves the original size, and remains clickable. It stops while the popup is open, the tab is hidden, the card is off-screen, or motion is reduced/paused.

### Edit the collectible card

Change the `analystCard` object in [profile.js](profile.js). The card is built in HTML/CSS; its text is not baked into an image.

| Field | What it changes |
| --- | --- |
| `name`, `japaneseName`, `stage`, `role`, `type`, `number` | Identity, classification, and card number |
| `statLabel`, `statValue` | Decorative header stat; currently curiosity/infinity, not a skill rating |
| `mainImage`, `mainImageAlt`, `imagePosition` | Optional central artwork (empty disables it), description, and crop position |
| `mainVideo` | Optional silent looping video; uses `mainImage` as its poster and fallback only when set |
| `portraitImage`, `portraitImageAlt` | Small top-left portrait |
| `ability.title`, `ability.description` | Featured ability heading and copy |
| `techniques` | Editable skill rows with `symbol`, `title`, `description`, and `tag` |
| `stats` | Specialty labels shown in the STATS grid |
| `traits` | Optional footer details with `label` and `value` |
| `motto`, `edition` | Collection motto and footer |

The central art plays `card-back-main-clip.mp4` silently in a loop, without a poster or background image. It plays only while the popup or flip preview is visible, and pauses when hidden or motion is disabled. The corner portrait is `card-top-left-small.jpeg`. `card-design-reference.jpeg` is the visual reference, not the rendered card. The card follows the current theme and respects reduced/paused motion. Layout and interaction live in `analyst-card.css` and `analyst-card.js`.

### Edit the portfolio content

Edit **`profile.js`** to change the biography, skills, projects, achievements, blog display settings, and social URLs. Projects and achievements contain owner-supplied work and results. Project or achievement entries without a supplied URL have no link; they are not labeled as placeholders. Set `project.placeholder: true` only for a future placeholder entry. Social links are configured for [Medium](https://ainkun.medium.com/), [GitHub](https://github.com/ainkun), [LinkedIn](https://www.linkedin.com/in/ainkun/), [X](https://x.com/ain__kun), and `contact@ainkun.com`.

### Medium blog and VTuber-style host

The **Blog** navigation item and homepage chapter tile open the separate `blog.html` page in the same tab. The page shares the portfolio sidebar, fixed background, and all three local-time themes. It shows up to ten real articles from [ainkun's Medium RSS feed](https://ainkun.medium.com/feed), with cover images, dates, short excerpts, and links that open on Medium. `blog.maxPosts` and `blog.feed` live in `profile.js`.

On opening the blog page, a large teenage male anime host based on `mainimage.png` rises from below the bottom-right edge with **こんにちは / Konnichiwa**. Following a portfolio navigation link or clicking a Medium link triggers **ありがとうございます / Arigatou gozaimasu**, then he slides down. Voice can be muted independently of motion; its preference lasts for the tab session. Browsers may block audio before interaction; the voice button changes to **Enable voice** if needed. Only his upper body is visible, with the lower body cropped outside the window. The host uses 43% of the viewport height on landscape screens, and up to 27.5% on square or portrait screens. Viewport sizing keeps the character steady through browser zoom. The speech bubble sits close beside the character in the artwork's empty left margin, or above it on square and portrait screens; viewport units keep its width, text and padding visually consistent during both zoom-in and zoom-out. A subtle breathing motion keeps the portrait relaxed. Reduced/paused motion removes both the sliding and breathing animations. The host stays visible while scrolling the blog and is exclusive to this page. Ordinary portfolio navigation waits 1.75 seconds for the farewell; Medium links and modified clicks keep their native behavior.

The browser fetches the same-origin `data/medium.json` on entry and caches it for five minutes. `scripts/refresh_medium.py` reads Medium's RSS to produce that file; it does not copy full articles or require a public CORS proxy. The checked-in snapshot contains real fetched articles, and its sync date is displayed. This follows [Medium's supported RSS format](https://help.medium.com/hc/en-us/articles/214874118-Using-RSS-feeds-of-profiles-publications-and-topics).

To refresh articles locally or on another static host:

```sh
python scripts/refresh_medium.py
```

Use `python3` on macOS/Linux or `py` on Windows if needed. If an obsolete environment proxy prevents the connection, `--direct` ignores proxy variables for this request. `--allow-stale` retains the bundled snapshot with a warning if Medium is unavailable. A simple localhost server does not refresh Medium by itself.

The included GitHub Pages workflow refreshes the feed on pushes to `main`, manual runs, and daily around **08:17 PKT**. Refreshes go into the deployment artifact; **the workflow makes no Git commits**. Enable it as described below. Other hosts and branch-based Pages deployments must refresh and upload the JSON manually.

Character and audio files are in `assets/blog/`. The teenage host matches `mainimage.png` with tousled black hair, glasses, gray-green eyes and a dark hoodie. Three portraits cover the themes: `teen-host.png` (morning), `teen-evening.png` (sunset), and `teen-night.png` (sleepy). All three use their source orientation, horizontally flipped from the previous displayed version. Portraits follow automatic local-time and manual theme changes, crossfading over 3.2 seconds after the incoming image decodes; rapid changes keep the latest selection. Youthful male greetings are synthesized with **VOICEVOX:白上虎太郎**, saved locally as `teen-konnichiwa.mp3` and `teen-arigatou-gozaimasu.mp3`. No external speech service is needed during playback. See [asset credits](assets/blog/CREDITS.md) and [the generation prompts](assets/blog/TEEN-HOST-PROMPTS.md). Keep the VOICEVOX credit when reusing the audio. Previous variants are retained as design history.

- Set `socials.github`, `medium`, `linkedin`, and `x` to complete `https://...` URLs.
- Set `socials.email` to your plain email address, or leave it empty.
- Add real project, article, and verification URLs to each item's `url` field.
- Edit `index.html` for fixed headings, name references, and page metadata.
- Edit component and animation styles in `styles.css`; edit the three coordinated palettes in `themes.css`.
- Replace `mainimage.png` to update your profile image. Keep that file in the repository root when uploading to GitHub. Its original image is displayed without modifications.
- The selected top-left logo uses `assets/logo-clean/ainkun-clean.png`. CSS tints its transparent shape with the exact AINKUN heading colors: deep green (`#304e38`) in morning, warm brown (`#6b402e`) in evening, and pale cream (`#e5ebd8`) at night. Compare them at [logo-themes.html](logo-themes.html). A single image keeps the shape identical in all versions. The edit prompt is in `assets/logo-clean/PROMPT.md`; the earlier logo remains archived at `assets/ainkun-logo.png`.
- Six softer logo alternatives can be compared at `logo-options.html`; each has its own transparent PNG and download link. Review `assets/logo-options/PROMPTS.md` for their design directions.
- The newer professional variants with a small subscript `刀` can be compared at `logo-subscript.html`. Their transparent PNGs and complete generation prompts are in `assets/logo-subscript/`.
- Earlier concepts based on `ainkunlogo-reference.png` are archived at `logo-reference-options.html`, with PNGs and prompts in `assets/logo-reference-options/`. These alternatives are not the selected logo.
- The separate-character concepts based on `take-logo-position-and-size.png` are archived at `logo-separated.html`. Their PNGs and prompts are in `assets/logo-separated/`. The final choice returned to the cleaned original reference instead.
- The street backgrounds are `assets/morning-street.png`, `assets/evening-street.png`, and `assets/night-street.png`. The original morning is unchanged; the two new images are edits of it. See `assets/day-scenes.md` for the full prompts and `assets/morning-street-prompt.md` for the original reference. The earlier `assets/cyber-city.png` is preserved.

The fonts load from Google Fonts; local fallback fonts keep the page usable offline. All other assets are local. No analytics or tracking scripts are included.

## Time-of-day themes

The website chooses its initial theme using **the visitor's device time and local timezone**, without requesting location access:

| Theme | Local time | Palette |
| --- | --- | --- |
| Morning / 朝 | 05:00–16:59 | Cream and sage |
| Evening / 夕暮れ | 17:00–19:59 | Warm parchment and terracotta |
| Night / 夜 | 20:00–04:59 | Indigo, soft sage, and warm amber |

Use the three buttons at the top right to preview any scene. **Use local time** returns to automatic mode. A preview lasts until you return to automatic mode or reload the page; no preference is stored. Automatic mode refreshes every minute and when you return to the tab. The clock always displays the visitor's local time. This is a fixed daily schedule, not a sunrise/sunset calculation.

`themes.js` sets the initial theme before the page is painted and preloads only its background. Theme changes load and decode their image before blending the street scene and matching palette over 3.2 seconds with gentle easing. The incoming background uses an explicit opacity keyframe animation so the fade starts reliably even when the browser batches updates. Layered backgrounds preserve an in-progress blend during rapid clicks, and older requests cannot replace the latest choice. `theme-motion.css` animates the palette colors, including the logo, title, gradients, and translucent panels. System reduced-motion preferences make theme changes immediate. If a preview fails to load, the current theme remains available. Without JavaScript the morning palette is the fallback. All three images stay fixed during scrolling, with translucent section backgrounds above them.

To change the schedule, edit `themeForDate()` in `themes.js`. To replace an image, update its entry in both `themes.js` and `themes.css`. Keep their relative paths for GitHub Pages. Run `node tests/themes.test.cjs` to check timezone boundaries and preview behavior; Node is only needed for development checks, not hosting.

## Run on localhost

### Requirements

- A modern browser.
- Python 3 for the local server, or any static HTTP server you already use.
- Git and a GitHub account if you choose command-line publishing.
- Node.js only if you want to run the optional development checks.

There is no `npm install` or build command. Python serves the existing files; it is not part of the deployed website.

### 1. Open the project folder

Download and extract the project, or clone your existing repository:

```sh
git clone https://github.com/YOUR_USERNAME/AinKun-Portfolio.git
cd AinKun-Portfolio
```

Replace `YOUR_USERNAME` and the repository name with your own. If you already have the files, open a terminal in the folder containing `index.html`.

### 2. Start the server

**Windows — PowerShell or Command Prompt:**

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

If `py` is unavailable but Python is installed, use:

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

**macOS or Linux:**

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

### 3. Open and edit the site

Visit **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)**. Keep the terminal running while you browse. Save your changes and refresh the page to see them; this simple server does not automatically reload the browser.

Use the top-right theme buttons to check all three scenes. Additional preview pages:

- [Three logo colors](http://127.0.0.1:8000/logo-themes.html)
- [Cleaned logo and download](http://127.0.0.1:8000/logo-clean.html)

Press **Ctrl+C** in the server terminal to stop it. If port 8000 is occupied, use `8001` in the command and open `http://127.0.0.1:8001/` instead.

Use the localhost server; opening `index.html` directly can block the blog's JSON fetch under browser file-access rules.

## Publish on GitHub Pages

### 1. Create the repository

On GitHub, create a repository named `AinKun-Portfolio`, or choose another project name. For the free public-repository route, choose **Public**. A repository called `YOUR_USERNAME.github.io` instead creates an account-level site. See [GitHub's site creation guide](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

For the first-time Git upload below, create an **empty repository**: leave GitHub's README, license, and `.gitignore` initialization options off because your local project already contains files.

### 2. Upload the project — choose one method

**Option A: Git, convenient for repeated updates**

Install Git and run these commands from the folder containing `index.html`. These initialization commands are for a local folder that is not already a Git repository:

```sh
git init -b main
git add .
git commit -m "Add ainkun portfolio"
git remote add origin https://github.com/YOUR_USERNAME/AinKun-Portfolio.git
git push -u origin main
```

Replace the remote URL with the one shown by your GitHub repository. Complete GitHub authentication through your Git client when prompted. If you cloned an existing repository, skip initialization and adding `origin`; use the update commands below. This follows [GitHub's guide to uploading local code](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github).

**Option B: GitHub's browser upload**

Open your repository's upload-files screen, drag in the project contents, and commit the upload. Preserve the folder structure and include the empty `.nojekyll` file; enable hidden-file visibility in your file picker if needed.

Upload the **contents** of the project folder, so `index.html` appears at the repository root rather than inside an extra `AinKun-Portfolio` folder. Uploading all project files preserves the documentation and design galleries too.

The main website's files should be arranged like this:

```text
repository-root/
├── index.html
├── blog.html
├── styles.css
├── themes.css
├── theme-motion.css
├── analyst-card.css
├── analyst-card.js
├── blog.css
├── blog.js
├── profile.js
├── script.js
├── themes.js
├── mainimage.png
├── card-main-image.jpeg
├── card-back-main-clip.mp4
├── card-top-left-small.jpeg
├── .nojekyll
├── README.md
├── SUMMARY.md
├── data/medium.json
├── scripts/refresh_medium.py
├── scripts/build_site.py
├── .github/workflows/pages.yml
└── assets/
    ├── favicon.svg
    ├── morning-street.png
    ├── evening-street.png
    ├── night-street.png
    ├── blog/                 # Character, two MP3s, and asset credits
    └── logo-clean/
        └── ainkun-clean.png
```

Keep the other preview HTML pages, reference images, tests, and historical asset folders as well if you want their existing links to remain usable.

### 3. Enable Pages

1. Open the repository's **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Open **Actions → Refresh Medium and deploy portfolio → Run workflow** on `main`. Later pushes and the daily schedule run it automatically. If you use another default branch, update `branches: [main]` in `.github/workflows/pages.yml`.
4. Check the deployment status in **Actions**. Once it completes, return to Pages and use **Visit site**.

Upload the files first, including the `.github` directory. The workflow fetches public RSS, stages only public site files in `_site/`, and publishes using GitHub's standard Pages actions. It requires no API key or custom secret and never writes commits. Scheduled runs may be delayed; a refresh failure keeps the bundled feed and logs a warning. See [GitHub's custom Pages workflow instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

For manual feed updates instead, omit/disable the custom workflow, select **Deploy from a branch → main → / (root)**, and run `python scripts/refresh_medium.py` before uploading updated files. Both methods serve the same static website.

### 4. Open the published site

| Repository name | Typical published URL |
| --- | --- |
| `AinKun-Portfolio` | `https://YOUR_USERNAME.github.io/AinKun-Portfolio/` |
| `YOUR_USERNAME.github.io` | `https://YOUR_USERNAME.github.io/` |

Use the actual address shown in Pages settings. Publication can take up to 10 minutes after a push. The included `.nojekyll` file disables Jekyll processing for this static site. See [GitHub's deployment and static-site notes](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

The website uses relative asset paths, so both repository and account-level URLs work without changing the source. There is no deployed Python server, database, environment-variable setup, or secret configuration for this site.

## Update the live website

Edit the local files, check them on localhost, then publish your changes:

```sh
git status
git add .
git commit -m "Update portfolio"
git push
```

For browser uploads, upload the revised files into their existing paths and commit them. Changes pushed to the configured publishing branch trigger a new deployment; you do not need to reconfigure Pages each time. See [GitHub's branch publishing behavior](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

After deployment, refresh the published page. Keep [SUMMARY.md](SUMMARY.md) updated when a change affects the site's design, files, or behavior.

## Development checks

With Node.js installed, run from the project root:

```sh
node --check script.js
node --check themes.js
node --check analyst-card.js
node --check blog.js
node tests/themes.test.cjs
node tests/analyst-card.test.cjs
node tests/blog.test.cjs
python tests/test_medium.py
```

The theme suite contains 10 behavior tests. Eleven additional card tests check proportional desktop/mobile sizing, opening, interrupting the animation with Escape, outside clicks, focus restoration, motion preferences, resizing, timed diagonal hints, clicks during hints, suspension/resumption when hidden or paused, and silent video playback without a background image. These use DOM models and do not replace browser checks for rendering, native focus trapping, or animation smoothness.

Eleven blog tests cover feed validation, caching/retry, portrait decoding and theme races, page navigation and modifier keys, greeting/farewell state, mute controls, blocked autoplay, and interrupted audio. Four Python tests cover RSS parsing, empty/error responses, and duplicate/unsafe links. Browser appearance and actual audio playback still need manual verification.

For the latest validation results and outstanding browser checks, see [SUMMARY.md](SUMMARY.md#11-verification-status-and-limits).

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Python command is not recognized | Install Python 3, reopen the terminal, and try the platform-specific command above. |
| Localhost refuses the connection | Keep the server terminal open and use the same port as the server command. |
| Blog articles do not load | Use localhost rather than `file://`; check that `data/medium.json` is included, then use the retry button. |
| Blog posts look out of date | Run the feed refresh script locally, or enable/run the GitHub Pages workflow. Check the visible sync date. |
| Chibi is visible but silent | Click Enable voice; browsers can block playback before interaction. Check the voice toggle and device volume. |
| The browser shows a directory listing | Start the server from the folder containing `index.html`. |
| Port 8000 is in use | Start the server on 8001 and update the browser URL to match. |
| Git asks for your identity | Configure your Git author name and email, then retry the commit. |
| `origin` already exists | Check `git remote -v`; use the configured repository rather than repeating `git remote add`. |
| GitHub rejects the push | Complete GitHub sign-in in your Git client and verify the repository URL and your access. |
| Pages returns 404 | Check the selected branch/root folder, ensure `index.html` is at that root, and inspect the deployment status. |
| Images or styles are missing | Upload the referenced files and preserve exact filename capitalization and relative paths. |
| The live site shows older content | Wait for the deployment to finish, then hard-refresh: Ctrl+Shift+R on Windows/Linux or Cmd+Shift+R on macOS. |
| Theme changes or hover effects are instant | Check your operating system's reduced-motion setting. |
| Japanese text becomes question marks | Save the file as UTF-8; preserve the original characters when editing. |

For Pages deployment errors, consult the repository's Actions run and [GitHub's publishing troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#troubleshooting-publishing-from-a-branch).

### Current identity and interface details

- Public identity: **ainkun**, **Security Researcher**. Keep the existing AINKUN / HUSSAIN K. hover animation, but do not display the full legal name.
- Copy focuses on offensive security, reconnaissance, vulnerability research, and attack paths. The profile motto is **Recon / Research / Exploit**.
- Both sidebars end with the **ainkun.** home wordmark. The bottom-left footer contains **Created by [PakCyberbot](https://pakcyberbot.com)**. The previous learning status and decorative-motion button have been removed; OS reduced-motion support remains.
- The favicon uses the current transparent `assets/logo-clean/ainkun-clean.png` logo.
- Explore my work uses white text for morning/evening and transitions to black over 3.2 seconds for night. Its Japanese label inherits the same color.
- The card's upper-right diamond is drawn in CSS and geometrically centered inside its circle.

### Creator-credit transition

The complete **Created by PakCyberbot** text at the bottom-left of the footer is one padded link in the site's Space Mono font at regular weight, 11px on desktop and 9px on mobile. Ordinary activation of PakCyberbot plays a 2.4-second Japanese character-rain transition, fading toward the bottom, then navigates the current tab to `https://pakcyberbot.com`. The supplied `pakcyberbot.png` appears in the center with a gently pulsing logo and rotating loading ring. Both pages preload it, and the Pages build includes it. The blog farewell can play during this send-off. Ctrl/Cmd/Shift/Alt-click and middle-click retain native behavior; reduced motion follows the link immediately. Escape cancels the transition. Page lifecycle cleanup prevents a stale overlay after Back navigation.

Shared implementation: `credit-transition.js` and `credit-transition.css`, loaded after the page scripts on both pages and automatically included in the Pages build. `node tests/credit-transition.test.cjs` checks navigation timing, repeat clicks, native link behavior, reduced motion, cancellation, and cleanup (four passing tests). Actual browser appearance still needs visual verification.

### Native-zoom layout and researcher content

`responsive.css` loads last on both pages. Desktop navigation uses a 184px rail with compact spacing; the opening hero fills at least one complete viewport (100dvh on desktop, minus the 124px reserved mobile header), with smaller fluid heading/card sizes. There is no maximum-height cap: the archive bar stays below the initial fold at every zoom level. Enlarged content may grow taller to remain accessible. Text remains readable without changing the browser zoom or applying a page-wide transform. On phones, the heading stays full width while the card sits beside the description and actions, using compact spacing to fit the opening screen without the previous 950px forced minimum. Desktop projects use two columns, stacking on narrower screens.

The About biography introduces Hussain / ainkun as a Security Researcher and experienced CTF participant, covering reverse engineering, malware, mobile security, red teaming, and vulnerability research. The card techniques are **Reverse Engineering** (including malware reversing) and **Mobile Security**. `analystCard.stats` and `skills` contain **Cryptography, Reversing, Programming, Malware Dev, Android Security, AI Automation**; these are labels without invented numerical scores. Optional `traits` remain supported but are omitted from the current card to keep it compact.

Latest validation: all 11 card interaction tests and 4 creator-transition tests pass. Local browser inventory is empty and the in-app browser is unavailable, so native-zoom rendering still requires visual review on the user's display.

The homepage archive bar (`#chapters`) fades and rises into view over one second using the existing reveal observer as the visitor scrolls. **Scroll to explore** smoothly targets this bar before the About section. Scrolling within the content remains native; wheel and single-finger touch gestures at the opening boundary use the panel transition below. Keyboard focus reveals the bar, and system reduced-motion preferences skip the animation.

### Opening chapter panel transition

On the homepage, `chapter-transition.js` turns the opening/content boundary into a 620ms eased transition. A downward mouse-wheel gesture or upward finger swipe from Chapter 1 lands exactly at the archive bar (below the fixed mobile header). Upward scrolling that reaches this boundary returns to the beginning; scrolling farther down the content is normal. A short 180ms cooldown absorbs trailing wheel momentum. The scroll cue and Arrow/Page/Space keyboard scrolling support the same boundary behavior, with keyboard focus moved to the destination.

Ctrl/Cmd-wheel zoom, horizontal gestures, sidebar scrolling, form controls, card dialogs, and the creator overlay are excluded. Reduced motion jumps immediately. If enlarged text makes the opening chapter taller than the available screen, its internal document range remains scrollable before transitioning out. Resizing settles an active transition; page lifecycle events clear stale frames. Scrollbar navigation remains native. Eleven DOM-model behavior checks pass with `node tests/chapter-transition.test.cjs`; live browser visual review remains unavailable in this environment.

The sidebar and footer wordmarks have been swapped on both pages: **ainkun.** in the sidebar links home; the footer creator credit retains its regular Space Mono styling and Japanese rain/logo transition to PakCyberbot.

### Mobile chapter and background fixes

- `chapter-transition.js` supports single-finger swipes at the hero/archive boundary. The initiating gesture is consumed through finger release so it cannot overshoot the landing point. A downward swipe at the archive top returns to Chapter 1; native upward momentum reaching the boundary is also handled. Deeper content scrolling, pinch zoom, horizontal gestures, form controls and modal card scrolling remain available.
- Phone hero layout in `responsive.css` places the profile beside the description/actions beneath the full-width animated name. The section fills the viewport below the 124px header, with natural overflow retained for very short screens or enlarged text.
- Both the initial `body::before` scene and `.scene-stack` use a fixed `100lvh` height with `bottom:auto` on mobile. Their cover crop therefore stays stable when browser toolbars collapse during scrolling; orientation changes may legitimately resize it. Theme crossfade layers share this geometry on both pages.
- Mobile height-only resize events do not prematurely finish the 620ms transition; width/orientation changes settle it safely.
- Latest checks: 11 chapter-transition and 11 card tests passed, plus JavaScript syntax/build checks. Browser inventory is empty, so device-level visual verification remains outstanding.

# ainkun — Cybersecurity Portfolio

An anime-inspired, responsive portfolio for **Muhammad Hussain Kas (ainkun)**. Plain HTML, CSS, and JavaScript: no build, installation, or framework required. Features three matching morning, evening, and night neighborhood panoramas that stay fixed behind the full page, bilingual Japanese/English navigation, warm cream and sage-green game-menu panels, your profile avatar, sunlit drifting particles, scroll reveals, a translucent final contact section, and a motion pause button. Respects reduced-motion preferences.

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
| `mainImage`, `mainImageAlt`, `imagePosition` | Central artwork, description, and crop position |
| `portraitImage`, `portraitImageAlt` | Small top-left portrait |
| `ability.title`, `ability.description` | Featured ability heading and copy |
| `techniques` | Editable skill rows with `symbol`, `title`, `description`, and `tag` |
| `traits` | Small footer stats with `label` and `value` |
| `motto`, `edition` | Collection motto and footer |

The central art is `card-main-image.jpeg`; the corner portrait is `card-top-left-small.jpeg`. `card-design-reference.jpeg` is the visual reference, not the rendered card. The card follows the current theme and respects reduced/paused motion. Layout and interaction live in `analyst-card.css` and `analyst-card.js`.

### Edit the portfolio content

Edit **`profile.js`** to change the biography, skills, projects, achievements, blog display settings, and social URLs. All achievements and projects are explicitly placeholders, not claims of completed work. Replace them with your actual work before publishing. Empty URLs show a “coming soon” message rather than leading visitors to fake profiles. Medium is configured as `https://ainkun.medium.com`.

### Medium blog and VTuber-style host

The **Blog** navigation item and homepage chapter tile open the separate `blog.html` page in the same tab. The page shares the portfolio sidebar, fixed background, and all three PKT themes. It shows up to ten real articles from [ainkun's Medium RSS feed](https://ainkun.medium.com/feed), with cover images, dates, short excerpts, and links that open on Medium. `blog.maxPosts` and `blog.feed` live in `profile.js`.

On opening the blog page, a large nerdy adult female anime host rises from below the bottom-right edge with **こんにちは / Konnichiwa**. Following a portfolio navigation link or clicking a Medium link triggers **ありがとうございます / Arigatou gozaimasu**, then she slides down. Voice can be muted independently of motion; its preference lasts for the tab session. Browsers may block audio before interaction; the voice button changes to **Enable voice** if needed. Only her upper body is visible, with the lower body cropped outside the window. Desktop height is up to 460px (53% of the viewport); mobile uses up to 285px (34%). A subtle breathing motion keeps the portrait relaxed. Reduced/paused motion removes both the sliding and breathing animations. The host stays visible while scrolling the blog and is exclusive to this page. Ordinary portfolio navigation waits 1.75 seconds for the farewell; Medium links and modified clicks keep their native behavior.

The browser fetches the same-origin `data/medium.json` on entry and caches it for five minutes. `scripts/refresh_medium.py` reads Medium's RSS to produce that file; it does not copy full articles or require a public CORS proxy. The checked-in snapshot contains real fetched articles, and its sync date is displayed. This follows [Medium's supported RSS format](https://help.medium.com/hc/en-us/articles/214874118-Using-RSS-feeds-of-profiles-publications-and-topics).

To refresh articles locally or on another static host:

```sh
python scripts/refresh_medium.py
```

Use `python3` on macOS/Linux or `py` on Windows if needed. If an obsolete environment proxy prevents the connection, `--direct` ignores proxy variables for this request. `--allow-stale` retains the bundled snapshot with a warning if Medium is unavailable. A simple localhost server does not refresh Medium by itself.

The included GitHub Pages workflow refreshes the feed on pushes to `main`, manual runs, and daily around **08:17 PKT**. Refreshes go into the deployment artifact; **the workflow makes no Git commits**. Enable it as described below. Other hosts and branch-based Pages deployments must refresh and upload the JSON manually.

Character and audio files are in `assets/blog/`. The nerdy female host has three portraits: `nerd-female-host.png` (morning), `nerd-female-evening.png` (sunset), and `nerd-female-night.png` (sleepy). CSS mirrors all three toward the article content. Portraits follow automatic PKT and manual theme changes, crossfading over 3.2 seconds after the incoming image decodes; rapid changes keep the latest selection. The calmer female greetings are synthesized with **VOICEVOX:冥鳴ひまり**, saved locally as `adult-female-konnichiwa.mp3` and `adult-female-arigatou-gozaimasu.mp3`. No external speech service is needed during playback. See [asset credits](assets/blog/CREDITS.md), [the original generation prompt](assets/blog/FEMALE-HOST-PROMPT.md), and [theme variant prompts](assets/blog/THEME-HOST-PROMPTS.md). Keep the VOICEVOX credit when reusing the audio. Previous variants are retained as design history.

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

The website chooses its initial theme using **Pakistan Standard Time (`Asia/Karachi`, UTC+05:00)**, independent of the visitor's device timezone:

| Theme | Pakistan time | Palette |
| --- | --- | --- |
| Morning / 朝 | 05:00–16:59 | Cream and sage |
| Evening / 夕暮れ | 17:00–19:59 | Warm parchment and terracotta |
| Night / 夜 | 20:00–04:59 | Indigo, soft sage, and warm amber |

Use the three buttons at the top right to preview any scene. **Use PKT time** returns to automatic mode. A preview lasts until you return to automatic mode or reload the page; no preference is stored. Automatic mode refreshes every minute and when you return to the tab. The clock always displays PKT. This is a fixed daily schedule, not a sunrise/sunset calculation.

`themes.js` sets the initial theme before the page is painted and preloads only its background. Theme changes load and decode their image before blending the street scene and matching palette over 3.2 seconds with gentle easing. The incoming background uses an explicit opacity keyframe animation so the fade starts reliably even when the browser batches updates. Layered backgrounds preserve an in-progress blend during rapid clicks, and older requests cannot replace the latest choice. `theme-motion.css` animates the palette colors, including the logo, title, gradients, and translucent panels. Reduced-motion preferences and the animation pause button make theme changes immediate. If a preview fails to load, the current theme remains available. Without JavaScript the morning palette is the fallback. All three images stay fixed during scrolling, with translucent section backgrounds above them.

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

The theme suite contains 10 behavior tests. Nine additional card tests check proportional desktop/mobile sizing, opening, interrupting the animation with Escape, outside clicks, focus restoration, motion preferences, resizing, timed diagonal hints, clicks during hints, and suspension/resumption when hidden or paused. These use DOM models and do not replace browser checks for rendering, native focus trapping, or animation smoothness.

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
| Theme changes or hover effects are instant | Check the website's motion pause control and your operating system's reduced-motion setting. |
| Japanese text becomes question marks | Save the file as UTF-8; preserve the original characters when editing. |

For Pages deployment errors, consult the repository's Actions run and [GitHub's publishing troubleshooting](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#troubleshooting-publishing-from-a-branch).

# My Portfolio

A scrapbook-style portfolio: a folder cover, then scrolling paper sheets that hang from strings.

## Folder structure

```
portfolio/
├── index.html          ← the page structure (you rarely need to edit this)
├── css/style.css       ← colours, paper, stickers, animations
├── js/content.js       ← ★ YOUR TEXT, IMAGES AND LINKS (edit this)
├── js/app.js           ← folder animation + hanging-paper physics
└── assets/
    ├── fonts/          ← Handmade Alphabet font (see LICENSE file inside)
    └── images/         ← put your own pictures here
```

## Step 1 – Preview on your computer

1. Install **Visual Studio Code** (code.visualstudio.com).
2. Open VS Code → *File → Open Folder* → choose the `portfolio` folder.
3. Install the extension **Live Server** (Extensions icon on the left, search "Live Server").
4. Right-click `index.html` → **Open with Live Server**. The site opens in your browser and refreshes when you save.

## Step 2 – Put in your own content

Open `js/content.js`. All user-facing copy is grouped there, with comments showing which part of the site each group controls. Change:

- `site` – the browser title and description
- `entry` – cover-screen instructions and decorative notes
- `navigation` and `hero` – navigation labels, section headings and hero greeting
- `ui` – button labels, settings labels, accessibility text and footer copy
- `name`, `tagline`, `intro` – your introduction text
- `oc.image` – your original character (ideally a transparent PNG)
- `oc.label`, `pageOc.image`, `pageOc.label` – character image descriptions
- `services`, `projects`, `certificates`, `contact` – your work and links

The HTML contains only fallback text for cases where JavaScript has not loaded yet; the displayed text is filled from these `content.js` values when the page starts.

To add an image: copy it into `assets/images/` (for example `my-art.png`), then write
`image: "assets/images/my-art.png"` in `content.js`.

To add a project, copy one block in `projects` and change the text. Items can be added or removed freely.

## Interactive details

- Click the OC to randomly trigger its wave, squish, or bounce animation.
- Use the `sound on` button to enable the generated scrapbook-style music and interaction tones. Browsers require this first click before audio can play.
- Scroll after opening the folder to release falling colourful paper scraps.

## Step 3 – Put the site online with GitHub and Vercel

1. **Install Git** from git-scm.com (accept the defaults).
2. **Create a GitHub account** at github.com, then create a new repository called `portfolio` (set it to *Public*).
3. In VS Code, open the **Source Control** icon (left sidebar) → *Initialize Repository* → type a message like "first version" → **Commit** → **Publish Branch**. Your files are now on GitHub.
4. Create a **Vercel** account at vercel.com and choose *Continue with GitHub*.
5. In Vercel click **Add New → Project**, choose your `portfolio` repository, and click **Deploy**. No settings need changing (it is a plain HTML site).
6. Vercel gives you a live link like `portfolio-yourname.vercel.app`.

**Every time you change something:** in VS Code, Source Control → write a short message → **Commit** → **Sync Changes**. Vercel updates the live site automatically within about a minute.

## Tools you do NOT need yet

- **Claude** (or Claude Code) – use it to change the design or write new features. Describe what you want and paste the code.
- **Codex** and **Antigravity** – other AI coding tools. You only need one AI helper, so you can skip these.
- **Supabase** – only needed later if you want a working contact form that saves messages, a visitor guestbook, or a page where you upload pictures without touching the code. Start without it.

## Replacing the placeholder pictures

The `.svg` files in `assets/images/` are placeholders. Replace them with your own images (`.png`, `.jpg` or `.webp` also work) and update the paths in `content.js`. For the OC, the best result comes from a transparent PNG about 600–900 px wide.

## Font credit and licence

The font **Handmade Alphabet** is by Keithzo, from 1001fonts.com. Its licence (free for websites, embedding allowed, not to be redistributed on its own) is in `assets/fonts/LICENSE-handmade-alphabet.txt`.

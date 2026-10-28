<div align="center">
  <img src="icon-192.png" alt="Dicatat!" width="96" height="96">
</div>

<h1 align="center">Dicatat! — Maganghub Mode</h1>

<p align="center"><strong>Personal finance management that lives entirely in your own browser.</strong><br>
Local-only · offline-capable · zero dependencies · no backend · no account</p>

<p align="center">
  <img alt="No build step" src="https://img.shields.io/badge/build-none-2ea043?style=flat-square">
  <img alt="Zero dependencies" src="https://img.shields.io/badge/dependencies-0-2ea043?style=flat-square">
  <img alt="No backend" src="https://img.shields.io/badge/backend-none-0070C9?style=flat-square">
  <img alt="PWA" src="https://img.shields.io/badge/PWA-installable%20%2B%20offline-5A0FC8?style=flat-square">
  <img alt="MIT License" src="https://img.shields.io/badge/license-MIT-0070C9?style=flat-square">
</p>

> This folder (`deploy/`) is the **self-contained, upload-ready build** of the app.
> Everything the browser needs to run the app is here — nothing more.

---

## 1. What it is

**Dicatat!** ("to record / to note" in Indonesian) is a progressive web app (PWA) for
managing personal money. It runs as plain files in any modern browser — there is no
server logic, no login, and no network call to any API. Everything you enter is stored
in `localStorage` under the key `dicatat-maganghub-v1`, in the browser profile you use.

**Maganghub Mode** is a customization on top of the base app. Instead of ordinary
calendar months, the whole app is organized around a **6-period (6-month) cohort
cycle**:

| Batch | Cycle | Period 1 starts | Program runs |
|---|---|---|---|
| Batch 2 (21st–20th) | 21st of a month → 20th of the next | 21 Sep 2026 | 21 Sep 2026 – 20 Mar 2027 |
| Batch 3 (16th–15th) | 16th of a month → 15th of the next | 16 Nov 2026 | 16 Nov 2026 – 15 May 2027 |

Budgeting, the calendar, and every report window follow these periods (P1–P6) rather
than calendar months. Salary is modeled as entering on the 1st date of each period,
starting with Period 2.

### At a glance

| Property | Detail |
|---|---|
| **Shape** | One HTML shell (`index.html`) + `css/` stylesheets + `js/` scripts + a service worker, a manifest, icons and one self-hosted font. |
| **Runtime** | Any modern browser. No build step, no dependencies, no backend. |
| **Storage** | `localStorage` key `dicatat-maganghub-v1`. That single record is the only copy. |
| **Profile** | First launch asks for your **name and institution**, then greets you by them. Stored locally, editable in Settings. |
| **Offline** | A service worker caches the app shell and font, so the installed app opens with no connection (over `https://` or `localhost`). |
| **Money** | IDR or USD. |
| **Language** | Indonesian or English. |
| **Theme** | Light / dark / auto. |
| **Exports** | CSV, XLSX and PDF reports generated in the page without libraries, plus a JSON backup / restore. |

---

## 2. Workflow

### How the app boots

1. `js/data.js` defines the default document `D` and the i18n dictionary.
2. `js/core.js` reads `localStorage['dicatat-maganghub-v1']` and runs it through
   `normalizeState()` — missing arrays and settings are repaired, and leftover metadata
   from the old cloud-sync version (`_deleted`, `_budgetsTs`, `_resetAt`, `_sTs`) is
   stripped. If the value is unreadable or has no `wallets` / `tx`, the app starts from
   `D`. A legacy `kas-v1` key is also removed on load.
3. `js/app.js` renders the current view (the `#hash` selects the view) and runs the
   first-run gates: the **profile gate** (name + institution) and the **batch gate**
   (choose Batch 2 or Batch 3).

### How writes work

Every change calls `done()` → `save()` + `render()`:

- `save()` stamps `_updatedAt` and writes the whole document to `localStorage`
  synchronously.
- If the write fails (storage full, blocked, private mode), a red banner appears at the
  top — *"Could not save to this browser… use Backup JSON now."* It clears itself after
  the next successful save.

### Multiple tabs

Tabs of the same browser profile stay in step through the `storage` event. The tab with
the newer `_updatedAt` wins (last write wins; no merging — deleted items never come
back from another tab).

### Deleting

Deletes remove an item immediately and permanently after a confirmation. There is no
trash and no undo.

### Document shape

```jsonc
{
  "wallets": [{ "id": "w1", "name": "Cash", "type": "Cash", "init": 0 }],
  "tx":      [{ "id": "…", "type": "exp|inc|tr", "amt": 25000, "date": "2026-10-26",
                "cat": "Food", "w": "w1", "to": "", "note": "Lunch" }],
  "debts": [], "inv": [], "goals": [],
  "cats":    { "exp": ["Food", "Transport"], "inc": ["Salary"] },
  "budgets": { "Food": 1500000 },
  "s":       { "cur": "IDR", "theme": "auto", "lang": "id", "mh": "sep", "name": "", "inst": "" },
  "_updatedAt": 0
}
```

Items may also carry a `_ts` timestamp. `mh` holds the selected Maganghub batch
(`"sep"` = Batch 2, `"nov"` = Batch 3).

### Running it

- **Quickest:** double-click `index.html`. Everything works except the service worker
  (browsers don't allow it on `file://`), so there is no offline shell in that mode.
  Your data is still local.
- **With offline install support:** serve this folder over `https://` or `localhost`:

  ```bash
  python -m http.server 8080      # or:  npx serve .
  ```

  Then open `http://localhost:8080` and use the browser's *Install app* option.
- **Hosting it publicly** (GitHub Pages, Cloudflare Pages, Netlify, …): upload the
  contents of this folder as they are. No build command, no environment variables, no
  functions. Every visitor gets their **own separate** local data; nothing is shared
  through the host.

### Backup and restore

| Action | What it does |
|---|---|
| **Backup JSON** | Downloads `Dicatat_Data_<date>.json` with the whole document plus `_app` / `_exportedAt` markers. |
| **Import JSON** (button or drag-and-drop) | Validates the file, **replaces** all current data and saves. It is not a merge. Invalid files are rejected. |
| **Erase all data** | Press twice within 4 seconds. Resets to defaults. Cannot be undone. |

Moving to another device or browser: export a backup, import it there. Because the
browser may evict storage under pressure, keep a recent backup somewhere safe.

---

## 3. What it is made of

| Path | What it is |
|---|---|
| `index.html` | The entry page: head, header, mount points, and the `<link>` / `<script>` tags that load everything else. |
| `css/base.css` | Fonts, design tokens, reset, base elements. |
| `css/layout.css` | Header, navigation, page layout, tables, badges. |
| `css/components.css` | Buttons, inputs, dialogs, charts, settings, date picker, report sheet. |
| `css/mobile.css` | Breakpoints and the mobile shell (bottom dock, "All Menus" sheet, transaction cards). |
| `css/maganghub.css` | Period navigator, calendar, salary schedule, batch gate, profile gate. |
| `css/mobile-maganghub.css` | Mobile overrides for the Maganghub-specific UI. |
| `js/data.js` | Storage key, default document, i18n dictionary (EN/ID). |
| `js/core.js` | State loading, storage helpers, money and date formatting. |
| `js/period.js` | Maganghub batch periods (P1–P6) and the calendar engine. |
| `js/datepicker.js` | Date / period picker. |
| `js/ui.js` | Shared UI building blocks, ask dialog, transaction list, charts. |
| `js/actions.js` | CRUD actions, settings, data import / export. |
| `js/reports.js` | Report compiler and the XLSX / CSV / PDF exporters. |
| `js/views.js` | The eight application views. |
| `js/app.js` | Router, mobile navigation, render loop, boot. |
| `sw.js` | Service worker — precaches the shell, serves stale-while-revalidate. Not registered on `file://`. |
| `manifest.webmanifest` | PWA identity: standalone, portrait, `#090b10` background, `#0070C9` theme, 192/512 icons. |
| `fonts/plus-jakarta-sans-latin.woff2`<br>`fonts/plus-jakarta-sans-latin-ext.woff2` | Self-hosted Plus Jakarta Sans (variable, weights 400–800). |
| `fonts/OFL.txt` | The font's SIL Open Font License 1.1. |
| `favicon.svg`, `icon-32.png`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, `dicatat-finance-icon.svg` | Tab, home-screen and pinned-tab icons. |
| `MagangHub Logo - Black - zonalogo.com.svg`<br>`MagangHub Logo - White - zonalogo.com.svg` | Maganghub brand logos used in the header and batch gate (see [Public acknowledgement](#6-public-acknowledgement)). |
| `LICENSE`, `NOTICE.md` | MIT license and third-party attribution. |
| `.nojekyll` | Empty marker that tells GitHub Pages not to process this folder through Jekyll. |

---

## 4. What it is for

Dicatat! is a day-to-day money companion for a single person. The feature set:

- **Wallets** — bank, e-wallet and cash accounts with opening and current balances.
- **Transactions** — expenses, income and transfers, grouped per period with daily totals.
- **Budgets** — per-category period limits with progress bars and remaining amounts.
- **Categories** — editable income and expense categories.
- **Loans & receivables** — *utang* (paylater/credit/pinjol, with interest and due
  dates) and *piutang* (money owed to you), urgency flags, and a debt-to-liquid risk
  ratio.
- **Investments** — RDPU money-market funds, RDO bond funds and bank deposito, with
  NAV updates and gains.
- **Savings goals** — targets with add-funds tracking.
- **Maganghub calendar & salary schedule** — a Period 1–6 calendar with daily activity
  markers, plus a salary disbursement schedule aligned to the cohort cycle.
- **Reports** — an executive report (cash flow, budgets, loan risk, wallets,
  investments, ledger) exported to **CSV**, **XLSX** or **PDF**, generated entirely in
  the page with no libraries.
- **Personalization** — profile (name + institution), language, currency and theme.

The app is deliberately for **exactly one person on one device**. There is no
multi-user, no sharing and no sync.

---

## 5. Privacy and Data

> **Developer & Rey Florencio did not collect user data, it is secured end-to-end in
> your own browser/installed PWA.**

- **No data leaves the device.** No analytics, no API, no third-party requests (the
  font is self-hosted). Your name and institution stay in the same local record as your
  transactions.
- **No account, no cloud, no sync.** The `localStorage` record is the only copy.
  Clearing site data, switching browser or profile, or a browser evicting storage means
  the data is gone — back up regularly.
- **No lock screen, no PIN, no encryption.** The document is plain JSON in
  `localStorage`. Anyone who can use your unlocked browser profile can read it through
  DevTools. Use your OS account lock / disk encryption.
- **Backup files are plain JSON.** Keep them off storage you don't control.
- **User-entered text is escaped** (`esc()`) before being rendered, but the UI is built
  with `innerHTML` and inline handlers, so a strict Content-Security-Policy is not
  possible without refactoring.

---

## 6. Public acknowledgement

Zero code libraries are installed or bundled. Two things are still someone else's
work, and both are credited:

| Component | License | How it ships |
|---|---|---|
| **Feather Icons** — 24×24 stroke UI glyphs (lock, plus, upload, download, file) | MIT © 2013–2023 Cole Bemis | Path data inlined in the markup and views. No library, no runtime. |
| **Plus Jakarta Sans** — the interface typeface | SIL OFL 1.1 © 2020 The Plus Jakarta Sans Project Authors | Bundled as two WOFF2 subsets in `fonts/`, with the license in `fonts/OFL.txt`. |

Stroke widths, sizes and colours of the Feather glyphs were adjusted for this
interface; the glyph shapes are otherwise unchanged.

The **Maganghub** name and logos (`MagangHub Logo - … zonalogo.com.svg`) are used in
the header and batch gate to identify the cohort program. They are third-party brand
assets and remain the property of their owner — their use in this project does not
transfer any rights. See [NOTICE.md](NOTICE.md) for the full third-party notices.

---

## 7. Developer intention

- **Your data is yours, and only yours.** The app was built on the explicit principle
  that nothing is collected, uploaded or shared — the profile screen states it plainly:
  *"Dicatat! is made for exactly one person — you."*
- **Local and offline-first.** A service worker makes the installed app usable without
  a connection, and there is no backend to depend on or pay for.
- **Zero-dependency honesty.** Reports (including a real `.xlsx` and a hand-built PDF)
  are generated in the page with no libraries, and the whole thing ships as plain files
  anyone can read and audit.
- **A finance app that speaks the user's context.** Maganghub Mode replaces generic
  calendar months with the user's real 6-period cohort cycle, so budgets, calendars and
  reports describe the life the user actually lives.
- **Simple, portable, repairable.** A single `localStorage` document, a portable JSON
  backup, and a predictable file layout keep the app easy to move, restore and fork.

---

## 8. Further notice

- **Single device, single browser profile** — no sync, by design.
- **No encryption or lock screen.** Anyone with access to your unlocked profile can
  read the data.
- **No automated tests, no CI, no build tooling.** The exporters (XLSX/PDF) are
  hand-written and cover the app's own report layout only.
- **Some validation and notification messages are English-only.**
- **Service worker limits:** not active on `file://`, and some private-browsing modes
  disable it. Because requests are served stale-while-revalidate, a new deploy appears
  on the *second* load after it is published — bump `CACHE` in `sw.js` (e.g.
  `dicatat-shell-v14`) to force old caches out immediately.
- **The Maganghub logos are third-party brand assets.** Using them publicly, especially
  under a different name or service, may require the owner's permission.
- **This README is documentation, not runtime.** The browser never loads it, and only
  `index.html`, `css/`, `js/`, `fonts/`, `sw.js`, `manifest.webmanifest`, the icons and
  the licences are required for the app to run.
- **License:** MIT — see [LICENSE](LICENSE). Copyright © 2026 Rey Florencio. The full
  copyright and permission notice must travel with every copy or substantial portion of
  this software.

<p align="center"><sub>One HTML file · zero dependencies · no build step · no backend.</sub></p>

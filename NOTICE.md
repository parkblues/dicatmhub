<div align="center">
  <img src="icon-32.png" alt="" width="40" height="40">
</div>

<h2 align="center">NOTICE</h2>

<p align="center"><strong>Dicatat!</strong> — attribution and third-party notices<br>
<sub>Companion to <a href="LICENSE">LICENSE</a> · 27 October 2026</sub></p>

<p align="center">
  <img alt="MIT" src="https://img.shields.io/badge/license-MIT-0070C9?style=flat-square">
  <img alt="No bundled libraries" src="https://img.shields.io/badge/bundled%20libraries-0-2ea043?style=flat-square">
</p>

---

### Copyright

> **Dicatat! — Finance Management (local-only)**<br>
> Copyright © 2026 Rey Florencio<br>
> Released under the MIT License. The full text is in [LICENSE](LICENSE); the copyright and permission notice must travel with every copy or substantial portion of this software.

### Third-party material

Zero code libraries are installed or bundled. Two things are still someone else's work, and both are credited here.

| Component | License | How it ships |
|---|---|---|
| **Feather Icons**<br><sub>24×24 stroke UI glyphs: lock, plus, upload, download, file</sub> | MIT © 2013-2023 Cole Bemis | Path data inlined in the markup and views. No library, no runtime |
| **Plus Jakarta Sans**<br><sub>The interface typeface</sub> | SIL OFL 1.1 © 2020 The Plus Jakarta Sans Project Authors | **Bundled** as two WOFF2 subsets (Latin, Latin-Extended) in `fonts/`, with the license in [`fonts/OFL.txt`](fonts/OFL.txt) |

<details>
<summary><strong>Feather Icons — full license text</strong></summary>

```text
The MIT License (MIT)

Copyright (c) 2013-2023 Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Stroke widths, sizes and colours were adjusted for this interface. The glyph
shapes are otherwise unchanged.

</details>

<details>
<summary><strong>Plus Jakarta Sans — license</strong></summary>

The font is self-hosted: the files in `fonts/` are the unmodified Latin and
Latin-Extended subsets of the variable font, as distributed by Google Fonts.
They are redistributed under the [SIL Open Font License 1.1](fonts/OFL.txt),
whose full text is in `fonts/OFL.txt` and must stay with the font files. The
font may be bundled and used freely, but not sold by itself. The app makes no
request to Google or any other third party to load it.

</details>

### Authored for this project

Everything else is original to Dicatat! and covered by the MIT license above:

- `index.html`, `css/*.css`, `js/*.js` — markup, styles, views, report compiler and exporters, local storage layer
- `sw.js` — service worker (offline app shell)
- `icon-192.png`, `icon-512.png`, `icon-32.png`, `apple-touch-icon.png`, `favicon.svg`, `dicatat-finance-icon.svg` — the D-with-checkmark mark
- `manifest.webmanifest`

> [!NOTE]
> README badges are images served by shields.io and are documentation, not
> part of the software. The app itself performs no network requests, has no
> backend and uses no hosted services.

---

<p align="center"><sub>MIT for the code · Feather for the glyphs · Jakarta for the type (OFL).</sub></p>

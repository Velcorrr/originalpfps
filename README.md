# Profile pictures

A simple, responsive gallery of 2,671 profile pictures from eight streaming platforms. Dark red styling, glowing hover effects, pointer-reactive cards, search, platform filtering, full-size previews, and downloads. Reduced-motion settings are respected.

## Local preview

Run `python -m http.server 8080` in this folder, then open http://localhost:8080. No build step or JavaScript dependencies are required.

## GitHub Pages

Publish the root of `main` from Settings → Pages → Deploy from a branch. All assets use relative URLs, including under a repository subpath. The `.nojekyll` file disables Jekyll processing.

## Assets and attribution

The gallery includes optimized WebP downloads and smaller thumbnails. See the Sources & info dialog for archive credits and coverage. The artwork and trademarks belong to their respective owners; this repository does not grant an artwork license.

The scripts/prepare.py utility prepares assets from the original local collection. It is not needed to serve the prepared website. Research files and local account state are excluded from publication.

# Profile pictures

A simple, responsive gallery of 35,924 profile pictures from twelve platform collections, including Xbox One / Series, Xbox 360, PlayStation, and Nintendo Switch. Dark red styling, glowing hover effects, pointer-reactive cards, search, platform filtering, automatic scrolling, full-size previews, and downloads. Reduced-motion settings are respected.

## Local preview

Run `python -m http.server 8080` in this folder, then open http://localhost:8080. No build step or JavaScript dependencies are required.

## GitHub Pages

Publish the root of `main` from Settings → Pages → Deploy from a branch. All assets use relative URLs, including under a repository subpath. The `.nojekyll` file disables Jekyll processing.

## Assets and attribution

The gallery includes optimized WebP downloads and smaller thumbnails. See the Sources & info dialog for archive credits and coverage. The artwork and trademarks belong to their respective owners; this repository does not grant an artwork license.

The scripts/prepare.py utility prepares assets from the original local collection. It is not needed to serve the prepared website. Research files and local account state are excluded from publication.

Xbox includes 27,598 Xbox 360 archive pictures, 12 classic defaults, and 411 Xbox One / Series pictures. Original game-cover tiles and repeated images within a category are excluded. Older gamerpics keep their native resolution. Categories and descriptive names were adapted for this gallery.

Xbox sources: [xtitles](https://github.com/birabittoh/xtitles), which credits [Xbox Gamerpics](https://xboxgamer.pics/), and [Xbox Wiki](https://xbox.fandom.com/wiki/List_of_Xbox_One_gamerpics). The xtitles repository license is preserved in credits/xtitles-LICENSE.txt. Xbox Wiki metadata is available under [CC BY-SA](https://creativecommons.org/licenses/by-sa/3.0/); artwork rights remain with their owners.

PlayStation includes 383 avatars from the [PSN Avatars archive](https://github.com/W-i-n-7/ps4-jb-avatars/releases/tag/1), grouped by recognized games or descriptive visual themes. Smaller duplicate exports and console installation packages are excluded. This archive does not represent every PSN avatar.

Nintendo Switch includes 4,849 icons from [nso-icons](https://github.com/henry-debruin/nso-icons): 147 built-in Switch icons plus Nintendo Switch Online character components, including newer game themes. Empty backgrounds and frames are excluded, transparency is preserved, and repeated images within a category are deduplicated. Game grouping comes from the archive, with readable labels and classic-icon grouping added locally. Artwork rights remain with Nintendo and the respective owners.

Live gallery: https://velcorrr.github.io/originalpfps/

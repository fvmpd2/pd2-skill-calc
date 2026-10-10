# PD2 Damage Calculator — game data import

A static, GitHub Pages-compatible calculator. All seven classes are represented with 231 skills parsed from the supplied Skills(2).txt; the converter also searches Missiles(2).txt when the skill itself has no direct elemental damage. The provided Skilldesc(2).txt and MissCalc(2).txt are included as reference inputs but **not yet fully interpreted** by the converter.

## Import status

- 85 skills with direct elemental damage data imported from Skills.txt.
- 2 skills with a missile damage component imported from Missiles.txt.
- 144 skills require manual support (no simple, safely interpretable direct formula found).
- Numerical damage scaling, selected synergy expressions, and poison base length have been imported for supported skills.
- Formula editing remains in the collapsed *Skill scaling & season adjustments* panel. Changes last for the current browser session only.

**Do not treat these results as fully verified in-game damage.** The site currently models a single damage component per hit; weapon damage, multi-component skills, casts, missile hit functions, shot/projectile counts, trap and summon special logic, mastery stacking, immunity rules, and poison game-engine rounding are not fully modeled. Imported poison totals are estimates made from rate values in 256ths per frame and base duration in frames. The poison length/resistance model is provisional. Some skill names in the data may not match the in-game localized names.

## Updating each season

On your laptop, put the new game files alongside `import_pd2.py` and run:

```sh
python3 import_pd2.py Skills.txt Missiles.txt > skills.js
```

The site reads `skills.js` automatically. Do not upload the `.txt` files to GitHub unless you want to keep them as references: the website only requires `index.html`, `style.css`, `skills.js`, `calc.js`, and `main.js`.

## GitHub Pages

Upload the five website files into the repository root; in Settings → Pages deploy the `main` branch from `/ (root)`. The importer is only needed when game data changes.

## Data provenance

Converted from the four user-provided game exports: `Skills(2).txt`, `Missiles(2).txt`, `Skilldesc(2).txt`, and `MissCalc(2).txt`. The first two are parsed by the initial converter, the remaining two need integration for better skill descriptions and expression support.

# PD2 Damage Calculator

A compact calculator for supported Project Diablo 2 skill damage, built with AI. Choose a class and skill, enter your levels and modifiers, and compare damage before and after enemy resistance.

## What it calculates

- 96 selectable skills, with separate damage types, martial-arts charges, summon attacks and aura pulses where modeled.
- Hard-point synergies, mastery and skill-specific modifiers such as Dark Pact curse count.
- Enemy resistance, ordinary −enemy resistance and immunity-breaking reductions.
- Poison duration before/after pierce, damage per frame (25 fps), per second and total damage.
- S14 beta Poison Nova comparison below the main S13 damage, with before/after-resistance values and percentage changes in average damage.
- Automatic Fire/Lightning/Cold Mastery from your effective level (including +skills); equipment bonuses stay separate. Defaults/reset use level 0.
- Sorceress damage with and without the Teleport debuff.
- An optional **hypothetical** Critical/Deadly Strike comparison for Shock Wave, Twister and Tornado, including outcome chances and average damage. Their in-game eligibility is not verified. These three skills compare +1 skill level against +10 percentage points of Deadly Strike chance (capped at 100%), using the expected average damage with your current Critical/Deadly Strike multipliers.

Weapon-dependent player skills are excluded; Barbarian offers War Cry only. Summons use Hell data. Iron Golem and Revive are omitted.

## Using it

Open [the calculator](https://fvmpd2.github.io/pd2-skill-calc/) or download the files and open `index.html` locally. No installation or account is needed.

Skill levels include gear; synergy levels are hard points. Synergies default to 20 hard points. With four or more, only three default to 20, prioritizing the largest bonuses; all are editable. Changing skills clears damage and resistance modifiers and discards custom scaling, restoring the original S13 values. **Reset** keeps your selected class/skill and restores default inputs and synergies.

Use **Copy build link** or bookmark the updated address to save your setup. Compact links include applied scaling edits and display preferences. Older saved links remain supported. Future game-data updates can change their results.

**Truncate numbers** displays whole damage values; unchecking it shows up to three decimal places. The collapsed scaling editor lets you adjust starting Min/Max and five level tiers for the current browser session.

## Important limits

Results describe the listed damage applications, not complete character or army DPS. Hit chance, projectile overlap, attack/cast speed and persistent-effect timing are not simulated. Corpse Explosion and Death Sentry show a note for corpse-life damage but do not calculate that contribution.

Breaking pierce and −enemy resistance inputs accept either sign: `75` and `−75` both mean a 75-point reduction. Enemy starting resistance retains its actual sign.

Breaking pierce is halved against initial immunity; ordinary −enemy resistance applies only once immunity is broken. The below-zero resistance portion is halved. The combined Breaking pierce input can differ from in-game rounding when several sources are rounded separately. [PD2 resistance reference](https://wiki.projectdiablo2.cn/wiki/Game_Mechanics#Reducing_Resistances).

The poison-length effect uses the requested half-pierce model: target PLR minus half of ordinary pierce, clamped to −100–75%. This rule is **not independently confirmed for PD2**; integer-frame and fixed-point rounding are not reproduced.

Meteor’s supplied impact formula uses Fire Ball, Blaze and Inferno; its ground-fire formula uses Fire Ball, Blaze and Fire Wall instead (6% per hard point). The Fire Wall input is marked as ground-fire only. Normal component rows are grouped before their Teleport comparison rows.

Thunder Storm shows one shared strike/nova damage range. Those effects roll independently; whether its nova rolls separately for each monster remains unverified. Other source/tooltip discrepancies and component limitations are documented in [SKILL_AUDIT.md](SKILL_AUDIT.md), with a [CSV audit](SKILL_AUDIT.csv) covering all 231 source entries.

Found an issue? Tag **fvm** on the PD2 Discord. For more detailed planning, use the Hiim planner or physical damage calculator linked on the website.

## Development

The website needs `index.html`, `style.css`, `skills.js`, `seasons.js`, `calc.js` and `main.js`. Deploy these together to GitHub Pages; the original game files are not needed to run it.

Run the automated formula and UI-logic checks with:

```sh
node test.js
```

These checks are not a live in-game comparison or visual browser test.

To rebuild the data and audit with Python 3, keep the helper scripts together and supply the season's game files:

```sh
python3 import_pd2.py Skills.txt Missiles.txt Skilldesc.txt MissCalc.txt MonStats.txt MonLvl.txt > skills.js
python3 build_audit.py Skills.txt Missiles.txt Skilldesc.txt MissCalc.txt MonStats.txt MonLvl.txt
```

Monster files enable Hell summon bases. Review the season-specific formulas and audit when updating game data.

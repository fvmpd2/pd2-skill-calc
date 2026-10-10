# PD2 Damage Calculator — martial arts edition

Extract this ZIP and open `index.html` in a modern browser. No installation or server is required. For GitHub Pages, replace the existing calculator files in your repository and publish the repository root. No original game files are needed at runtime.

## What changed

- Compact controls, spacing, typography and two-column desktop layout. The main calculator is designed for a typical 1366×768 desktop at 100% zoom with season scaling closed. Smaller windows and expanded scaling can scroll.
- 231 class skills: 97 selectable skills with imported damage components and/or charge calculations, versus 87 in the original archive. 134 unsupported entries are excluded from the calculator selector. They remain in the generated source catalogue for future importer work; only the 97 supported skills are available in the UI.
- Corrected `HitShift`: damage fields × 2^HitShift / 256. Blank HitShift is zero. Added non-weapon physical components, including War Cry, Twister, Tornado and Mind Blast.
- Poison uses the shifted damage rate × duration in frames. It displays skill duration, target duration before/after pierce, effective total damage, DPS and damage per frame at 25 fps. Small values retain three decimal places.
- Editable **Skill scaling & season adjustments** remains collapsed. It now has twelve number boxes: starting Min/Max at level 1, then Min/Max increments for levels 2–8, 9–16, 17–22, 23–28 and 29+. Apply/Reset changes only the current browser session. No formula text is required.
- Poison results use cards for before/after duration, damage each frame and damage each second, plus a plain-language duration explanation.
- Diablo II-inspired charcoal, aged gold, parchment and dark red theme.

## Resistance inputs and rules

Enter the target resistance **before item/skill pierce**, after any immunity-breaking effects such as Lower Resist or Conviction. The calculator does not derive those debuff values or break immunity itself.

Item pierce cannot break a target resistance of 100% or more: damage stays zero. For nonimmune targets, pierce consumes the positive resistance portion at full strength, and the remaining portion at half strength. A target at 25 resistance with 40 pierce reaches -7 after integer truncation (the continuous value is -7.5). Zero resistance with 40 pierce reaches -20. Resistance floors at -100. If entering an already negative resistance, enter its effective value; additional pierce is halved.

PD2 negative-resistance mechanics are documented at:
- https://wiki.projectdiablo2.com/wiki/Game_Mechanics
- Accessible translated mirror: https://wiki.projectdiablo2.cn/wiki/Game_Mechanics#Reducing_Resistances

### Poison length: requested model, not independently verified

Poison resistance controls damage rate; poison length resistance (PLR) independently controls duration. This version implements the user's requested half-strength length effect: effective PLR = clamp(target PLR − pierce/2, −100, 75). This is half of the full pierce input, not half of the resulting effective damage resistance. No length effect applies while immune.

Before duration = base duration × (1 − clamped target PLR/100).
After duration = base duration × (1 − effective PLR/100).
Per-frame damage = synergy/bonus-adjusted rate × resistance multiplier.
Total effective damage = per-frame damage × after duration × 25.

Example: two seconds at PLR 0 with 40 pierce lasts 2.4 seconds; resistance 0 becomes -20 and damage rate increases 20%. Duration and rate changes are separate.

The PD2-specific half-strength PLR rule could not be confirmed in available PD2 documentation. It is explicitly labeled in the UI. Do not treat poison totals as independently validated in-game values. Game fixed-point rounding and integer duration truncation can cause small differences; duration uses continuous arithmetic here.

## Scaling and imported data

The scaling boxes show base damage at level 1, followed by per-level increments for levels 2–8, 9–16, 17–22, 23–28 and 29+. For example, level 8 uses starting damage plus seven increments from the 2–8 tier. Apply validates all twelve boxes and retains the imported duration and synergies. Reset restores that skill’s original values. Synergy `pctPerHardPoint` uses fractions (0.24 = 24% per hard point). Synergy controls default to 20; set actual hard points for your build. +skill damage is applied multiplicatively after the summed synergy bonus.

Poison Min/Max boxes show total damage over the imported base poison duration, not raw damage per frame. This duration is stated below the boxes. Duration scaling and synergies are preserved automatically. Advanced season changes to those fields require updating the source data and reimporting.

Reimport future data with Python 3:

```sh
python3 import_pd2.py Skills.txt Missiles.txt Skilldesc.txt MissCalc.txt > skills.js
```

Original uploaded names may be used with quoted paths. The order is Skills, Missiles, Skilldesc, MissCalc. Skills/Missiles provide numeric damage and restricted linear hard-point synergies. Skilldesc display-damage expressions and related MissCalc token descriptions are retained as audit metadata. These two files are not full calculation engines; arbitrary tooltip expressions, missile functions and game server functions are not interpreted.

Reference for game-data damage precision:
https://github.com/andersgong/d2bin2txt/blob/master/bin2txt/skills.c (embedded Skills.txt file guide).

## Scope and limitations

Results are a **single imported damage component**, not necessarily complete skill damage or DPS. Outside the martial arts breakdown, full weapon damage and multiple simultaneous damage components are not modeled. Summons/trap pierce penalties, mastery automation, attack speed, damage conversion, projectile overlap and special server-function details remain outside scope. Use the matching damage type and the +damage field for applicable bonuses. Other components may be omitted even where one component is supported. Unsupported skills are omitted from the selector; there is no example-formula button.

## Validation

Run `node test.js` with Node.js. Tests check all imported flat components across eleven levels, scaling boundaries, level-one reference values, below-zero resistance, immunity, resistance cap, poison length/rate consistency, and UI logic for all supported selections, class filtering, the twelve tier boxes, poison cards and Apply/Reset/error handling using a simulated document.

Automated tests passed. Browser visual verification was unavailable: local hosting was denied by the environment and the browser security policy blocked local-file navigation. Desktop fit is a design target, not a screenshot-verified guarantee.

## Clean replacement / troubleshooting

If your repository contains only this calculator, replace its existing files with all eight files from this ZIP in the same repository folder. Keep index.html, style.css, skills.js, calc.js and main.js together. Upload the extracted files, not the ZIP itself. Preserve unrelated projects, .git, .github and any custom domain CNAME file.

This build displays “Martial arts · v4” beneath the title and uses versioned style/script links to request fresh assets. An empty skill list with the old blue theme suggests mismatched or cached files. Wait for GitHub Pages deployment to finish, then use Command+Shift+R on Mac or Ctrl+Shift+R on Windows.

## Martial arts / in-game names (v4)

All six charge-up skills now show three stages: Tiger Strike, Fists of Fire, Cobra Strike, Claws of Thunder, Blades of Ice and Phoenix Strike. Select a charge component in the collapsed season editor to edit its Min/Max tiers independently.

Fists of Fire charge 3 has separate fire and physical impact rows and a combined impact total **per meteor**, using independent type resistance/pierce. Three meteors are released, but all three are not assumed to hit the same target. Ground fire is shown separately per second for one active damage source, with no assumed exposure duration or stacking. Charge 1 explosion and charge 2 nova use their own scaling. Claws of Thunder charge 3 separates a bolt and its independently rolled lightning strike. Poison charges show before/after duration and per-frame damage.

For Tiger Strike and Cobra Strike charge 2, enter the weapon's physical damage range after weapon-local bonuses but before off-weapon enhanced damage. “Other off-weapon enhanced damage” includes applicable strength/dexterity, mastery, aura and equipment bonuses; the calculator adds the charge's supplied enhanced damage separately. No critical/deadly strike, dual-wield averaging, added gear damage, hit chance or attack speed is inferred. Weapon scaling is not edited through the flat Min/Max tier boxes. Cobra Strike added Venom/gear poison and leech recovery are excluded.

The uploaded source data is authoritative for this build. Current wiki descriptions differ in places: e.g. Fists of Fire meteor physical synergy references Phoenix Strike in current patch notes but the supplied Missile row uses Dragon Flight; Blades of Ice / Phoenix Strike cold synergies and ground-fire scaling also differ. This build retains the supplied formulas rather than mixing seasons. Charge descriptions and projectile behavior were cross-checked with https://wiki.projectdiablo2.cn/wiki/All_Assassin_Skills ; complete in-game matching is not guaranteed.

Internal names are mapped to player-visible names throughout the selector and synergy controls: Royal Strike → Phoenix Strike, Poison Dagger → Poison Strike, Fire Trauma → Fire Blast, Shock Field → Shock Web, Wake of Fire Sentry → Wake of Fire, Inferno Sentry → Wake of Inferno, Plague Poppy → Poison Creeper, Summon Fenris → Summon Dire Wolf, Eruption → Fissure, Enchant → Enchant Fire, and golem spacing. Original internal names/IDs and raw formulas remain available in the generated data for auditing. Name references: PD2 wiki All Assassin, Necromancer, Druid and Sorceress Skills pages.

The page includes: “Built with AI. Found an issue? Tag fvm on the PD2 Discord.” It recommends https://hiimpd2.com/planner and https://hiimpd2.com/damage-calc for more detailed information.

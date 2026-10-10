# PD2 Damage Calculator — compact game-data edition

Extract this ZIP and open `index.html` in a modern browser. No installation or server is required. For GitHub Pages, replace the existing calculator files in your repository and publish the repository root. No original game files are needed at runtime.

## What changed

- Compact controls, spacing, typography and two-column desktop layout. The main calculator is designed for a typical 1366×768 desktop at 100% zoom with season scaling closed. Smaller windows and expanded scaling can scroll.
- 231 class skills: 96 supported damage components (94 direct, 2 missile), versus 87 in the original archive. 135 remain unsupported. Skill options and result status distinguish them; unsupported skills produce no invented damage.
- Corrected `HitShift`: damage fields × 2^HitShift / 256. Blank HitShift is zero. Added non-weapon physical components, including War Cry, Twister, Tornado and Mind Blast.
- Poison uses the shifted damage rate × duration in frames. It displays skill duration, target duration before/after pierce, effective total damage, DPS and damage per frame at 25 fps. Small values retain three decimal places.
- Editable **Skill scaling & season adjustments** remains collapsed. Apply/Reset changes only the current browser session.

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

Six min/max entries are base at level 1, followed by increments for levels 2–8, 9–16, 17–22, 23–28 and 29+. Synergy `pctPerHardPoint` uses fractions (0.24 = 24% per hard point). Synergy controls default to 20; set actual hard points for your build. +skill damage is applied multiplicatively after the summed synergy bonus.

Poison min/max entries are total damage over `poisonDurationSec`, not raw damage per frame. Imported `poisonLengthSteps` has base frames and increments for levels 2–8, 9–16 and 17+; edit those for duration changes. Do not change only `poisonDurationSec` while retaining inconsistent length steps.

Reimport future data with Python 3:

```sh
python3 import_pd2.py Skills.txt Missiles.txt Skilldesc.txt MissCalc.txt > skills.js
```

Original uploaded names may be used with quoted paths. The order is Skills, Missiles, Skilldesc, MissCalc. Skills/Missiles provide numeric damage and restricted linear hard-point synergies. Skilldesc display-damage expressions and related MissCalc token descriptions are retained as audit metadata. These two files are not full calculation engines; arbitrary tooltip expressions, missile functions and game server functions are not interpreted.

Reference for game-data damage precision:
https://github.com/andersgong/d2bin2txt/blob/master/bin2txt/skills.c (embedded Skills.txt file guide).

## Scope and limitations

Results are a **single imported damage component**, not necessarily complete skill damage or DPS. Weapon damage, physical+elemental combinations, summons/trap pierce penalties, mastery automation, charge mechanics, attack speed, multiple impacts, projectile count, damage conversion and special server functions are not modeled. Use the matching damage type and the +damage field for applicable bonuses. Other components may be omitted even where one component is supported. Unsupported skills can use a manually entered experimental formula; examples are not game data.

## Validation

Run `node test.js` with Node.js. Tests check all 96 components across eleven levels, scaling boundaries, level-one reference values, below-zero resistance, immunity, resistance cap, poison length/rate consistency, and UI logic for all 231 selections plus Apply/Reset/error handling using a simulated document.

Automated tests passed. Browser visual verification was unavailable: local hosting was denied by the environment and the browser security policy blocked local-file navigation. Desktop fit is a design target, not a screenshot-verified guarantee.

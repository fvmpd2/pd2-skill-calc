# PD2 Damage Lab — GitHub Pages starter

Static, mobile-friendly prototype with all seven classes, searchable preliminary skill roster, configurable skill inputs, editable formula workspace and +1 skill vs +5% damage comparison. No backend, install or build step.

## Publish
1. Make a **public** GitHub repository called `pd2-skill-calc`.
2. Upload the files from this folder to the **repository root** (not inside another folder).
3. Settings → Pages → Build and deployment → Deploy from a branch → `main` → `/ (root)` → Save.
4. Visit `https://YOUR-USERNAME.github.io/pd2-skill-calc/` after GitHub has deployed it.

Open `index.html` directly to run locally; or use `python3 -m http.server 8000` and visit http://localhost:8000.

## Status / important accuracy warning
The skill roster is an **unverified starter checklist** of potentially damage-related, summon and support skills (some are not direct damage skills). It is NOT claimed to reflect every current PD2 Season 14 skill. All real skills have `formula: null`; **no actual PD2 damage values have been entered**. The working example in the interface is deliberately fictional. Verify names, scaling, synergy rules and current patch data before publishing as accurate.

## Add a formula
Open `skills.js`, find the intended skill object (produced in the `skills` array), and set `formula` on that object. The easiest first approach is to put explicit overrides at the bottom of `skills.js`:

```js
const mySkill = skills.find(s => s.id === 'necromancer-teeth');
mySkill.formula = {
  kind: 'flat', damageType: 'magic',
  min: [10, 4, 5, 6, 7, 8],
  max: [15, 5, 6, 7, 8, 9],
  synergy: [{ name:'Example synergy', pctPerHardPoint:0.06 }]
};
```

**These are fake example values; replace with game data.** Scaling arrays mean `[base at lvl 1, per-level gains for levels 2–8, 9–16, 17–22, 23–28, 29+]`. `pctPerHardPoint` is a fraction, e.g. `0.06` means +6% per hard point. This simplified model assumes additive synergy bonuses multiplied by gear skill-damage percentage. It DOES NOT model more complex PD2 mechanics.

### Work left
- Audit all class trees/names and which skills deal damage in your target season.
- Import **verified** data from PD2 game TXT files or patch-specific wiki. Record formula source/version.
- Extend `calc.js` with separate formula kinds for weapon damage, physical ED, poison/burn duration, summon minions, multi-hit missiles, aura pulses, conversion, attack frames, enemy resistances and pierce.
- Support relevant mastery interactions, +skill buckets and synergy snapshots.
- Add automated per-skill regression tests matching in-game tooltips.

Useful references: https://wiki.projectdiablo2.com/ and https://github.com/BetweenWalls/portal (existing open-source D2 planner with PD2 support). Check each project's licensing before copying code/data.

## Interface update

Skill selection now lists names without category labels. The single **Skill level** slider represents the total skill level (hard points and gear combined). **+ Skill damage (%)** and **− Enemy resistance (%)** are editable numbers alongside each other. The **Skill scaling & season adjustments** editor is collapsed by default. Expand it to modify per-level scaling arrays and synergies for the selected skill.

The enemy resistance calculation currently assumes the target begins with **0% resistance**, clamps effective resistance to **−100%**, and does not handle immunities or damage-type-specific penetration mechanics. Treat this as a simplified damage model pending game-specific verification.


## Damage type, resistance, and poison
Select the damage type in the Build inputs panel (inferred from skill names only until verified). Enter enemy resistance, your -enemy resistance and, for poison, enemy PLR. Poison is calculated as **total damage over time**, plus displayed damage per second and the modified duration.

For poison formulas, add `"damageType": "poison"` and `"poisonDurationSec": 2` (replace **2** with the verified duration) to the formula JSON. The input min/max values represent total poison damage over the unmodified base duration.

Provisional D2-derived model: `effective resistance = clamp(enemyResistance - pierce, -100, 100)`; `effective PLR = clamp(enemyPLR - pierce, -100, 75)`; `duration = base duration × (1 - effective PLR/100)`; `total poison damage = base total × skill/synergy multipliers × (1 - effective resistance/100) × duration/base duration`. The -enemy resistance modifier is assumed to modify poison length resistance as in base Diablo II. **Verify these specifics against the current PD2 season**, including immunity rules, piercing limits, summon/trap modifiers, and any individual skill exceptions. The damage type chosen in the interface is saved as a temporary local override if the skill already has a formula; changes to JSON must be copied to skills.js to persist.

## Compact layout update

The main page now has class/skill selectors, skill level and synergy inputs, a damage-modifier panel, and a damage results table. Type, +skill damage, -enemy resistance, enemy resistance and conditional poison PLR are editable. Level-scaling JSON is collapsed by default and editable. Base DMG in the results includes synergies but excludes +skill damage and target resistances; Net DMG includes +skill damage; Effective Damage applies resistance, and for poison the provisional duration/PLR modifier. Skills without supplied formulas show no invented damage numbers.

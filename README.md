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

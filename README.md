# PD2 Damage Calculator — skill audit edition (v12)

Extract the ZIP and open `index.html`, or replace the calculator files in your GitHub Pages repository. Keep `index.html`, `style.css`, `skills.js`, `calc.js` and `main.js` together. Upload extracted files, not the ZIP. The original game text files are not required by the website.

## This release

All **231 class-tagged source rows** have been classified. **124 entries** have selectable damage models. The row-by-row findings are in `SKILL_AUDIT.md` and `SKILL_AUDIT.csv`. “Calculated” means the listed damage application is modeled; it does not mean full character/army DPS or exact in-game verification.

- Fire Golem: separate **physical punch**, **added melee fire**, and **Holy Fire aura pulse**. Clay/Blood/Fire physical bases use the newly supplied MonStats **Hell** values. Normal/Nightmare controls are omitted. Iron Golem and Revive are omitted because their item/monster inputs are outside the requested scope.
- Necromancer summons: warrior and archer physical damage, effective Skeleton Mastery levels, hard-point synergies, warrior level ED, and the four alternative mage elements. Mage bolts use their own effective missile level. Poison mages use the supplied 12-frame duration (0.48 seconds), consistent with the PD2 reference table.
- Dark Pact: curse count is a separate damage modifier. No curse means no damage; each curse after the first adds 10%. This multiplier is applied in the damage-bonus column, separately from hard-point synergies.
- Corpse Explosion: flat physical and fire are separate rows with separate resistances. The damage area mentions the additional 5–10% corpse-base-life contribution, split equally between physical/fire; that contribution is deliberately not calculated. Death Sentry has the corresponding 3–5% note.
- Paladin: removed false damage entries such as Resist Fire/Cold/Lightning, Salvation and defensive bonuses. Holy Fire/Freeze/Shock and Sanctuary separate aura pulse from added attack damage. Fist of the Heavens separates lightning strike and surrounding magic bolts. Holy Light distinguishes enemy versus ally casts.
- Other components: physical/fire impacts for Meteor, Molten Boulder, Volcano and Armageddon; ground fire; Power Strike and Thunder Storm novas; Arctic Blast shatter nova; Tornado collision and area pulses; weapon/source physical damage for supported attacks and blade skills.
- Druid summons: effective Grizzly passive ED and optional Dire Wolf corpse-fed ED are included. Results are per summon, not an army total.
- Source/tooltip conflicts are identified locally: Blaze ignition, Holy Shock minimum, and Death Sentry server/player scaling. Results for these should not be treated as confirmed server matches.

Shattering Arrow was a hidden internal entry, not an additional player skill-tree choice. Its Skilldesc coordinates are zero and its name token matches Freezing Arrow; it is referenced by internal missiles such as `shatteringarrowexp2`. It has been removed from the selector.

## Inputs and interpretation

Skill level includes gear. Synergy inputs are hard points, defaulting to 20; set your actual build. Separate “effective level” inputs include gear and are used only where the game formula uses soft levels. Damage-type controls are locked to the imported component to prevent changing a fire formula into poison or another invalid type.

For weapon attacks, enter weapon-local physical Min/Max **before off-weapon ED**. Other ED includes applicable strength/dexterity, mastery, aura and equipment bonuses; skill and hard-point synergy ED are added by the calculator. Values are per hit from one weapon. Dual-wield averaging, critical/deadly strike, hit chance, gear elemental damage and attacks per second are not inferred. Blade skills currently assume a one-handed weapon; other weapon-type penalties remain excluded.

Fire Golem’s Hell base punch is 18–47 before added fire and other summon ED; Clay is 84–120 and Blood is 60–188. These monster rows have `noRatio=1`, so MonLvl scaling does not apply. MonLvl was checked rather than applied as an additional multiplier. Skeleton Archer’s attack uses the skill’s physical scaling; native monster baseline is not added again. Raven damage comes from its skill referenced by MonStats; no additional physical base attack is recorded.

Separate groups distinguish attacks, pulses, alternate targets/charges, and persistent damage. Instant impacts are combined only within a group; damage per second and poison totals are not added to instantaneous impacts. Projectile count, overlap and exposure time are not assumed. Multi-stage skills may require scrolling despite the compact layout.

Continuous rates use 25 fps. Fire-wall damage function 3 uses three damage units per frame (×75); Wake of Inferno follows its explicit Skilldesc ×25/3 display formula. Arctic Blast’s shatter nova uses the tooltip’s ×6 damage. Source data remains authoritative when wiki patch notes differ. Blaze’s explosion is explicitly labeled as a tooltip calculation because its ignition missile differs.

## Resistance and poison

Enter **Enemy starting res** before debuffs. Enter the combined reduction from applicable immunity-breaking skills in **Breaking pierce**, as a positive percentage. The adjacent “?” lists relevant skills for that damage type (for example, Sanctuary for magic and Lower Resist/Poison Creeper for poison). Skill debuffs are entered manually, not automatically inferred. Ordinary item/skill pierce has a separate input. Apply any applicable pet/trap ownership adjustment before entering it.

Breaking pierce is halved against a target initially at 100% resistance or more. Ordinary pierce applies only if immunity is broken (resistance below 100%). The combined below-zero portion is halved, truncating toward zero with a −100 floor. See [PD2 resistance mechanics](https://wiki.projectdiablo2.cn/wiki/Game_Mechanics#Reducing_Resistances).

The single Breaking pierce box treats the entered total as one reduction for rounding. PD2 rounds each immunity-breaking source separately, so multiple odd-valued sources can give a different result: 21 + 31 gives 25 in game, whereas the combined 52 box gives 26. This is a limitation of the requested combined input. If starting resistance already includes debuffs, leave Breaking pierce at zero to avoid double counting.

Poison damage rate and duration are independent. The calculator shows before/after duration, damage per frame at 25 fps, DPS and effective total poison damage. Totals equal per-frame damage × duration × 25.

**The half-strength poison-length effect remains the user-requested model, not an independently confirmed PD2 rule:** effective PLR = clamp(target PLR − pierce/2, −100, 75). No pierce length effect is applied while immune. Duration uses continuous arithmetic; fixed-point rounding and integer-frame behavior can differ in game. This qualification lives here rather than in the removed long website footer.

## Editable scaling

The collapsed editor retains twelve boxes: starting Min/Max at level 1, followed by increments at levels 2–8, 9–16, 17–22, 23–28 and 29+. Select a component to edit when a skill has several components. Apply preserves synergies and special-model metadata; Reset restores that component. Changes affect this browser session only.

Poison boxes hold total damage over the formula’s reference duration. Rate-component boxes hold damage per second. Mage scaling refers to the effective **bolt level**, not directly to summon level. Weapon and monster-base models use their designated inputs instead of editable flat tiers.

## Rebuilding the catalogue and audit

Python 3 is needed only to rebuild, not to use the website:

```sh
python3 import_pd2.py Skills.txt Missiles.txt Skilldesc.txt MissCalc.txt MonStats.txt MonLvl.txt > skills.js
python3 build_audit.py Skills.txt Missiles.txt Skilldesc.txt MissCalc.txt MonStats.txt MonLvl.txt
```

MonStats/MonLvl are optional for the converter; supplying them enables fixed Hell golem bases. Keep `audit_pd2.py` and `summons_pd2.py` beside the importer. `Skilldesc` and `MissCalc` metadata are retained; arbitrary server functions are not universally interpreted. The semantic audit includes rules for the supplied season and must be reviewed when updating future seasons.

`SKILL_AUDIT.md` lists numeric source fingerprints, all seven classes, excluded entries, calculated components and remaining work. Numeric data comes from the six uploaded files. The [PD2 Necromancer](https://wiki.projectdiablo2.cn/wiki/All_Necromancer_Skills), [Paladin](https://wiki.projectdiablo2.cn/wiki/All_Paladin_Skills), [Amazon](https://wiki.projectdiablo2.cn/wiki/All_Amazon_Skills), [Assassin](https://wiki.projectdiablo2.cn/wiki/All_Assassin_Skills), [Druid](https://wiki.projectdiablo2.cn/wiki/All_Druid_Skills) and [Sorceress](https://wiki.projectdiablo2.cn/wiki/All_Sorceress_Skills) descriptions were cross-checked. The Barbarian mirror was inaccessible; supplied formulas were used. Damage-field precision reference: [converter author’s embedded Skills guide](https://github.com/andersgong/d2bin2txt/blob/master/bin2txt/skills.c).

## Verification and deployment

Run `node test.js`. Tests cover every available component at eleven level boundaries; all selectable UI entries; damage types; immunity/negative resistance; poison rate/duration consistency; charge/summon/curse modifiers; mixed impacts; Hell monster bases; editable overrides; and dynamic inputs using a simulated document. All checks passed.

This is automated formula/UI-logic verification, **not a live in-game comparison or visual browser check**. Some server/tooltip discrepancies and equipment/conversion models remain unresolved; see the audit. No blanket claim that all skill components are fully modeled is made.

The website retains the fiery dark theme, alphabetical classes, “Built with AI” and the fvm/Hiim resource notice together beneath the title. Versioned asset links request fresh v12 files. Wait for GitHub Pages deployment to complete and hard-refresh if the old version remains visible. Preserve unrelated files, `.git`, `.github` and any custom-domain `CNAME` when replacing calculator files.

## Teleport comparison (v12)

Every selectable Sorceress skill has a **Teleport (slvl)** dropdown in Skill levels (1–100). Select your effective level including +skills. The calculated penalty appears beside it; level 1 is selected initially. The supplied Skills row and [Teleport skill table](https://wiki.projectdiablo2.cn/wiki/All_Sorceress_Skills#Teleport) give a one-second debuff, starting at 50% at level 1, decreasing by one percentage point per effective level to zero at level 51.

The additional output below the main damage shows each component with the penalty, before and after resistance, using damage × (1 − penalty/100), with penalty = max(0, 51 − effective Teleport level). It preserves all existing synergies, bonuses and resistance inputs. Multi-component and continuous damage retain the units of their main output. This is a comparison while the debuff applies; the calculator does not simulate cast timing, persistent spell snapshotting or the lifetime of Hydra/ground effects. Main damage remains unchanged. Checks cover all selectable Sorceress skills, component output, 0–100% boundaries, changing the input and hiding the controls for other classes.

## Saving and sharing (v12)

The address updates automatically as you change calculator inputs. Click **Copy build link** to save or share the current setup, or bookmark the page. Opening the link restores skill selection, levels, synergies, resistance/bonus inputs, summon/weapon inputs, Teleport level, selected scaling component and applied custom scaling. Unapplied scaling edits are not included. If clipboard access is unavailable, a selectable link box appears.

Build data is embedded in the URL fragment (`#build=...`); no account or database is needed. Custom scaling can make links longer. Links restore inputs against the site's current game data, so future season updates may change results. Unsupported/invalid skill links show a helpful message; malformed scaling is ignored. Tested with saved/restored spell, martial arts, poison and summon builds, custom scaling and invalid links.

## Results layout (v12)

Every damage type uses the same modifier slots: Skill damage, −Enemy res %, Enemy res on the first row; Breaking pierce on the left and poison length reduction on the right of the second row. Physical skill damage is disabled because that modifier does not apply. Normal and Teleport results sit together per component, with before/after resistance columns. Synergy and bonus details are in a collapsed Calculation breakdown.

**Truncate numbers** defaults on and truncates displayed damage toward zero to whole numbers. Uncheck it to display the computed JavaScript numeric precision (a maximum of 3 decimal places). The underlying calculation is unchanged; duration and percentage labels keep their own units/precision. The preference is saved in build links.

Typography uses a shared scale: 12px controls/table text, 11px helper text, 13px component headings, 15px panel headings and a 22px page title.

The Reset button beside Copy build link keeps the selected class/skill and display preference. It resets main/Teleport levels to 1, synergies to their default 20 (still editable), modifiers to zero, weapon inputs to zero, and clears applied scaling edits for the selected skill. Mastery resets to zero except Skeleton Mage’s required minimum of 1; Dark Pact curse count resets to 1. Other extra inputs reset to zero. The saved link updates to the reset setup.

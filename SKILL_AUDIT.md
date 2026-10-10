# PD2 calculator skill audit — v6

All 231 class-tagged Skills rows have a classification; 124 are selectable. This is a source/model audit, not in-game verification of every component.

## Coverage labels

- calculated: listed single-hit, pulse or rate components are calculated; timing, crits and repeated-target hits are not inferred.
- partial: excluded effect or unresolved tooltip/server difference.
- input-required: weapon range and other enhanced damage must be entered.
- conditional: buff or event-dependent returned damage. Selectable only when a damage formula exists.
- non-damaging: utility, defensive or resistance stat fields; omitted.
- needs-model: omitted, pending conversion/equipment/monster/server logic, or extensive inputs excluded by request.
- internal: hidden engine helper or placeholder; omitted.

| Status | Rows |
| --- | ---: |
| calculated | 72 |
| conditional | 8 |
| input-required | 18 |
| internal | 7 |
| needs-model | 17 |
| non-damaging | 80 |
| partial | 29 |

## Findings

Fire Golem separates Hell physical punch, added melee fire and Holy Fire pulse. Clay/Blood physical bases also use Hell MonStats A1 values. All three have noRatio=1; MonLvl multipliers do not apply. Iron Golem and Revive are excluded by request.

Dark Pact adds 10% per curse after the first; zero curses gives zero damage. Corpse Explosion includes flat physical/fire and mentions the excluded corpse-life contribution. Skeletal warriors/archers/mages and Druid summons include their applicable mastery/passive modifiers.

Resist Fire/Cold/Lightning and Salvation are bonuses, not damaging attacks. Aura attacks have separate pulse/on-hit values. Other additions include physical/fire impacts, ground fire, secondary novas and Tornado collision/pulse damage.

Shattering Arrow is a hidden internal row (ID 365): its Skilldesc page/row/column are zero and its name token matches Freezing Arrow. It feeds internal missiles such as shatteringarrowexp2, not a separate skill-tree attack. It is removed from the selector.

Unresolved source differences: Blaze explosion tooltip versus ignition missile; Holy Shock tooltip minimum 1 versus passive minimum; Death Sentry player physical increments versus summoned server row. The calculator identifies these differences instead of silently mixing them.

## Sources

Uploaded scaling is authoritative. Descriptions were cross-checked with the following PD2 wiki pages; wiki/season differences do not silently replace uploaded values.

- [Amazon skill descriptions](https://wiki.projectdiablo2.cn/wiki/All_Amazon_Skills)
- [Assassin skill descriptions](https://wiki.projectdiablo2.cn/wiki/All_Assassin_Skills)
- [Necromancer skill descriptions](https://wiki.projectdiablo2.cn/wiki/All_Necromancer_Skills)
- [Paladin skill descriptions](https://wiki.projectdiablo2.cn/wiki/All_Paladin_Skills)
- [Druid skill descriptions](https://wiki.projectdiablo2.cn/wiki/All_Druid_Skills)
- [Sorceress skill descriptions](https://wiki.projectdiablo2.cn/wiki/All_Sorceress_Skills)
- Barbarian formulas were checked against supplied Skills/Skilldesc; the accessible wiki mirror failed to load.
- [Damage precision/data-field reference](https://github.com/andersgong/d2bin2txt/blob/master/bin2txt/skills.c)

Input SHA-256 fingerprints:

- Skills.txt: `19f8efbafbe5e2e58f0f010028efc580a4a1ec8899e857094f2cd94b6dd806f4`
- Missiles.txt: `056eb678514d8e1f6162ef915260c05a12b53639564d8a0a320da0bc0dee196e`
- Skilldesc.txt: `3ff24b80883864ea2531875d4efb22c8500c937d2426c60a8301144f7c778676`
- MissCalc.txt: `3aaaea44299543cc09ca5b23835fbb46182ce6365757d8ff838513e28f1422b0`
- MonStats.txt: `1b3c08d28b4093d4c154798a5ae9e794f0ed08b1702ee2cb938b1bc5c2e4c5b2`
- MonLvl.txt: `bda243efe1d1e9591f75b8cf97ac73f78ff691362381f35cc000233eb46c092a`

## Amazon

| Skill | Selectable | Status | Components / limitations |
| --- | --- | --- | --- |
| Avoid | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Charged Strike | yes | partial | Weapon strike: Physical weapon (physical, per hit); Elemental damage: Lightning (lightning, per hit) — Weapon strike and elemental damage are shown separately; projectile counts and additional gear elements are not totaled. |
| Cold Arrow | yes | partial | cold per application — Added cold damage shown; weapon damage and conversion effects are not included. |
| Critical Strike | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Decoy | no | needs-model | Monster attack data are absent from the supplied files. |
| Dodge | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Evade | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Exploding Arrow | yes | partial | fire per application — Added fire damage shown; weapon damage and conversion effects are not included. |
| Fend | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| Fire Arrow | yes | partial | Arrow impact: Added fire (fire, per hit); Ground fire: Burning ground (fire, per second) — Added fire and ground fire shown; weapon damage and conversion are not included. |
| Freezing Arrow | yes | partial | cold per application — Added cold damage shown; weapon damage and conversion effects are not included. |
| Guided Arrow | no | needs-model | Weapon/source fractions and magic conversion need a dedicated model. |
| Ice Arrow | yes | partial | cold per application — Added cold damage shown; weapon damage and conversion effects are not included. |
| Immolation Arrow | yes | partial | Impact: Fire (fire, per hit); Ground fire: Ground fire (fire, per second) — Explosion and ground fire shown separately; arrow weapon damage is not included. |
| Inner Sight | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Jab | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| Javelin and Spear Mastery | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Lightning Bolt | yes | partial | lightning per application — Added lightning damage shown; weapon damage and conversion effects are not included. |
| Lightning Fury | yes | partial | lightning per application — Added lightning damage shown; weapon damage and conversion effects are not included. |
| Lightning Strike | yes | partial | Weapon strike: Physical weapon (physical, per hit); Elemental damage: Lightning (lightning, per hit) — Weapon strike and elemental damage are shown separately; projectile counts and additional gear elements are not totaled. |
| Magic Arrow | yes | partial | magic per application — Added magic damage shown; weapon damage and conversion effects are not included. |
| Multiple Shot | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| Penetrate | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Pierce | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Plague Javelin | yes | partial | poison per application — Added poison damage shown; weapon damage and conversion effects are not included. |
| Poison Javelin | yes | partial | poison per application — Added poison damage shown; weapon damage and conversion effects are not included. |
| Power Strike | yes | partial | Weapon strike: Physical weapon (physical, per hit); Elemental damage: Lightning (lightning, per hit); Triggered nova: Lightning nova (lightning, per hit) — Weapon strike and elemental damage are shown separately; projectile counts and additional gear elements are not totaled. |
| Shattering Arrow | no | internal | Hidden/internal entry, not a separate selectable skill-tree attack. |
| Slow Movement | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Strafe | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| Valkyrie | no | needs-model | Monster attack data and equipment rolls are absent from the supplied files. |
| amatemp2 | no | internal | Hidden/internal entry, not a separate selectable skill-tree attack. |
| amatemp3 | no | internal | Hidden/internal entry, not a separate selectable skill-tree attack. |

## Assassin

| Skill | Selectable | Status | Components / limitations |
| --- | --- | --- | --- |
| Blade Dance | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| Blade Fury | yes | partial | Blade hit: Flat physical (physical, per hit); Blade hit: Weapon physical (physical, per hit) — Flat physical + weapon physical shown. Use a one-handed weapon; other weapon types need additional penalties. |
| Blade Sentinel | yes | partial | Blade hit: Flat physical (physical, per hit); Blade hit: Weapon physical (physical, per hit) — Flat physical + weapon physical shown. Use a one-handed weapon; other weapon types need additional penalties. |
| Blade Shield | yes | partial | Blade hit: Flat physical (physical, per hit); Blade hit: Weapon physical (physical, per hit) — Flat physical + weapon physical shown. Use a one-handed weapon; other weapon types need additional penalties. |
| Blades of Ice | yes | calculated | Charge 1 · Cold hit: Cold hit (cold, per hit); Charge 2 · Ice waves: Ice wave (cold, per hit); Charge 3 · Ice bolts: Ice bolt (cold, per hit) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Burst of Speed | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Chain Lightning Sentry | yes | calculated | lightning per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Charged Bolt Sentry | yes | calculated | lightning per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Claw Mastery | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Claws of Thunder | yes | calculated | Charge 1 · Lightning hit: Lightning hit (lightning, per hit); Charge 2 · Nova: Lightning nova (lightning, per hit); Charge 3 · Charged bolts: Charged bolt (lightning, per hit); Charge 3 · Charged bolts: Lightning strike (lightning, per hit) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Cloak of Shadows | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Cobra Strike | yes | calculated | Charge 1 · Poison bolts: Poison bolt (poison, per hit); Charge 2 · Physical hit: Physical hit (physical, per hit); Charge 3 · Poison cloud: Poison cloud (poison, per hit) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Death Sentry | yes | partial | Impact: Physical (physical, per hit); Impact: Fire (fire, per hit) — Flat physical + fire damage shown. Also adds 3–5% of corpse base life, split equally between physical and fire; corpse-life damage is not included. Summoned mon death sentry has different physical increments (3/5/7/9/11 versus tooltip 5/7/9/11/13); using the server summon values. |
| Dragon Claw | no | needs-model | Requires per-claw ranges and effective Claw Mastery level. |
| Dragon Flight | no | needs-model | Requires kick/shoe/stats and skill enhanced damage. |
| Dragon Tail | no | needs-model | Kick physical damage creates a fire explosion; requires kick/shoe/stats and conversion order. |
| Dragon Talon | no | needs-model | Requires kick/shoe/stats and skill enhanced damage. |
| Fade | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Fire Blast | yes | calculated | fire per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Fists of Fire | yes | calculated | Charge 1 · Explosion: Fire explosion (fire, per hit); Charge 1 · Explosion: Ground fire (fire, per second); Charge 2 · Fire nova: Fire nova (fire, per hit); Charge 3 · Meteors: Meteor impact · Fire (fire, per hit); Charge 3 · Meteors: Meteor impact · Physical (physical, per hit); Charge 3 · Meteors: Meteor ground fire (fire, per second) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Lightning Sentry | yes | calculated | lightning per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Mind Blast | yes | calculated | physical per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Phoenix Strike | yes | calculated | Charge 1 · Meteor: Meteor impact (fire, per hit); Charge 1 · Meteor: Ground fire (fire, per second); Charge 2 · Chain lightning: Chain lightning (lightning, per hit); Charge 3 · Ice bolts: Ice bolt (cold, per hit) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Psychic Hammer | yes | calculated | magic per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Shadow Master | no | needs-model | Uses multiple autonomous skills and equipment; cannot infer a single damage range. |
| Shadow Warrior | no | needs-model | Uses copied skills, monster stats and equipment; cannot infer a single damage range. |
| Shock Web | yes | calculated | lightning per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Tiger Strike | yes | calculated | Charge 1 · Physical hit: Physical hit (physical, per hit); Charge 2 · Physical hit: Physical hit (physical, per hit); Charge 3 · Physical hit: Physical hit (physical, per hit) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Venom | yes | calculated | poison per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Wake of Fire | yes | calculated | fire per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Wake of Inferno | yes | calculated | Continuous damage: Stream (fire, per second) — Rate uses 25 fps, fire-wall damage function 3 uses ×75, and Wake of Inferno follows Skilldesc ×25/3. No source stacking or exposure duration is assumed. |
| Weapon Block | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| asatemp2 | no | internal | Hidden/internal entry, not a separate selectable skill-tree attack. |

## Barbarian

| Skill | Selectable | Status | Components / limitations |
| --- | --- | --- | --- |
| Bash | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| Battle Command | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Battle Cry | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Battle Orders | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Berserk | no | needs-model | Weapon attack and server-specific resistance effects require a dedicated model. |
| Combat Reflexes | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Concentrate | no | needs-model | Weapon attack and additional resistance effects require a dedicated model. |
| Deep Wounds | no | conditional | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Double Swing | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| Double Throw | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| Find Item | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Find Potion | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Frenzy | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| Grim Ward | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Howl | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Increased Speed | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Iron Skin | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Leap | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Leap Attack | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| Mace Mastery | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Natural Resistance | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| One Hand Mastery | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Shout | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Spear Mastery | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Split Throw | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| Stun | yes | partial | physical per application — Added physical damage shown; weapon damage and conversion effects are not included. |
| Sword Mastery | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Taunt | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Throwing Mastery | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Two Hand Mastery | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| War Cry | yes | calculated | physical per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Whirlwind | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| bartemp3 | no | internal | Hidden/internal entry, not a separate selectable skill-tree attack. |

## Druid

| Skill | Selectable | Status | Components / limitations |
| --- | --- | --- | --- |
| Arctic Blast | yes | partial | Continuous damage: Stream (cold, per second); Shatter nova: Frost nova (cold, per hit) — Rate uses 25 fps, fire-wall damage function 3 uses ×75, and Wake of Inferno follows Skilldesc ×25/3. No source stacking or exposure duration is assumed. Built-in resistance debuff is not applied automatically; Enemy res must include it. |
| Armageddon | yes | calculated | Impact: Physical (physical, per hit); Impact: Fire (fire, per hit); Ground fire: Ground fire (fire, per second) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Carrion Vine | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Cyclone Armor | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Feral Rage | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| Fire Claws | yes | partial | Weapon strike: Physical weapon (physical, per hit); Elemental damage: Fire (fire, per hit) — Weapon strike and elemental damage are shown separately; projectile counts and additional gear elements are not totaled. |
| Firestorm | yes | calculated | fire per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Fissure | yes | calculated | fire per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Fury | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| Gust | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Heart of Wolverine | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Hunger | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Hurricane | yes | calculated | Storm pulse: Cold (cold, per pulse) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Lycanthropy | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Maul | no | needs-model | Charge-dependent enhanced damage requires active charge count. |
| Molten Boulder | yes | calculated | Impact: Physical (physical, per hit); Impact: Fire (fire, per hit); Fire trail: Fire trail (fire, per second) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Oak Sage | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Poison Creeper | yes | calculated | poison per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Rabies | yes | calculated | poison per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Raven | yes | calculated | cold per application — Cold damage per peck. Damage comes from the Raven skill referenced by MonStats; no additional physical base attack is recorded. Attack timing, total pecks and item-specific bonuses are not totaled. |
| Shock Wave | yes | calculated | physical per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Solar Creeper | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Spirit of Barbs | yes | conditional | Returned damage: Flat physical return (physical, per attacker hit) — Conditional returned damage when the protected target is hit; not an active attack or DPS. |
| Summon Dire Wolf | yes | calculated | Summon attack: Physical (physical, per hit) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Summon Grizzly | yes | calculated | Summon attack: Physical (physical, per hit) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Summon Spirit Wolf | yes | calculated | Summon attack: Physical (physical, per hit) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Tornado | yes | calculated | Collision hit: Physical (physical, per hit); Area pulse: Physical (physical, per pulse) — Area damage checks every 15 frames (0.6 s). Collision and pulse are separate sources; hit count depends on path and target overlap. |
| Twister | yes | calculated | physical per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Volcano | yes | calculated | Impact: Physical (physical, per hit); Impact: Fire (fire, per hit) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Werebear | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Werewolf | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| drutemp2 | no | internal | Hidden/internal entry, not a separate selectable skill-tree attack. |
| drutemp3 | no | internal | Hidden/internal entry, not a separate selectable skill-tree attack. |

## Necromancer

| Skill | Selectable | Status | Components / limitations |
| --- | --- | --- | --- |
| Amplify Damage | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Attract | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Blood Golem | yes | partial | Melee attack: Physical (physical, per hit); Bleed: Added Deep Wounds (physical, per second) — Hell A1 base damage imported from MonStats; noRatio=1, so MonLvl multipliers do not apply. A2 ranges are not treated as an additional simultaneous hit. |
| Blood Warp | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Bone Armor | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Bone Prison | yes | conditional | Returned damage: Flat physical return (physical, per attacker hit) — Conditional returned damage when the protected target is hit; not an active attack or DPS. |
| Bone Spear | yes | calculated | magic per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Bone Spirit | yes | calculated | magic per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Bone Wall | yes | conditional | Returned damage: Flat physical return (physical, per attacker hit) — Conditional returned damage when the protected target is hit; not an active attack or DPS. |
| Clay Golem | yes | calculated | Melee attack: Physical (physical, per hit) — Hell A1 base damage imported from MonStats; noRatio=1, so MonLvl multipliers do not apply. A2 ranges are not treated as an additional simultaneous hit. |
| Confuse | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Corpse Explosion | yes | partial | Impact: Physical (physical, per hit); Impact: Fire (fire, per hit) — Flat physical + fire damage shown. Also adds 5–10% of corpse base life, split equally between physical and fire; corpse-life damage is not included. |
| Curse Mastery | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Dark Pact | yes | calculated | Dark Pact: Magic (magic, per hit) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Decrepify | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Desecrate | yes | calculated | poison per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Dim Vision | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Fire Golem | yes | calculated | Punch: Physical punch (physical, per hit); Punch: Added fire (fire, per hit); Holy Fire aura: Aura fire (fire, per pulse) — Hell A1 base damage imported from MonStats; noRatio=1, so MonLvl multipliers do not apply. A2 ranges are not treated as an additional simultaneous hit. |
| Golem Mastery | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Iron Golem | no | needs-model | Omitted by request: item-derived or arbitrary-monster attacks require too much input. |
| Iron Maiden | no | conditional | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Life Tap | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Lower Resist | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Poison Nova | yes | calculated | poison per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Poison Strike | yes | partial | poison per application — Added poison damage shown; weapon damage and conversion effects are not included. |
| Raise Skeleton Archer | yes | calculated | Summon attack: Physical (physical, per hit) — Includes mastery flat damage, hard-point synergies and skill enhanced damage. Does not include summon attack speed, crits, external elemental damage or army DPS. |
| Raise Skeleton Mage | yes | calculated | Poison mage: Poison bolt (poison, per hit); Cold mage: Cold bolt (cold, per hit); Fire mage: Fire bolt (fire, per hit); Lightning mage: Lightning bolt (lightning, per hit) — All four bolt types and soft-level mastery are modeled separately; poison uses the source missile’s 12-frame (0.48 s) duration, matching the PD2 wiki table. |
| Raise Skeleton Warrior | yes | calculated | Summon attack: Physical (physical, per hit) — Includes mastery flat damage, hard-point synergies and skill enhanced damage. Does not include summon attack speed, crits, external elemental damage or army DPS. |
| Revive | no | needs-model | Omitted by request: item-derived or arbitrary-monster attacks require too much input. |
| Skeleton Mastery | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Teeth | yes | calculated | magic per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Terror | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Weaken | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |

## Paladin

| Skill | Selectable | Status | Components / limitations |
| --- | --- | --- | --- |
| Blessed Aim | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Blessed Hammer | yes | calculated | magic per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Charge | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| Cleansing | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Concentration | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Conviction | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Defiance | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Fanaticism | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Fist of the Heavens | yes | calculated | Direct target: Lightning strike (lightning, per hit); Surrounding targets: Holy bolt (magic, per hit) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Holy Bolt | yes | calculated | magic per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Holy Fire | yes | calculated | Aura pulse: Pulse (fire, per pulse); Added attack damage: Added fire (fire, per hit) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Holy Freeze | yes | calculated | Aura pulse: Pulse (cold, per pulse); Added attack damage: Added cold (cold, per hit) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Holy Light | yes | calculated | Cast on enemy: Magic area damage (magic, per hit); Cast on ally: Magic area damage (magic, per hit) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Holy Nova | yes | calculated | magic per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Holy Shield | no | conditional | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Holy Shock | yes | partial | Aura pulse: Pulse (lightning, per pulse); Added attack damage: Added lightning (lightning, per hit) — Attack minimum follows the server passive formula; the tooltip forces a minimum of 1 and may display a different value. |
| Holy Sword | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Joust | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| Meditation | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Might | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Prayer | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Redemption | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Resist Cold | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Resist Fire | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Resist Lightning | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Sacrifice | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |
| Salvation | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Sanctuary | yes | partial | Aura pulse: Pulse (magic, per pulse); Added attack damage: Added magic (magic, per hit) — Sanctuary also reduces enemy magic resistance by 5 + skill level / 2. Enter the target’s resistance after that aura/debuff in Enemy res; do not enter it again as item pierce. |
| Smite | no | needs-model | Requires shield base damage, Holy Shield and character/equipment enhanced damage. |
| Thorns | yes | partial | Returned damage: Flat physical return (physical, per attacker hit); Added bleed · Allies: Deep Wounds (physical, per second); Added bleed · Paladin: Deep Wounds (physical, per second) — Conditional returned damage when the protected target is hit; not an active attack or DPS. |
| Vengeance | no | needs-model | Amplifies added fire/cold/lightning damage; requires full weapon/gear elemental ranges and server behavior. |
| Vigor | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Zeal | yes | input-required | Weapon attack: Physical (physical, per hit) — Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled. |

## Sorceress

| Skill | Selectable | Status | Components / limitations |
| --- | --- | --- | --- |
| Blaze | yes | partial | Continuous damage: Fire trail (fire, per second); Initial explosion: Fire explosion · tooltip (fire, per hit) — Rate uses 25 fps, fire-wall damage function 3 uses ×75, and Wake of Inferno follows Skilldesc ×25/3. No source stacking or exposure duration is assumed. Tooltip explosion and ignition missile disagree; tooltip calculation is shown explicitly and is not claimed to reproduce the server ignition result. |
| Blizzard | yes | calculated | cold per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Chain Lightning | yes | calculated | lightning per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Charged Bolt | yes | calculated | lightning per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Chilling Armor | yes | calculated | cold per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Cold Enchant | yes | conditional | cold per application — Added attack damage only; this buff does not deal a separate hit. |
| Cold Mastery | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Combustion | yes | calculated | fire per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Enchant Fire | yes | conditional | fire per application — Added attack damage only; this buff does not deal a separate hit. |
| Energy Shield | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Fire Ball | yes | calculated | fire per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Fire Bolt | yes | calculated | fire per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Fire Mastery | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Fire Wall | yes | calculated | Continuous damage: Fire wall (fire, per second) — Rate uses 25 fps, fire-wall damage function 3 uses ×75, and Wake of Inferno follows Skilldesc ×25/3. No source stacking or exposure duration is assumed. |
| Frost Nova | yes | calculated | cold per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Frozen Orb | yes | calculated | cold per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Glacial Spike | yes | calculated | cold per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Hydra | yes | calculated | fire per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Ice Barrage | yes | calculated | cold per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Ice Blast | yes | calculated | cold per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Ice Bolt | yes | calculated | cold per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Inferno | yes | partial | Continuous damage: Stream (fire, per second) — Rate uses 25 fps, fire-wall damage function 3 uses ×75, and Wake of Inferno follows Skilldesc ×25/3. No source stacking or exposure duration is assumed. Built-in resistance debuff is not applied automatically; Enemy res must include it. |
| Lesser Hydra | yes | calculated | fire per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Lightning | yes | calculated | lightning per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Lightning Mastery | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Meteor | yes | calculated | Impact: Physical (physical, per hit); Impact: Fire (fire, per hit); Ground fire: Ground fire (fire, per second) — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Nova | yes | calculated | lightning per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Shiver Armor | yes | calculated | cold per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Static Field | no | needs-model | Percentage-of-current-life attack with difficulty/target rules; no flat range. |
| Telekinesis | yes | calculated | lightning per application — Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled. |
| Teleport | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |
| Thunder Storm | yes | calculated | Lightning strike: Lightning (lightning, per hit); Triggered nova: Lightning nova (lightning, per hit) — The strike triggers an area nova. Each rolls its own damage; no assumed overlap or attack frequency. |
| Warmth | no | non-damaging | Buff, resistance, defensive or utility stat fields are not direct attack damage. |

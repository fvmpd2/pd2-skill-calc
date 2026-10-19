# S14 Open Beta calculator update

Source: uploaded Live installation, extracted 20 October 2026. Archive and table SHA-256 fingerprints are in `SOURCE_MANIFEST.json`. The main catalogue and Reset now use S14 Open Beta. Previous season-comparison output has been removed.

## Damage and passive updates

- Fire Arrow: ground-fire synergies use Immolation Arrow and Magic Arrow at 15% each.
- Frost Nova: synergies increase to 8%; Shiver Armor now uses Frost Nova, and Chilling Armor uses Blizzard.
- Meteor: ground fire now uses Fire Ball, Inferno and Blaze, matching impact synergies. The old Fire Wall-only note is removed.
- Poison Nova: 11% synergies; the level 29+ increment is 9 raw units instead of 10.
- Skeleton Archer: larger physical base and tier increments. Synergies remain in passivecalc4 despite blank DmgSymPerCalc; they are retained.
- Druid summons: updated wolf/bear damage and Dire Wolf 5% synergies. Wolf damage bonuses from Grizzly use invested hard points. Dire Wolf includes level-based physical pierce; its corpse-fed enhanced damage uses the supplied parameter.
- Twister/Tornado: updated physical scaling; Hurricane: updated maximum scaling and 13% synergies.
- Fists of Fire: charge-1 ground-fire synergies now use Tiger Strike and Dragon Flight. Phoenix Strike: updated meteor impact scaling and 10% synergy; charge-3 ice damage doubled.
- Dark Pact: up to four curses consumed; the existing 10% per additional curse applies through the fourth curse.

## Scope of other source changes

Timing, radius, projectile propagation, movement speed, defenses and proc flags do not change the per-application damage output. They are listed below rather than converted into assumed DPS or target counts. The calculator still omits player weapon-dependent skills, Iron Golem and Revive. Thorns’ additional percentage-returned damage depends on the incoming hit and is not totaled. Poison Strike’s new player buff is outside its omitted weapon model.

The retained Druid Crit/Deadly Strike comparisons remain available; War Cry has none. Arbitrary server/DLL changes are not inferred from TXT tables. Current data confirms unchanged Sorceress Mastery and Teleport formulas. Existing source/tooltip limitations remain identified in the skill audit.

## Changed class-tagged Skills rows

| Skill | Selector scope | Changed fields |
| --- | --- | --- |
| Magic Arrow | selectable | calc3 |
| Fire Arrow | selectable | calc3, Param7, EDmgSymPerCalc |
| Jab | omitted | Param4, Param8 |
| Cold Arrow | selectable | calc3 |
| Multiple Shot | omitted | calc1, Param1, Param5, Param6 |
| Power Strike | omitted | aurarangecalc, calc1, Param1, Param8 |
| Charged Strike | omitted | Param7, Param8 |
| Evade | omitted | passivecalc1 |
| Fend | omitted | aurastate |
| Lightning Strike | omitted | calc1, Param8 |
| Warmth | omitted | passivestat2 |
| Frost Nova | selectable | Param8 |
| Blaze | selectable | passivecalc1, Param3, Param4, Param5 |
| Shiver Armor | selectable | EDmgSymPerCalc |
| Chilling Armor | selectable | EDmgSymPerCalc |
| Amplify Damage | omitted | Param5 |
| Teeth | selectable | calc3 |
| Poison Strike | selectable | srvstfunc, aurastate, aurastat1, aurastatcalc1, aurastat2, aurastatcalc2, calc1 |
| Bone Spear | selectable | calc3 |
| Blood Golem | selectable | delay |
| Decrepify | omitted | aurastatcalc1, aurastatcalc4, aurastatcalc5, Param5, Param6 |
| Raise Skeleton Archer | selectable | MinDam, MinLevDam1, MinLevDam2, MinLevDam3, MinLevDam4, MinLevDam5, MaxDam, MaxLevDam1, MaxLevDam2, MaxLevDam3, MaxLevDam4, MaxLevDam5, DmgSymPerCalc |
| Lower Resist | omitted | Param5 |
| Poison Nova | selectable | Param8, EMinLev5, EMaxLev5 |
| Sacrifice | omitted | calc2, Param3 |
| Smite | omitted | Param5 |
| Holy Bolt | selectable | calc3 |
| Thorns | selectable | aurastat4, aurastatcalc4 |
| Zeal | omitted | aurastate |
| Concentration | omitted | aurastatcalc2, Param5 |
| Fist of the Heavens | selectable | Param1 |
| One Hand Mastery | omitted | Param6 |
| Double Swing | omitted | srvstfunc, aurastate, aurastat1, aurastatcalc1, cltstfunc, cltcalc1, calc3 |
| Two Hand Mastery | omitted | passivecalc4, Param3, Param4, ELen |
| Leap Attack | omitted | Param4, Param8 |
| Whirlwind | omitted | Param1, Param2, Param3 |
| Berserk | omitted | calc3 |
| Natural Resistance | omitted | Param2 |
| War Cry | selectable | restrict |
| Poison Creeper | selectable | delay |
| Firestorm | selectable | cltdofunc |
| Summon Spirit Wolf | selectable | passivecalc3, calc1, MinLevDam1, MinLevDam2, MinLevDam3, MinLevDam4, MinLevDam5, MaxLevDam3, MaxLevDam4, MaxLevDam5 |
| Feral Rage | omitted | aurastatcalc2 |
| Fissure | selectable | EMinLev3, EMinLev4, EMinLev5, EMaxLev3, EMaxLev4, EMaxLev5 |
| Summon Dire Wolf | selectable | passivecalc2, passivecalc3, passivestat4, passivecalc4, Param1, Param2, Param5, MinDam, MinLevDam1, MinLevDam2, MinLevDam3, MinLevDam4, MinLevDam5, MaxDam, MaxLevDam1, MaxLevDam2, MaxLevDam3, MaxLevDam4, MaxLevDam5, DmgSymPerCalc |
| Fire Claws | omitted | srvstfunc, srvmissileb, srvmissilec, aurastate, aurastat1, aurastatcalc1, aurastat2, aurastatcalc2, cltstfunc, cltmissileb, cltmissilec, HitShift, EMin, EMinLev1, EMinLev2, EMinLev3, EMinLev4, EMinLev5, EMax, EMaxLev1, EMaxLev2, EMaxLev3, EMaxLev4, EMaxLev5 |
| Twister | selectable | MinDam, MinLevDam2, MinLevDam3, MinLevDam4, MinLevDam5, MaxDam, MaxLevDam1, MaxLevDam2, MaxLevDam3, MaxLevDam4, MaxLevDam5 |
| Solar Creeper | omitted | sumskill4, sumsk4calc |
| Shock Wave | selectable | calc3 |
| Tornado | selectable | MinDam, MinLevDam1, MinLevDam2, MinLevDam3, MinLevDam4, MinLevDam5, MaxDam, MaxLevDam1, MaxLevDam2, MaxLevDam3, MaxLevDam4, MaxLevDam5 |
| Spirit of Barbs | selectable | sumskill3, sumsk3calc |
| Summon Grizzly | selectable | passivecalc2, MinDam, MinLevDam1, MinLevDam2, MinLevDam3, MinLevDam4, MinLevDam5, MaxDam, MaxLevDam1, MaxLevDam2, MaxLevDam3, MaxLevDam4, MaxLevDam5 |
| Fury | omitted | aurastate |
| Hurricane | selectable | Param8, EMaxLev1, EMaxLev2, EMaxLev3, EMaxLev4, EMaxLev5 |
| Blade Fury | omitted | passivestate, passiveitype, passivestat1, passivecalc1, Param5 |
| Dragon Tail | omitted | aurastate, aurastat1, aurastatcalc1 |
| Mind Blast | selectable | auralencalc |
| Ice Barrage | selectable | calc3 |
| Split Throw | omitted | srvstfunc, aurastate, aurastat1, aurastatcalc1, cltstfunc, Param4 |
| Blade Dance | omitted | Param3 |
| Dark Pact | selectable | calc1 |

## Changed modeled skill entries

Fire Arrow, Frost Nova, Shiver Armor, Meteor, Chilling Armor, Raise Skeleton Archer, Poison Nova, Summon Spirit Wolf, Fissure, Summon Dire Wolf, Twister, Tornado, Summon Grizzly, Hurricane, Fists of Fire, Phoenix Strike, Dark Pact.

All 231 class-tagged entries were rebuilt, with 96 selectable entries. Numeric damage and synergies, missile components, Hell summon bases, saved links, mastery, Teleport, scaling resets and comparison controls are covered by automated checks. This is not an in-game or visual browser verification.

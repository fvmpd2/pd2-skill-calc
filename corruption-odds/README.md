# PD2 corruption outcome odds

Choose a weapon/armour base, quality and item level, then define acceptable final outcomes with OR rows. Shows percentages per original item, including brick risk. Supports slam-only, slam-then-puzzle and puzzle-first. No costs or attempt counts.

Default example: Rune Sword, 3 sockets OR ED/IAS with 2 sockets after puzzling: 7% + 1% × 50% = 7.5%. A socket slam and modifier slam are mutually exclusive. Puzzling before corrupting changes the modifier distribution.

Source: supplied S14 patch 2 CubeMain.txt (2 November 2026), Weapons.txt, Armor.txt, ItemTypes.txt. data.js includes enabled corruption outcome recipes only; disabled throwing-specific entries are excluded. Each corruption factor 1..1000 is enumerated against ordered matching recipe thresholds. Socket and puzzle rolls are capped at the base/item-level socket limit; capped outcomes accumulate. A base capped at 3 sockets therefore merges 4-socket rolls into 3.

Per-row success percentages can overlap; the overall percentage enumerates their union once. ED and IAS minimums refer only to added corruption stats, with uniform integer stat rolls. Other numerical rolls are unrestricted. Duplicate modifier families such as 10/20 FCR are explicitly grouped in the selector.

Regular/white items, jewelry, maps, desecration and special-item exceptions are outside scope. Does not claim a runtime RNG-seed audit or live-server verification. No new roll is made to increase already-existing sockets. User must have the appropriate Puzzlebox/Puzzlepiece.

Run `node test.cjs`; serve the folder as a static website. Theme and links match the other PD2 calculators.

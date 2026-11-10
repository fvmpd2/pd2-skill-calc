# Rabies & Poison Creeper — PD2 S14

A small poison-only calculator for Rabies and Poison Creeper, with the shared PD2 calculator theme and navigation.

- Average poison DPS before/after enemy resistance; min/max, per-frame and single-application totals in the breakdown.
- Effective levels, editable hard-point synergies, Creeper count and automatic capped Creeper resistance debuff.
- Lower Resist, other breaking reduction, equipment pierce and enemy poison-length reduction.
- Marginal Rabies gains, shareable build links and mobile layout. Reset preserves synergy allocations.

Serve this folder with a static web server, or open `index.html`. No dependencies or backend. Run `node test.cjs` for calculation checks.

Data: supplied `analysis/s14-patch2-2026-11-02/Skills.txt` for Plague Poppy (222) and Rabies (238); launch missile records for the unchanged trail and contagion constants. Poison base rates use HitShift / 256, five level brackets and one synergy multiplier. Creeper bonuses are entered separately: owner equipment inheritance is not assumed.

Scope: one enemy, no physical bite/attack procs, attack timing, AI, summon life, missile spread simulation, weapon-swap snapshot model or multiple-poison replacement simulation. The two skills are never summed as independent poison stacks. Single-application totals are not total outbreak damage. Base durations: Rabies 125 frames; Creeper 100 frames. Contagion frequency is not the poison tick rate.

Resistance matches the existing calculator: each breaking source is halved and floored separately against original immunity; reductions below zero have half effectiveness, effective resistance is truncated and floored at −100; gear pierce does not break immunity. The existing half-strength item-pierce-to-PLR model is retained, with effective PLR clamped to −100..75. Duration is floored to whole frames. Exact runtime Rabies reinfection/summon inheritance remains a limitation, disclosed in the UI.

Mechanics references: [Amazon Basin Rabies](https://www.theamazonbasin.com/wiki/index.php/Rabies), [D2MOO skills](https://github.com/ThePhrozenKeep/D2MOO/blob/master/source/D2Game/src/SKILLS/SkillDruid.cpp), [D2MOO missiles](https://github.com/ThePhrozenKeep/D2MOO/blob/master/source/D2Game/src/MISSILES/MissMode.cpp). Legacy descriptions do not establish PD2-specific patch behaviour.

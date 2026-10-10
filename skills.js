// Starter inventory of candidate damaging skills. AUDIT against current PD2 wiki/game files.
// No listed skill is asserted to have verified Season 14 values.
// Data model: formula can be null (unimplemented) or an object documented in README.
const groups = {
  Amazon: {
    'Javelin & Spear': ['Jab','Power Strike','Poison Javelin','Impale','Lightning Bolt','Charged Strike','Plague Javelin','Fend','Lightning Strike','Lightning Fury'],
    'Bow & Crossbow': ['Magic Arrow','Fire Arrow','Cold Arrow','Multiple Shot','Exploding Arrow','Ice Arrow','Guided Arrow','Strafe','Immolation Arrow','Freezing Arrow'],
    'Passive & Magic': ['Valkyrie','Decoy']
  },
  Assassin: {
    'Martial Arts': ['Tiger Strike','Dragon Talon','Fists of Fire','Dragon Claw','Cobra Strike','Claws of Thunder','Dragon Tail','Blades of Ice','Dragon Flight','Phoenix Strike'],
    'Traps': ['Fire Blast','Shock Web','Charged Bolt Sentry','Wake of Fire','Lightning Sentry','Wake of Inferno','Death Sentry','Blade Sentinel','Blade Fury','Blade Shield'],
    'Shadow Disciplines': ['Psychic Hammer','Mind Blast','Venom','Shadow Warrior','Shadow Master']
  },
  Barbarian: {
    'Combat Skills': ['Bash','Double Swing','Stun','Double Throw','Leap Attack','Concentrate','Frenzy','Whirlwind','Berserk'],
    'Warcries': ['War Cry','Battle Cry','Grim Ward'],
    'Combat Masteries': []
  },
  Druid: {
    'Elemental': ['Firestorm','Molten Boulder','Arctic Blast','Fissure','Cyclone Armor','Twister','Volcano','Tornado','Armageddon','Hurricane'],
    'Shape Shifting': ['Werewolf','Feral Rage','Rabies','Fire Claws','Fury','Werebear','Maul','Shock Wave','Hunger'],
    'Summoning': ['Raven','Poison Creeper','Spirit Wolf','Dire Wolf','Grizzly','Carrion Vine','Solar Creeper']
  },
  Necromancer: {
    'Poison & Bone': ['Teeth','Bone Spear','Bone Spirit','Poison Dagger','Poison Explosion','Poison Nova','Corpse Explosion','Desecrate','Bone Armor'],
    'Summoning': ['Raise Skeleton','Skeleton Mage','Clay Golem','Blood Golem','Iron Golem','Fire Golem','Revive'],
    'Curses': ['Amplify Damage','Decrepify','Lower Resist']
  },
  Paladin: {
    'Combat Skills': ['Sacrifice','Smite','Holy Bolt','Zeal','Charge','Vengeance','Blessed Hammer','Conversion','Fist of the Heavens','Holy Sword'],
    'Offensive Auras': ['Holy Fire','Holy Freeze','Holy Shock','Sanctuary'],
    'Defensive Auras': ['Thorns']
  },
  Sorceress: {
    'Cold': ['Ice Bolt','Frost Nova','Ice Blast','Glacial Spike','Blizzard','Frozen Orb','Ice Barrage'],
    'Fire': ['Fire Bolt','Warmth','Inferno','Blaze','Fire Ball','Fire Wall','Enchant','Meteor','Hydra','Combustion'],
    'Lightning': ['Charged Bolt','Static Field','Telekinesis','Nova','Lightning','Chain Lightning','Thunder Storm','Energy Shield']
  }
};
const skills = Object.entries(groups).flatMap(([className, trees]) =>
  Object.entries(trees).flatMap(([tree, names]) => names.map(name => ({
    id: `${className.toLowerCase()}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name, className, tree, status: 'needs-verification', formula: null,
    notes: ''
  })))
);
// Optional example of the supported formula shape (deliberately not attached to a real skill):
// { kind:'flat', min:[10,4,5,6,7,8], max:[15,5,6,7,8,9],
//   synergy:[{ name:'Example Synergy', pctPerHardPoint:0.06 }],
//   damageType:'magic' }
// Arrays: [level-1 base, increment at levels 2-8, 9-16, 17-22, 23-28, 29+].
// Treat all values as placeholders until checked against the chosen patch.

/** Pure functions: no browser dependencies. All percentages passed as ordinary numbers. */
function scaledValue(steps, level) {
  if (!Array.isArray(steps) || steps.length !== 6) throw new Error('Expected six scaling values');
  if (!Number.isInteger(level) || level < 1) throw new Error('Invalid skill level');
  const bands = [Math.min(level-1,7), Math.max(0,Math.min(level-8,8)),
    Math.max(0,Math.min(level-16,6)),Math.max(0,Math.min(level-22,6)),Math.max(0,level-28)];
  return steps[0] + bands.reduce((sum,n,i)=>sum+n*steps[i+1],0);
}
function calculate(formula, {hardPoints, plusSkills, synergyPoints={}, skillDamagePct=0}) {
  if (!formula || formula.kind !== 'flat') return null;
  const level = Math.max(1,hardPoints+plusSkills);
  const baseMin=scaledValue(formula.min,level), baseMax=scaledValue(formula.max,level);
  const synergyPct=(formula.synergy||[]).reduce((sum,s)=>sum+(Number(synergyPoints[s.name]||0)*s.pctPerHardPoint*100),0);
  // Simplified additive synergies, then skill-damage multiplier. Does not model
  // mastery stacking, resistances, weapon damage, DoT, minions, missiles, frame rates etc.
  const mult=(1+synergyPct/100)*(1+skillDamagePct/100);
  return {level,baseMin,baseMax,synergyPct,min:baseMin*mult,max:baseMax*mult,avg:(baseMin+baseMax)*mult/2};
}

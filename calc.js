/** Pure functions. Inputs are percentages; poison damage is total damage over base duration. */
function scaledValue(steps, level) {
  if (!Array.isArray(steps) || steps.length !== 6) throw new Error('Expected six scaling values');
  if (!Number.isInteger(level) || level < 1) throw new Error('Invalid skill level');
  const bands = [Math.min(level-1,7), Math.max(0,Math.min(level-8,8)),
    Math.max(0,Math.min(level-16,6)),Math.max(0,Math.min(level-22,6)),Math.max(0,level-28)];
  return steps[0] + bands.reduce((sum,n,i)=>sum+n*steps[i+1],0);
}
function clamp(x,lo,hi){return Math.min(hi,Math.max(lo,x));}
function calculate(formula, {skillLevel, synergyPoints={}, skillDamagePct=0, enemyResistancePct=0, enemyResistanceReductionPct=0, enemyPlrPct=0, damageType}={}) {
  if (!formula || formula.kind !== 'flat') return null;
  const level = Math.max(1, Math.floor(Number(skillLevel)));
  const baseMin=scaledValue(formula.min,level), baseMax=scaledValue(formula.max,level);
  const synergyPct=(formula.synergy||[]).reduce((sum,s)=>sum+(Number(synergyPoints[s.name]||0)*s.pctPerHardPoint*100),0);
  const isPoison=(damageType||formula.damageType)==='poison';
  const pierce=Number(enemyResistanceReductionPct);
  const effectiveResistancePct=clamp(Number(enemyResistancePct)-pierce,-100,100);
  const mult=(1+synergyPct/100)*(1+Number(skillDamagePct)/100)*(1-effectiveResistancePct/100);
  // D2-derived provisional poison mechanic: -enemy poison resistance also reduces target PLR;
  // this is not a complete PD2 immunity/penetration implementation.
  const baseDurationSec=isPoison?Number(formula.poisonDurationSec ?? 2):null;
  if(isPoison && (!Number.isFinite(baseDurationSec)||baseDurationSec<=0)) throw Error('Poison formula needs a positive poisonDurationSec');
  const effectivePlrPct=isPoison?clamp(Number(enemyPlrPct)-pierce,-100,75):null;
  const durationSec=isPoison?baseDurationSec*(1-effectivePlrPct/100):null;
  const durationMultiplier=isPoison?durationSec/baseDurationSec:1;
  const min=baseMin*mult*durationMultiplier,max=baseMax*mult*durationMultiplier;
  return {level,baseMin,baseMax,synergyPct,effectiveResistancePct,effectivePlrPct,baseDurationSec,durationSec,
    min,max,avg:(min+max)/2, dpsMin:isPoison?min/durationSec:null,dpsMax:isPoison?max/durationSec:null,
    dpsAvg:isPoison?(min+max)/2/durationSec:null};
}

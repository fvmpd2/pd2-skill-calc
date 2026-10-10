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
  const pierce=Math.max(0,Number(enemyResistanceReductionPct));
  // Input resistance is the target's resistance before this attack's pierce.
  // Gear pierce cannot break immunity. Below zero only the added negative portion is halved.
  const resistance=Number(enemyResistancePct), immune=resistance>=100;
  const positivePortion=Math.min(pierce,Math.max(0,resistance));
  const effectiveResistancePct=immune?resistance:clamp(Math.trunc(resistance-positivePortion-(pierce-positivePortion)/2),-100,99);
  const mult=(1+synergyPct/100)*(1+Number(skillDamagePct)/100)*Math.max(0,1-effectiveResistancePct/100);
  const length=formula.poisonLengthSteps;
  const baseDurationSec=isPoison?(length ? (length[0]+Math.min(level-1,7)*length[1]+Math.max(0,Math.min(level-8,8))*length[2]+Math.max(0,level-16)*length[3])/25 : Number(formula.poisonDurationSec ?? 2)):null;
  if(isPoison && (!Number.isFinite(baseDurationSec)||baseDurationSec<=0)) throw Error('Poison formula needs a positive duration');
  // Requested PD2 length model: poison pierce affects PLR at half effectiveness.
  const effectivePlrPct=isPoison?clamp(Number(enemyPlrPct)-(immune?0:pierce/2),-100,75):null;
  const beforeDurationSec=isPoison?baseDurationSec*(1-clamp(Number(enemyPlrPct),-100,75)/100):null;
  const durationSec=isPoison?baseDurationSec*(1-effectivePlrPct/100):null;
  const referenceDurationSec=Number(formula.poisonDurationSec ?? baseDurationSec);
  const durationMultiplier=isPoison?durationSec/referenceDurationSec:1;
  const min=baseMin*mult*durationMultiplier,max=baseMax*mult*durationMultiplier;
  return {immune,beforeDurationSec,frameMin:isPoison?baseMin*mult/(referenceDurationSec*25):null,frameMax:isPoison?baseMax*mult/(referenceDurationSec*25):null,level,baseMin,baseMax,synergyPct,effectiveResistancePct,effectivePlrPct,baseDurationSec,durationSec,
    min,max,avg:(min+max)/2, dpsMin:isPoison?min/durationSec:null,dpsMax:isPoison?max/durationSec:null,
    dpsAvg:isPoison?(min+max)/2/durationSec:null};
}

/** A supplied weapon range includes weapon-local damage bonuses, before off-weapon ED. */
function calculateChargeComponent(component,options={}){
 const f=component.formula;
 if(f.kind!=='weapon')return calculate(f,{...options,damageType:f.damageType,skillDamagePct:f.damageType==='physical'?0:options.skillDamagePct});
 const level=options.skillLevel;
 const enhancedPct=(f.enhancedBase+(level-1)*f.enhancedPerLevel)*f.chargeMultiplier;
 const multiplier=1+(enhancedPct+Number(options.otherEnhancedDamagePct||0))/100;
 const lo=Number(options.weaponMin||0),hi=Number(options.weaponMax||0);
 if(lo<0||hi<lo||!Number.isFinite(lo+hi))throw Error('Weapon Min/Max must be valid and Min must not exceed Max.');
 const result=calculate({kind:'flat',damageType:'physical',min:[lo*multiplier,0,0,0,0,0],max:[hi*multiplier,0,0,0,0,0],synergy:[]},{...options,damageType:'physical',skillDamagePct:0});
 return {...result,enhancedPct};
}

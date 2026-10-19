/** Pure functions. Inputs are percentages; poison damage is total damage over base duration. */
function scaledValue(steps, level) {
  if (!Array.isArray(steps) || steps.length !== 6) throw new Error('Expected six scaling values');
  if (!Number.isInteger(level) || level < 1) throw new Error('Invalid skill level');
  const bands = [Math.min(level-1,7), Math.max(0,Math.min(level-8,8)),
    Math.max(0,Math.min(level-16,6)),Math.max(0,Math.min(level-22,6)),Math.max(0,level-28)];
  return steps[0] + bands.reduce((sum,n,i)=>sum+n*steps[i+1],0);
}
function clamp(x,lo,hi){return Math.min(hi,Math.max(lo,x));}
function calculate(formula, {skillLevel, synergyPoints={}, skillDamagePct=0, enemyResistancePct=0, enemyResistanceReductionPct=0, breakingPiercePct=0, enemyPlrPct=0, damageType, extraInputs={}, difficulty='Hell'}={}) {
  if (!formula || formula.kind !== 'flat') return null;
  const level = Math.max(1, Math.floor(Number(skillLevel)));
  let baseMin=scaledValue(formula.min,level), baseMax=scaledValue(formula.max,level);
  let synergyPct=(formula.synergy||[]).reduce((sum,s)=>sum+(Number(synergyPoints[s.name]||0)*s.pctPerHardPoint*100),0);
  let modifierMultiplier=1;
  if(formula.model==='dark-pact'){const count=Math.min(formula.maxCurses??Infinity,Math.max(0,Math.floor(extraInputs.curseCount??1)));modifierMultiplier=count===0?0:1+.1*(count-1);}
  if(formula.model==='skeleton-warrior'||formula.model==='skeleton-archer'){const mastery=Math.max(0,Number(extraInputs.masteryLevel||0));baseMin+=2*mastery;baseMax+=2*mastery;synergyPct+=Number(extraInputs.summonEd||0)+(formula.model==='skeleton-warrior'?Math.max(0,level-3)*10:0);}
  if(formula.model==='druid-summon'){const grizzly=formula.ownGrizzly?level:Math.min(formula.grizzlyHardPoints?20:100,Number(extraInputs.grizzlyLevel||0));modifierMultiplier*=1+((grizzly>0?25+10*(grizzly-1):0)+Number(extraInputs.summonEd||0)+(formula.corpseFedEd??100)*Math.min(1,Math.floor(extraInputs.corpseFed||0)))/100;}
  const isPoison=(damageType||formula.damageType)==='poison';
  // Reduction fields accept either sign; magnitude is the intended reduction.
  const innatePierce=formula.levelPhysicalPierce?Math.floor(Math.min(formula.levelPhysicalPierce.cap,formula.levelPhysicalPierce.base+(level-1)*formula.levelPhysicalPierce.perLevel)):0;
  const pierce=Math.abs(Number(enemyResistanceReductionPct)||0)+innatePierce;
  // Breaking sources are applied simultaneously. Each source is halved and
  // rounded separately against the target's original immunity, before item pierce.
  const resistance=Number(enemyResistancePct), initiallyImmune=resistance>=100;
  const breakingSources=Array.isArray(breakingPiercePct)?breakingPiercePct:[breakingPiercePct];
  const appliedBreakingPct=breakingSources.reduce((sum,value)=>sum+Math.floor(Math.abs(Number(value)||0)/(initiallyImmune?2:1)),0);
  const resistanceAfterBreakingPct=resistance-appliedBreakingPct;
  const immune=resistanceAfterBreakingPct>=100;
  const totalReduction=appliedBreakingPct+(immune?0:pierce);
  const positivePortion=Math.min(totalReduction,Math.max(0,resistance));
  const effectiveResistancePct=immune?resistanceAfterBreakingPct:clamp(Math.trunc(resistance-positivePortion-(totalReduction-positivePortion)/2),-100,99);
  const mult=modifierMultiplier*(1+synergyPct/100)*(1+Number(skillDamagePct)/100)*Math.max(0,1-effectiveResistancePct/100);
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
  return {initiallyImmune,appliedBreakingPct,resistanceAfterBreakingPct,appliedBonusPct:Number(skillDamagePct),modifierMultiplier,immune,beforeDurationSec,frameMin:isPoison?baseMin*mult/(referenceDurationSec*25):null,frameMax:isPoison?baseMax*mult/(referenceDurationSec*25):null,level,baseMin,baseMax,synergyPct,effectiveResistancePct,effectivePlrPct,baseDurationSec,durationSec,
    min,max,avg:(min+max)/2, dpsMin:isPoison?min/durationSec:null,dpsMax:isPoison?max/durationSec:null,
    dpsAvg:isPoison?(min+max)/2/durationSec:null};
}

/** A supplied weapon range includes weapon-local damage bonuses, before off-weapon ED. */
function calculateChargeComponent(component,options={}){
 const f=component.formula;
 if(f.model==='skeleton-mage'){
  const mastery=Math.max(0,Math.floor(options.extraInputs?.masteryLevel??1));
  const boltLevel=mastery+(options.skillLevel<4?0:Math.floor((options.skillLevel-2)/2));
  if(boltLevel<1)throw Error('Enter Skeleton Mastery effective level ≥ 1 to calculate mage bolts.');
  return calculate({...f,model:null},{...options,skillLevel:boltLevel,damageType:f.damageType,skillDamagePct:Number(options.skillDamagePct||0)+10*mastery});
 }
 if(f.kind==='summon-base'){
  const ex=options.extraInputs||{},preset=f.difficultyBase?.[options.difficulty||'Hell'],lo=preset?preset[0]:Number(ex.summonMin||0),hi=preset?preset[1]:Number(ex.summonMax||0);
  if(lo<0||hi<lo||!Number.isFinite(lo+hi))throw Error('Summon base Min/Max must be valid; Min must not exceed Max.');
  const enhancedPct=f.enhancedBase+(options.skillLevel-1)*f.enhancedPerLevel+(f.synergy||[]).reduce((sum,s)=>sum+Number(options.synergyPoints?.[s.name]||0)*s.pctPerHardPoint*100,0)+Number(ex.summonEd||0);
  return {...calculate({kind:'flat',damageType:'physical',min:[lo*(1+enhancedPct/100),0,0,0,0,0],max:[hi*(1+enhancedPct/100),0,0,0,0,0],synergy:[]},{...options,damageType:'physical',skillDamagePct:0}),enhancedPct,needsBaseInput:hi===0};
 }
 if(f.kind!=='weapon')return calculate(f,{...options,damageType:f.damageType,skillDamagePct:f.damageType==='physical'&&!f.bonusType?0:options.skillDamagePct});
 const level=options.skillLevel;
 const enhancedPct=(f.enhancedBase+(level-1)*f.enhancedPerLevel)*(f.chargeMultiplier??1)+(f.synergy||[]).reduce((sum,s)=>sum+Number(options.synergyPoints?.[s.name]||0)*s.pctPerHardPoint*100,0);
 const multiplier=(f.sourceFraction??1)*(1+(enhancedPct+Number(options.otherEnhancedDamagePct||0))/100);
 const lo=Number(options.weaponMin||0),hi=Number(options.weaponMax||0);
 if(lo<0||hi<lo||!Number.isFinite(lo+hi))throw Error('Weapon Min/Max must be valid and Min must not exceed Max.');
 const result=calculate({kind:'flat',damageType:'physical',min:[lo*multiplier,0,0,0,0,0],max:[hi*multiplier,0,0,0,0,0],synergy:[]},{...options,damageType:'physical',skillDamagePct:0});
 return {...result,enhancedPct};
}

/** Teleport is a separate spell-damage penalty; the main result stays unchanged. */
function teleportDamage(beforeMin,beforeMax,afterMin,afterMax,penaltyPct){
 const multiplier=1-clamp(Number(penaltyPct)||0,0,100)/100;
 return {beforeMin:beforeMin*multiplier,beforeMax:beforeMax*multiplier,afterMin:afterMin*multiplier,afterMax:afterMax*multiplier};
}

function teleportPenalty(level){return clamp(51-Math.max(1,Math.floor(Number(level)||1)),0,50);}

/** Critical Strike rolls first; Deadly Strike is conditional on its failure. */
function criticalDamage({criticalChancePct=0,deadlyChancePct=0,criticalBonusPct=0,deadlyBonusPct=0}={}){
 const criticalChance=clamp(Number(criticalChancePct)||0,0,100)/100;
 const deadlyChance=clamp(Number(deadlyChancePct)||0,0,100)/100*(1-criticalChance);
 const normalChance=(1-criticalChance)*(1-clamp(Number(deadlyChancePct)||0,0,100)/100);
 const criticalMultiplier=2+Math.max(0,Number(criticalBonusPct)||0)/100;
 const deadlyMultiplier=1.5+Math.max(0,Number(deadlyBonusPct)||0)/100;
 const eitherChance=criticalChance+deadlyChance;
 const averageMultiplier=criticalChance*criticalMultiplier+deadlyChance*deadlyMultiplier+normalChance;
 return {criticalChance,deadlyChance,normalChance,eitherChance,criticalMultiplier,deadlyMultiplier,averageMultiplier};
}

/** Supplied S13 mastery passive formulas; level includes equipment bonuses. */
function sorceressMastery(type,level){
 const lvl=clamp(Math.floor(Number(level)||0),0,100);if(!lvl)return {damagePct:0,piercePct:0};
 if(type==='fire')return {damagePct:20+4*(lvl-1),piercePct:Math.min(lvl,30)};
 if(type==='lightning')return {damagePct:50+10*(lvl-1),piercePct:0};
 if(type==='cold')return {damagePct:10+2*(lvl-1),piercePct:Math.min(5+lvl-1,45)};
 return {damagePct:0,piercePct:0};
}

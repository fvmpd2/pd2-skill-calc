"""Explicit semantic audit applied after the raw importer; source rows remain authoritative."""
import csv,copy,json

def audit(data,rows,missiles,descs,api):
 numeric,extract,TYPE,NAMES=api
 sr={r['skill']:r for r in rows};mr={r['Missile'].lower():r for r in missiles};dr={r['skilldesc']:r for r in descs}
 canonical={r['skill'].lower():NAMES.get(r['skill'],r['skill']) for r in rows}
 canonical.update({'raise skeleton':'Raise Skeleton Warrior','raise skeletal mage':'Raise Skeleton Mage'})
 def syn(expr,r):
  paramrow={**r,**{'Param'+str(i):r.get('Param'+str(i)) or '0' for i in range(1,9)}}
  # Blank parameters are zero in the binary data. Remove zero-coefficient terms.
  expr=__import__('re').sub(r'\bpar([1-8])\b',lambda m:paramrow['Param'+m.group(1)],expr)
  # extract() rejects zero coefficients, so test and retain each active hard-point term.
  zero_terms=[]
  for name in __import__('re').findall(r"skill\('([^']+)'\.blvl\)",expr):
   probe=__import__('re').sub(r"skill\('([^']+)'\.blvl\)",lambda m:'1' if m.group(1)==name else '0',expr)
   if __import__('re').fullmatch(r'[0-9.\s+*/()\-]+',probe) and abs(eval(probe,{'__builtins__':{}},{}))<1e-10:zero_terms.append(name)
  for name in zero_terms:expr=expr.replace("skill('"+name+"'.blvl)",'0')
  if expr and not __import__('re').search(r"skill\('",expr):
   if __import__('re').fullmatch(r'[0-9.\s+*/()\-]+',expr) and abs(eval(expr,{'__builtins__':{}},{}))<1e-10:return []
  sy,ok=extract(expr,paramrow)
  if not ok:return None
  for s in sy:s['name']=canonical.get(s['name'].lower(),s['name'])
  return sy
 def flat(r,physical=False,missile=False,expr=None):
  base='MinDamage' if missile else 'MinDam'
  if physical:keys=[base]+['MinLevDam'+str(i) for i in range(1,6)];maxkeys=['MaxDamage' if missile else 'MaxDam']+['MaxLevDam'+str(i) for i in range(1,6)];typ='physical'
  else:keys=['EMin']+ [('MinELev' if missile else 'EMinLev')+str(i) for i in range(1,6)];maxkeys=['Emax' if missile else 'EMax']+[('MaxELev' if missile else 'EMaxLev')+str(i) for i in range(1,6)];typ=TYPE.get(r.get('EType'))
  if not typ or numeric(r.get(keys[0])) is None or numeric(r.get(maxkeys[0])) is None:return None
  # A blank increment is zero, but a missing endpoint is not a fabricated damage range.
  mn=[numeric(r.get(k)) or 0 for k in keys];mx=[numeric(r.get(k)) or 0 for k in maxkeys]
  if not any(mn+mx):return None
  sy=syn(expr if expr is not None else r.get('DmgSymPerCalc' if physical else 'EDmgSymPerCalc',''),r)
  if sy is None:return None
  factor=2**(numeric(r.get('HitShift')) or 0)/256
  f={'kind':'flat','damageType':typ,'min':[v*factor for v in mn],'max':[v*factor for v in mx],'synergy':sy,'source':('missile:'+r['Missile']) if missile else ('skill:'+r['skill'])}
  if typ=='poison':
   frames=numeric(r.get('ELen'))
   if not frames:return None
   f['min']=[v*frames for v in f['min']];f['max']=[v*frames for v in f['max']];f['poisonDurationSec']=frames/25;f['poisonLengthSteps']=[frames]+[numeric(r.get('ELevLen'+str(i))) or 0 for i in range(1,4)]
  return f
 def comp(label,f,unit='per hit'):return {'label':label,'formula':f,'unit':unit}
 def stage(label,cs,note='',total=True):return {'label':label,'components':cs,'note':note,'total':total}
 def rate(name):
  f=flat(mr[name],missile=True)
  if not f:return None
  # The fire-patch damage function 3 applies three damage units per frame.
  mult=75 if mr[name].get('pSrvDmgFunc')=='3' else 25
  f['min']=[v*mult for v in f['min']];f['max']=[v*mult for v in f['max']];return f
 def extra(e,key,label,default=0,maxvalue=100):e.setdefault('extraInputs',[]).append({'key':key,'label':label,'default':default,'max':maxvalue})
 def weapon(r,base,inc,sy='',model='weapon',typ='physical'):
  return {'kind':model,'damageType':typ,'enhancedBase':base,'enhancedPerLevel':inc,'chargeMultiplier':1,'min':[0]*6,'max':[0]*6,'synergy':syn(sy,r) or [],'source':'passive stats:'+r['skill']}
 nondamage={'Inner Sight','Slow Movement','Dodge','Avoid','Evade','Javelin and Spear Mastery','Pierce','Critical Strike','Penetrate','Warmth','Teleport','Energy Shield','Fire Mastery','Cold Mastery','Lightning Mastery','Skeleton Mastery','Golem Mastery','Bone Armor','AmpDmg','Dim Vision','Weaken','Iron Maiden','Terror','Confuse','Life Tap','Attract','Decrepify','LowRes','CurMas','Blood Warp','Might','Prayer','Resist Fire','Resist Cold','Resist Lightning','Defiance','Blessed Aim','Cleansing','Vigor','Holy Sword','Holy Shield','Concentration','Meditation','Fanaticism','Conviction','Redemption','Salvation','Sword Mastery','One Hand Mastery','Mace Mastery','Howl','Find Potion','Leap','Two Hand Mastery','Throwing Mastery','Spear Mastery','Taunt','Shout','Combat Reflexes','Find Item','Iron Skin','Battle Cry','Increased Speed','Battle Orders','Grim Ward','Natural Resistance','Battle Command','Deep Wounds','Shape Shifting','Wearwolf','Wearbear','Oak Sage','Cycle of Life','Cyclone Armor','Heart of Wolverine','Vines','Hunger','Gust','Claw Mastery','Quickness','Weapon Block','Cloak of Shadows','Fade'}
 # Reflection, bleeds, and buffs are conditional damage systems, not standalone flat attacks.
 conditional={'Iron Maiden','Deep Wounds','Holy Shield','Enchant','Cold Enchant'}
 incomplete={'Valkyrie':'Monster attack data and equipment rolls are absent from the supplied files.','Dopplezon':'Monster attack data are absent from the supplied files.','Shadow Warrior':'Uses copied skills, monster stats and equipment; cannot infer a single damage range.','Shadow Master':'Uses multiple autonomous skills and equipment; cannot infer a single damage range.','Guided Arrow':'Weapon/source fractions and magic conversion need a dedicated model.','Smite':'Requires shield base damage, Holy Shield and character/equipment enhanced damage.','Concentrate':'Weapon attack and additional resistance effects require a dedicated model.','Berserk':'Weapon attack and server-specific resistance effects require a dedicated model.','Maul':'Charge-dependent enhanced damage requires active charge count.','Dragon Claw':'Requires per-claw ranges and effective Claw Mastery level.','Static Field':'Percentage-of-current-life attack with difficulty/target rules; no flat range.','Vengeance':'Amplifies added fire/cold/lightning damage; requires full weapon/gear elemental ranges and server behavior.','Dragon Tail':'Kick physical damage creates a fire explosion; requires kick/shoe/stats and conversion order.','Dragon Talon':'Requires kick/shoe/stats and skill enhanced damage.','Dragon Flight':'Requires kick/shoe/stats and skill enhanced damage.'}
 for e in data:
  r=sr[e['internalName']];name=r['skill'];e['name']=canonical.get(name.lower(),e['name']);e['info']='';e['auditStatus']='calculated';e['auditDetail']='Single damage application; attack/cast timing, critical hits and repeated projectiles are not totaled.'
  d=dr.get(r.get('skilldesc'),{})
  if (d and d.get('SkillPage','0')=='0') or 'temp' in name.lower() or name=='Shattering Arrow':
   e.update(formula=None,charges=None,auditStatus='internal',auditDetail='Hidden/internal entry, not a separate selectable skill-tree attack.');continue
  if name in nondamage:
   e.update(formula=None,charges=None,auditStatus='conditional' if name in conditional else 'non-damaging',auditDetail='Buff, resistance, defensive or utility stat fields are not direct attack damage.');continue
  if name in incomplete:
   e.update(formula=None,charges=None,auditStatus='needs-model',auditDetail=incomplete[name]);continue
  # Rebuild valid elemental fields, accepting explicitly zero increments.
  f=flat(r)
  if f:e['formula']=f
  if e.get('charges'):
   for st in e['charges']:
    for c in st['components']:
     for s in c['formula'].get('synergy',[]):s['name']=canonical.get(s['name'].lower(),s['name'])
   if name=='Fists of Fire':e['charges'][2]['components'][-1]=comp('Meteor ground fire',rate('fofmeteorfire'),'per second')
   continue
  physical=flat(r,physical=True,expr=r.get('EDmgSymPerCalc') if name=='Meteor' else None)
  if physical and f:
   if name=='Meteor':physical['bonusType']='fire'
   e['charges']=[stage('Impact',[comp('Physical',physical),comp(f['damageType'].title(),f)])]
  elif physical:e['formula']=physical
  if name in ['Corpse Explosion','Death Sentry']:
   e['info']='Flat physical + fire damage shown. Also adds '+('5–10%' if name=='Corpse Explosion' else '3–5%')+' of corpse base life, split equally between physical and fire; corpse-life damage is not included.'
   e['auditStatus']='partial';e['auditDetail']=e['info']+(' Summoned mon death sentry has different physical increments (3/5/7/9/11 versus tooltip 5/7/9/11/13); using the server summon values.' if name=='Death Sentry' else '')
   if name=='Death Sentry':
    pf=flat(sr['mon death sentry'],physical=True);e['charges'][0]['components'][0]['formula']=pf;e['info']+=' Physical scaling uses the summoned sentry’s server row.'
  if name in ['Bone Wall','Bone Prison','Spirit of Barbs','Thorns']:
   steps=[numeric(r.get('EMin')) or 0]+[numeric(r.get('EMinLev'+str(i))) or 0 for i in range(1,6)]
   reflected=steps if name!='Thorns' else [numeric(r.get('EMax')) or 0]+[numeric(r.get('EMaxLev'+str(i))) or 0 for i in range(1,6)]
   rf={'kind':'flat','damageType':'physical','min':reflected,'max':reflected,'synergy':syn(r.get('EDmgSymPerCalc',''),r),'source':'item_attackertakesdamage stat:'+name}
   e['formula']=rf;e['charges']=[stage('Returned damage',[comp('Flat physical return',rf,'per attacker hit')],'Conditional returned damage when the protected target is hit; not an active attack or DPS.')];e['auditStatus']='conditional';e['auditDetail']=e['charges'][0]['note']
   if name=='Thorns':
    bleed=copy.deepcopy(rf);bleed['min']=steps;bleed['max']=steps
    own=copy.deepcopy(bleed);own['min']=[v*4/3 for v in steps];own['max']=[v*4/3 for v in steps]
    e['charges'] += [stage('Added bleed · Allies',[comp('Deep Wounds',bleed,'per second')],'Added bleed only; native open-wounds damage and proc chance are not included.'),stage('Added bleed · Paladin',[comp('Deep Wounds',own,'per second')],'The caster receives 4/3 of the aura’s added bleed value.')];e['auditStatus']='partial'
  if name in ['Magic Arrow','Fire Arrow','Cold Arrow']:
   fraction=.75 if name=='Magic Arrow' else .5
   f['min']=[v*fraction for v in f['min']];f['max']=[v*fraction for v in f['max']]
   if name=='Fire Arrow':
    e['charges']=[stage('Arrow impact',[comp('Added fire',f)],'Added fire damage only; weapon damage and physical-to-fire conversion are not included.'),stage('Ground fire',[comp('Burning ground',rate('firearrow firewall'),'per second')],'One fire patch; server missile parameter 7 is blank (zero), so this patch gains only the Magic Arrow synergy.')];e['auditStatus']='partial';e['info']='Added fire and ground fire shown; weapon damage and conversion are not included.';e['auditDetail']=e['info']
  if name=='Holy Light':
   half=copy.deepcopy(f);half['min']=[v/2 for v in f['min']];half['max']=[v/2 for v in f['max']]
   e['charges']=[stage('Cast on enemy',[comp('Magic area damage',f)]),stage('Cast on ally',[comp('Magic area damage',half)],'Casting on an ally halves damage. Healing is not included.')]
  if name=='Dark Pact':
   f['model']='dark-pact';extra(e,'curseCount','Curses on target',1,10);e['charges']=[stage('Dark Pact',[comp('Magic',f)],'+10% damage for each curse after the first. An uncursed target takes no Dark Pact damage.')]
  if name in ['Holy Fire','Holy Freeze','Holy Shock','Sanctuary']:
   hit=copy.deepcopy(f);factor=float(r['Param7' if name=='Sanctuary' else 'Param5']);hit['min']=[v*factor for v in hit['min']];hit['max']=[v*factor for v in hit['max']]
   e['charges']=[stage('Aura pulse',[comp('Pulse',f,'per pulse')]),stage('Added attack damage',[comp('Added '+f['damageType'],hit)],'Added to your weapon attack; weapon damage is not included.')]
   if name=='Holy Shock':e['info']='Attack minimum follows the server passive formula; the tooltip forces a minimum of 1 and may display a different value.';e['auditStatus']='partial';e['auditDetail']=e['info']
   if name=='Sanctuary':e['info']='Sanctuary also reduces enemy magic resistance by 5 + skill level / 2. Enter the target’s resistance after that aura/debuff in Enemy res; do not enter it again as item pierce.';e['auditStatus']='partial';e['auditDetail']=e['info']
  if name=='Thunder Storm':e['charges']=[stage('Lightning strike',[comp('Lightning',f)]),stage('Triggered nova',[comp('Lightning nova',flat(mr['thunderstormnova'],missile=True))],'The strike triggers an area nova. Each rolls its own damage; no assumed overlap or attack frequency.')];e['auditDetail']=e['charges'][1]['note']
  if name=='Fist of the Heavens':e['charges']=[stage('Direct target',[comp('Lightning strike',f)]),stage('Surrounding targets',[comp('Holy bolt',flat(mr['fistoftheheavensbolt'],missile=True))],'Per bolt hit; bolt and strike damage are not automatically added together.')]
  for sk,ms,label in [('Meteor','meteorfire','Ground fire'),('Molten Boulder','moltenboulderfirepath','Fire trail'),('Armageddon','armageddonfire','Ground fire'),('Immolation Arrow','immolationarrow fire','Ground fire')]:
   if name==sk:
    burn=rate(ms)
    if burn:
     if not e.get('charges'):e['charges']=[stage('Impact',[comp(f['damageType'].title(),f)])]
     e['charges'].append(stage(label,[comp(label,burn,'per second')],'Damage while standing in one fire patch; not added to instantaneous impact damage.'))
  if name=='FireGolem':
   wp=weapon(r,0,0);wp['kind']='summon-base'
   e['charges']=[stage('Punch',[comp('Physical punch',wp),comp('Added fire',f)],'One melee hit: physical base damage plus added fire.'),stage('Holy Fire aura',[comp('Aura fire',flat(sr['Holy Fire Fire Golem']),'per pulse')],'Per aura pulse, separate from the punch.')]
   extra(e,'summonMin','Summon base physical Min');extra(e,'summonMax','Summon base physical Max');extra(e,'summonEd','Other summon enhanced damage (%)')
   e['info']='Damage per golem. Enter its difficulty-dependent base physical damage for the punch. Fire attack and aura use separate game formulas.';e['auditStatus']='input-required';e['auditDetail']=e['info']
  if name in ['Clay Golem','BloodGolem','IronGolem']:
   key=3 if name=='BloodGolem' else 6;inc=numeric(r.get('Param4' if name=='BloodGolem' else 'Param2')) or 0 if name!='IronGolem' else 0
   syexpr=r['passivecalc3' if name!='IronGolem' else 'passivecalc4'];syexpr=syexpr.split('+',1)[1] if name!='IronGolem' else syexpr
   wp=weapon(r,0,inc,syexpr,'summon-base');e['formula']=wp;e['charges']=[stage('Melee attack',[comp('Physical',wp)],'Damage per golem; enter base physical damage for the difficulty or item used to create it.')]
   extra(e,'summonMin','Summon base physical Min');extra(e,'summonMax','Summon base physical Max');extra(e,'summonEd','Other summon enhanced damage (%)')
   if name=='BloodGolem':
    bleed={'kind':'flat','damageType':'physical','min':[numeric(r.get('EMax')) or 0]+[numeric(r.get('EMaxLev'+str(i))) or 0 for i in range(1,6)],'max':[numeric(r.get('EMax')) or 0]+[numeric(r.get('EMaxLev'+str(i))) or 0 for i in range(1,6)],'synergy':syn(r['EDmgSymPerCalc'],r),'source':'deep_wounds stat:'+name}
    e['charges'].append(stage('Bleed',[comp('Added Deep Wounds',bleed,'per second')],'Added bleed stat; native open-wounds damage depends on monster level and is not included.'))
   if name=='IronGolem':e['charges'].append(stage('Returned damage',[comp('Flat thorns',{'kind':'flat','damageType':'physical','min':[150]+[15]*5,'max':[150]+[15]*5,'synergy':[],'source':'aurastat item_attackertakesdamage'},'per attacker hit')],'Only when the golem is hit; item-granted effects are not included.'))
   e['info']='Enter the summon’s base damage; monster stats and item effects are not in the uploaded files.';e['auditStatus']='input-required';e['auditDetail']=e['info']
  if name in ['Raise Skeleton','Raise Skeleton Archer']:
   if name=='Raise Skeleton':
    steps=[numeric(r.get('EMin')) or 0]+[numeric(r.get('EMinLev'+str(i))) or 0 for i in range(1,6)];sf={'kind':'flat','damageType':'physical','min':[steps[0]+1]+steps[1:],'max':[steps[0]+2]+steps[1:],'synergy':syn(r['passivecalc4'],r),'source':'summon base 1–2 + skill EMin','model':'skeleton-warrior'}
   else:sf=physical;sf['model']='skeleton-archer'
   e['formula']=sf;e['charges']=[stage('Summon attack',[comp('Physical',sf)],'Per skeleton hit; no army-total DPS or critical-hit averaging.')];extra(e,'masteryLevel','Skeleton Mastery (effective level)',20);extra(e,'summonEd','Other summon enhanced damage (%)');e['auditDetail']='Includes mastery flat damage, hard-point synergies and skill enhanced damage. Does not include summon attack speed, crits, external elemental damage or army DPS.'
  if name=='Raise Skeletal Mage':
   e['charges']=[]
   for i,label in enumerate(['Poison','Cold','Fire','Lightning'],1):
    mf=flat(mr['necromage'+str(i)],missile=True);mf['model']='skeleton-mage';e['charges'].append(stage(label+' mage',[comp(label+' bolt',mf)],'One mage’s bolt; mage elements are alternatives, not simultaneous damage.'))
   e['formula']=e['charges'][0]['components'][0]['formula'];extra(e,'masteryLevel','Skeleton Mastery (effective level)',1);e['info']='Bolt level = Mastery level + floor((summon level − 2) / 2), with no summon-level bonus below level 4. Mastery also adds 10% elemental damage per effective level.';e['auditStatus']='partial';e['auditDetail']='All four bolt types and soft-level mastery are modeled separately; poison uses the source missile’s 12-frame (0.48 s) duration, matching the PD2 wiki table.';e['auditStatus']='calculated'
  if name=='Revive':
   wp=weapon(r,30,30,"skill('Desecrate'.blvl)*par8",'summon-base');e['formula']=wp;e['charges']=[stage('Revived monster attack',[comp('Physical',wp)],'Physical attack only; monster spells, elemental attacks and equipment-dependent effects vary by monster.')];extra(e,'summonMin','Monster base physical Min');extra(e,'summonMax','Monster base physical Max');extra(e,'summonEd','Other summon enhanced damage (%)');e['info']='Physical bonus: +30% per Revive level, +20% per Desecrate hard point. Elemental bonus: +20% per Revive level, +10% per Desecrate hard point; monster elemental/spell damage is not calculated.';e['auditStatus']='partial';e['auditDetail']=e['info']
  if name in ['Summon Spirit Wolf','Summon Fenris','Summon Grizzly']:
   sf=e['formula'];sf['model']='druid-summon';sf['ownGrizzly']=name=='Summon Grizzly';e['charges']=[stage('Summon attack',[comp('Physical',sf)],'Per summon hit; Grizzly’s passive enhanced damage is included. Enter aura/gear enhanced damage separately.')];extra(e,'summonEd','Other summon enhanced damage (%)')
   if name!='Summon Grizzly':extra(e,'grizzlyLevel','Summon Grizzly (effective level)',0)
   if name=='Summon Fenris':extra(e,'corpseFed','Corpse-fed buff (0 = off, 1 = on)',0,1)
  if name=='Raven':
   e['info']='Cold damage per peck shown. Native physical attack damage depends on the summoned monster’s level and is not in the uploaded files.';e['auditStatus']='partial';e['auditDetail']=e['info']
  if (numeric(r.get('SrcDam')) or 0)>0 and name not in ['Raise Skeleton Archer'] and e.get('formula') and not e.get('charges'):
   e['info']='Added '+e['formula']['damageType']+' damage shown; weapon damage and conversion effects are not included.';e['auditStatus']='partial';e['auditDetail']=e['info']
  if name in ['Enchant','Cold Enchant']:
   e['info']='Added attack damage only; this buff does not deal a separate hit.';e['auditStatus']='conditional';e['auditDetail']=e['info']
  if name in ['Inferno','Arctic Blast','Fire Wall','Blaze','Inferno Sentry']:
   e['auditStatus']='partial';e['info']='Imported damage unit only. Continuous-hit frequency and overlapping streams are not modeled; this value is not DPS.';e['auditDetail']=e['info']
  # Linear enhanced-damage weapon attacks: additive skill ED, hard-point synergy ED,
  # and the player's other off-weapon ED, then the server source-damage fraction.
  weapon_specs={'Jab':(3,'calc1'),'Fend':(3,'calc2'),'Multiple Shot':(5,'calc4'),'Strafe':(1,'calc2'),'Sacrifice':(1,'calc1'),'Zeal':(3,'calc2'),'Charge':(3,'calc1'),'Bash':(5,'calc1'),'Double Swing':(3,'calc1'),'Double Throw':(1,'calc1'),'Leap Attack':(3,'calc1'),'Frenzy':(1,'calc1'),'Whirlwind':(1,'calc1'),'Feral Rage':(5,'calc1'),'Fury':(3,'calc2'),'Split Throw':(5,'calc4'),'Joust':(1,'calc1'),'Blade Dance':(1,'calc1')}
  if name in weapon_specs:
   param,calc=weapon_specs[name];expression=r[calc];remaining=expression.replace('ln'+str(param)+str(param+1),'0');sy=syn(remaining,r)
   if sy is not None:
    wp=weapon(r,numeric(r.get('Param'+str(param))) or 0,numeric(r.get('Param'+str(param+1))) or 0);wp['synergy']=sy;wp['sourceFraction']=(numeric(r.get('SrcDam')) or 128)/128
    e['formula']=wp;e['charges']=[stage('Weapon attack',[comp('Physical',wp)],'Per hit from one weapon. Enter weapon-local damage before off-weapon ED; include strength/dexterity, mastery and aura ED in Other enhanced damage. Attack speed, crits and extra gear elemental damage are not totaled.')];e['auditStatus']='input-required';e['auditDetail']=e['charges'][0]['note']
  if name in ['Blade Sentinel','Blade Fury','Blade Shield'] and physical:
   wp=weapon(r,0,0);wp['sourceFraction']=(numeric(r.get('SrcDam')) or 0)/128
   e['charges']=[stage('Blade hit',[comp('Flat physical',physical),comp('Weapon physical',wp)],'Uses one-handed weapon source damage. Two-handed penalties, equipment elemental damage and hit frequency are not modeled.')];e['auditStatus']='partial';e['info']='Flat physical + weapon physical shown. Use a one-handed weapon; other weapon types need additional penalties.';e['auditDetail']=e['info']
  # For elemental melee skills, the physical strike is a separate event from bolts.
  if name in ['Power Strike','Charged Strike','Lightning Strike','Fire Claws'] and f:
   wp=weapon(r,0,0)
   e['charges']=[stage('Weapon strike',[comp('Physical weapon',wp)],'One weapon hit; gear elemental damage and off-weapon attack bonuses beyond your ED input are not included.'),stage('Elemental damage',[comp(f['damageType'].title(),f)],'Per elemental hit/bolt. Not multiplied by bolt count or automatically added to every weapon strike.')];e['auditStatus']='partial';e['info']='Weapon strike and elemental damage are shown separately; projectile counts and additional gear elements are not totaled.';e['auditDetail']=e['info']
  if name=='Power Strike':e['charges'].append(stage('Triggered nova',[comp('Lightning nova',flat(mr['powerstrikenova2'],missile=True))],'Per nova hit; not multiplied by enemy count.'))
  if name=='Immolation Arrow':e['auditStatus']='partial';e['info']='Explosion and ground fire shown separately; arrow weapon damage is not included.';e['auditDetail']=e['info']
  if name in ['Inferno','Arctic Blast','Fire Wall','Inferno Sentry','Blaze'] and f:
   mult=75 if name in ['Fire Wall','Blaze'] else 25/3 if name=='Inferno Sentry' else 25
   stream=copy.deepcopy(f);stream['min']=[v*mult for v in f['min']];stream['max']=[v*mult for v in f['max']]
   e['charges']=[stage('Continuous damage',[comp('Fire trail' if name=='Blaze' else 'Stream' if name!='Fire Wall' else 'Fire wall',stream,'per second')],'One damage source while the target stays in it; no assumed exposure time or stacking.')];e['info']='';e['auditStatus']='calculated';e['auditDetail']='Rate uses 25 fps, fire-wall damage function 3 uses ×75, and Wake of Inferno follows Skilldesc ×25/3. No source stacking or exposure duration is assumed.'
   if name=='Arctic Blast':
    nova=copy.deepcopy(f);nova['min']=[v*6 for v in f['min']];nova['max']=[v*6 for v in f['max']];e['charges'].append(stage('Shatter nova',[comp('Frost nova',nova)],'Triggered when an affected enemy dies. One nova; not added automatically to channel DPS.'))
   if name in ['Inferno','Arctic Blast']:e['info']='This skill also reduces enemy '+f['damageType']+' resistance. Enter resistance after that skill debuff; item pierce is a separate input.';e['auditStatus']='partial';e['auditDetail']+=' Built-in resistance debuff is not applied automatically; Enemy res must include it.'
   if name=='Blaze':
    burst=copy.deepcopy(f);burst['min']=[v*256*100/675 for v in burst['min']];burst['max']=[v*256*100/675 for v in burst['max']];burst['source']='Skilldesc:blaze desccalca5/desccalcb5';e['charges'].append(stage('Initial explosion',[comp('Fire explosion · tooltip',burst)],'Uses Skilldesc’s explicit 100 × Blaze fixed-point damage / 675. The ignition missile has different scaling; server matching remains unresolved.'))
    e['auditStatus']='partial';e['auditDetail']+=' Tooltip explosion and ignition missile disagree; tooltip calculation is shown explicitly and is not claimed to reproduce the server ignition result.'
  if name=='Tornado':e['charges']=[stage('Collision hit',[comp('Physical',e['formula'])]),stage('Area pulse',[comp('Physical',copy.deepcopy(e['formula']),'per pulse')],'Area damage checks every 15 frames (0.6 s). Collision and pulse are separate sources; hit count depends on path and target overlap.')];e['auditDetail']=e['charges'][1]['note']
  if name=='Hurricane':e['charges']=[stage('Storm pulse',[comp('Cold',f,'per pulse')],'Periodic damage while targets are in the storm; no assumed exposure time or total pulses.')]
  if not e.get('formula'):
   e['auditStatus']='needs-model';e['auditDetail']=incomplete.get(name,'Weapon, monster or server-specific calculations have no validated flat model; omitted from the selector.')
  if e.get('charges'):
   e['formula']=e['charges'][0]['components'][0]['formula']
  for ff in ([e['formula']] if e.get('formula') else [])+[c['formula'] for st in e.get('charges') or [] for c in st['components']]:
   for sy in ff.get('synergy',[]):sy['name']=canonical.get(sy['name'].lower(),sy['name'])
 return data

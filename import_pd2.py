#!/usr/bin/env python3
"""Convert PD2 tab-separated Skills/Missiles into a browsable calculator catalogue.
Run: python3 import_pd2.py 'Skills(2).txt' 'Missiles(2).txt' > skills.js
Damage depends on in-game engine details; conservative direct-damage import only.
"""
import csv,json,re,sys
CLASS={'ama':'Amazon','ass':'Assassin','bar':'Barbarian','dru':'Druid','nec':'Necromancer','pal':'Paladin','sor':'Sorceress'}
TYPE={'mag':'magic','fire':'fire','cold':'cold','ltng':'lightning','pois':'poison','phys':'physical'}
def load(path):
 with open(path,encoding='utf-8-sig',newline='') as f:return list(csv.DictReader(f,delimiter='\t'))
def numeric(x):
 try:return float(x) if x and re.fullmatch(r'-?\d+(?:\.\d+)?',x.strip()) else None
 except:return None
def vals(r,keys):return [numeric(r.get(k,'')) for k in keys]
def extract_synergies(expr,r):
 if not expr:return [],True
 # Validates that expression is ONLY sum of one or more skill('<name>'.blvl) terms multiplied by parN or literal.
 terms=re.findall(r"skill\('([^']+)'\.blvl\)",expr)
 if not terms:return [],False
 replacement=re.sub(r"skill\('[^']+'\.blvl\)",'X',expr)
 # Instead of evaluating expression, derive coefficient by substituting one variable at a time and parsing restricted arithmetic.
 exprpy=expr.replace('skill(','skill(')
 def evaluate(values):
  x=re.sub(r"skill\('([^']+)'\.blvl\)",lambda m:str(values.get(m.group(1),0)),expr)
  x=re.sub(r'\bpar([1-8])\b',lambda m:str(numeric(r.get('Param'+m.group(1),'')) or 0),x)
  if not re.fullmatch(r'[0-9.\s+*/()\-]+',x):raise ValueError('complex formula')
  return eval(x,{'__builtins__':{}},{})
 try:
  base=evaluate({})
  if abs(base)>0.0001:return [],False
  out=[]
  for name in dict.fromkeys(terms):
   coeff=evaluate({name:1})
   if coeff<=0 or abs(evaluate({name:2})-2*coeff)>1e-6:return [],False
   out.append({'name':name,'pctPerHardPoint':coeff/100})
  if abs(evaluate(dict.fromkeys(terms,1))-sum(s['pctPerHardPoint']*100 for s in out))>0.0001:return [],False
  return out,True
 except Exception:return [],False

def make_data(skill_path,missile_path):
 rows=load(skill_path); missiles=load(missile_path)
 missile_by_name={r['Missile'].lower():r for r in missiles if r.get('Missile')}
 out=[]; stats={'direct':0,'missile':0,'review':0}
 for r in rows:
  if r.get('charclass') not in CLASS or not r.get('skill') or not r.get('Id','').isdigit():continue
  name=r['skill']; klass=CLASS[r['charclass']]; eid=r['Id']; stype=TYPE.get(r.get('EType',''))
  formula=None; reason='No direct damage fields or complex skill logic; requires manual review.'; origin='skill'
  # Direct physical damage often needs weapon damage, attack frames, and skills-specific transforms.
  # Accept only bare physical hits with no weapon source; still flag as review.
  opts=[]
  if stype:
   vmin=vals(r,['EMin']+['EMinLev'+str(i) for i in range(1,6)])
   vmax=vals(r,['EMax']+['EMaxLev'+str(i) for i in range(1,6)])
   if all(x is not None for x in vmin+vmax):opts.append((stype,vmin,vmax,r.get('EDmgSymPerCalc',''),'skill'))
  # A skill may contain no elemental data but fire damage is on an associated missile. Cautious fallback.
  if not opts:
   names=[r.get(x,'') for x in ['srvmissile','srvmissilea','srvmissileb','srvmissilec']]
   for mname in names:
    m=missile_by_name.get(mname.lower())
    if not m:continue
    mt=TYPE.get(m.get('EType',''))
    mn=vals(m,['EMin']+['MinELev'+str(i) for i in range(1,6)])
    mx=vals(m,['Emax']+['MaxELev'+str(i) for i in range(1,6)])
    if mt and all(v is not None for v in mn+mx):
     opts.append((mt,mn,mx,m.get('EDmgSymPerCalc',''),'missile:'+mname));break
  if opts:
   typ,mn,mx,syn,origin=opts[0]
   sy,ok=extract_synergies(syn,r if origin=='skill' else missile_by_name[origin.split(':',1)[1].lower()])
   if ok:
    # Skills can contain additional damage components (phys + element); or require weapon scaling.
    complexity=bool(numeric(r.get('SrcDam','')) and numeric(r.get('SrcDam',''))>0)
    formula={'kind':'flat','damageType':typ,'min':mn,'max':mx,'synergy':sy,'source':origin,'rawSynergy':syn}
    if typ=='poison':
     length=numeric(r.get('ELen','')) if origin=='skill' else numeric(missile_by_name[origin.split(':',1)[1].lower()].get('ELen',''))
     if length and length>0:
      # Poison fields contain damage-per-frame in 256ths; convert to total over poison length (frames).
      formula['min']=[round(v*length/256,6) for v in mn];formula['max']=[round(v*length/256,6) for v in mx]
      formula['poisonDurationSec']=length/25
      formula['conversionNote']='Poison damage rate × base duration; provisional; verify PD2 poison tick/length mechanics.'
     else:formula=None;reason='Poison length unavailable; review required.'
    if formula:
     if complexity:reason='Skill may also use weapon-based damage; listed component only.'
     elif origin.startswith('missile'):reason='Missile component imported; multiple projectiles/impacts and special calculations excluded.'
     else:reason='Data-derived direct damage component; special multipliers and hits not modeled.'
     stats['missile' if origin.startswith('missile') else 'direct']+=1
  if not formula:stats['review']+=1
  out.append({'id':klass.lower()+'-'+re.sub('[^a-z0-9]+','-',name.lower()).strip('-'),'gameId':int(eid),'name':name,'className':klass,'formula':formula,'notes':reason})
 return out,stats
if __name__=='__main__':
 data,stats=make_data(*sys.argv[1:3]);print('// Generated from uploaded PD2 text files. Review special skill mechanics; do not assume exact displayed DPS.');print('const skills = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';');print('// Import summary: '+json.dumps(stats))

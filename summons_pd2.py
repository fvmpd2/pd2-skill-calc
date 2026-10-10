"""Apply difficulty-dependent summon attack data from optional MonStats/MonLvl files."""
import copy

def add_summons(data,rows,monsters,levels):
 skills={r['skill']:r for r in rows};mons={r['Id'].lower():r for r in monsters if r.get('Id')}
 for entry in data:
  name=entry['internalName']
  if name in ['IronGolem','Revive']:
   entry.update(formula=None,charges=None,extraInputs=[],info='',auditStatus='needs-model',auditDetail='Omitted by request: item-derived or arbitrary-monster attacks require too much input.');continue
  if name in ['Clay Golem','BloodGolem','FireGolem'] and name.replace(' ','').lower() in mons:
   m=mons[name.replace(' ','').lower()]
   if m.get('noRatio')!='1':
    entry['auditDetail']='Requires ratio/monster-level scaling; do not use raw difficulty ranges.';continue
   base={}
   for label,suffix in [('Hell','(H)')]:base[label]=[float(m.get('A1MinD'+suffix) or 0),float(m.get('A1MaxD'+suffix) or 0)]
   for stage in entry['charges']:
    for c in stage['components']:
     if c['formula']['kind']=='summon-base':c['formula']['difficultyBase']=base;c['formula']['source']='MonStats:'+m['Id']+' A1 + Skills passive stats'
   entry['extraInputs']=[x for x in entry.get('extraInputs',[]) if x['key'] not in ['summonMin','summonMax']]
   entry['difficulty']=False;entry['info']='Damage per golem, using Hell base punch damage.'
   if name=='FireGolem':entry['info']+=' Added fire and Holy Fire aura are separate components.'
   if name=='BloodGolem':entry['info']+=' Added bleed is separate from the hit; native open-wounds damage is not included.'
   entry['auditStatus']='partial' if name=='BloodGolem' else 'calculated';entry['auditDetail']='Hell A1 base damage imported from MonStats; noRatio=1, so MonLvl multipliers do not apply. A2 ranges are not treated as an additional simultaneous hit.'
   entry['formula']=entry['charges'][0]['components'][0]['formula']
   for st in entry['charges']:
    if st['label'] in ['Melee attack','Punch']:st['note']='One golem melee hit. Hell physical base damage is included; skill level and hard-point synergies apply separately.'
  if name=='Raven' and 'druidhawk' in mons:
   entry['info']='Cold damage per peck. Damage comes from the Raven skill referenced by MonStats; no additional physical base attack is recorded.';entry['auditStatus']='calculated';entry['auditDetail']=entry['info']+' Attack timing, total pecks and item-specific bonuses are not totaled.'
 return data

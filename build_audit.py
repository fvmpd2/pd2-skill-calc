#!/usr/bin/env python3
"""Produce source/model coverage for every class-tagged row."""
import csv,sys,hashlib,collections
from import_pd2 import make_data
paths=sys.argv[1:7];data,stats=make_data(*paths);counts=collections.Counter(s['auditStatus'] for s in data);rows=[]
for s in sorted(data,key=lambda x:(x['className'],x['name'])):
 parts=[f"{g['label']}: {c['label']} ({c['formula']['damageType']}, {c['unit']})" for g in s.get('charges') or [] for c in g['components']]
 if not parts and s['formula']:parts=[s['formula']['damageType']+' per application']
 rows.append({'class':s['className'],'skill':s['name'],'internal_name':s['internalName'],'game_id':s['gameId'],'selectable':'yes' if s['formula'] and not s.get('excluded') else 'no','status':s['auditStatus'],'components':'; '.join(parts),'limits':s['auditDetail']})
with open('SKILL_AUDIT.csv','w',newline='') as f:
 w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
lines=['# PD2 calculator skill audit — v14','',f"All {len(data)} class-tagged Skills rows have a classification; {sum(bool(s['formula']) and not s.get('excluded') for s in data)} are selectable. This is a source/model audit, not in-game verification of every component.",'','## Coverage labels','','- calculated: listed single-hit, pulse or rate components are calculated; timing, crits and repeated-target hits are not inferred.','- partial: excluded effect or unresolved tooltip/server difference.','- input-required: weapon range and other enhanced damage must be entered.','- conditional: buff or event-dependent returned damage. Selectable only when a damage formula exists.','- non-damaging: utility, defensive or resistance stat fields; omitted.','- needs-model: omitted, pending conversion/equipment/monster/server logic, or extensive inputs excluded by request.','- internal: hidden engine helper or placeholder; omitted.','','| Status | Rows |','| --- | ---: |']
lines += [f'| {k} | {v} |' for k,v in sorted(counts.items())]
lines += ['','## Findings','','Fire Golem separates Hell physical punch, added melee fire and Holy Fire pulse. Clay/Blood physical bases also use Hell MonStats A1 values. All three have noRatio=1; MonLvl multipliers do not apply. Iron Golem and Revive are excluded by request.','',"Dark Pact adds 10% per curse after the first; zero curses gives zero damage. Corpse Explosion includes flat physical/fire and mentions the excluded corpse-life contribution. Skeletal warriors/archers/mages and Druid summons include their applicable mastery/passive modifiers.",'','Resist Fire/Cold/Lightning and Salvation are bonuses, not damaging attacks. Aura attacks have separate pulse/on-hit values. Other additions include physical/fire impacts, ground fire, secondary novas and Tornado collision/pulse damage.','',"Shattering Arrow is a hidden internal row (ID 365): its Skilldesc page/row/column are zero and its name token matches Freezing Arrow. It feeds internal missiles such as shatteringarrowexp2, not a separate skill-tree attack. It is removed from the selector.",'',"Unresolved source differences: Blaze explosion tooltip versus ignition missile; Holy Shock tooltip minimum 1 versus passive minimum; Death Sentry player physical increments versus summoned server row. The calculator identifies these differences instead of silently mixing them.",'','## Sources','','Uploaded scaling is authoritative. Descriptions were cross-checked with the following PD2 wiki pages; wiki/season differences do not silently replace uploaded values.','']
for cls in ['Amazon','Assassin','Necromancer','Paladin','Druid','Sorceress']:lines.append(f'- [{cls} skill descriptions](https://wiki.projectdiablo2.cn/wiki/All_{cls}_Skills)')
lines += ['- Barbarian formulas were checked against supplied Skills/Skilldesc; the accessible wiki mirror failed to load.','- [Damage precision/data-field reference](https://github.com/andersgong/d2bin2txt/blob/master/bin2txt/skills.c)','','Input SHA-256 fingerprints:','']
for p in paths:lines.append(f"- {p.split('/')[-1]}: `{hashlib.sha256(open(p,'rb').read()).hexdigest()}`")
for klass in sorted({r['class'] for r in rows}):
 lines += ['','## '+klass,'','| Skill | Selectable | Status | Components / limitations |','| --- | --- | --- | --- |']
 for r in rows:
  if r['class']==klass:
   detail=(r['components']+' — ' if r['components'] else '')+r['limits'];lines.append(f"| {r['skill']} | {r['selectable']} | {r['status']} | {detail.replace('|','/')} |")
open('SKILL_AUDIT.md','w').write('\n'.join(lines)+'\n')
print(len(data),'audited;',sum(bool(s['formula']) and not s.get('excluded') for s in data),'selectable;',dict(counts))

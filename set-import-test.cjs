const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const c={console};c.window=c;vm.createContext(c);
for(const f of ['data.js','set-data.js','auras.js','stats.js'])vm.runInContext(fs.readFileSync(__dirname+'/vendor/'+f,'utf8'),c);
const D=c.ENGINE_DATA,A=c.PD2Adv;
function character(items){return {character:{name:'SetTest',class:{id:1},level:90,status:{},attributes:{strength:100,dexterity:100,vitality:100,energy:100},gold:{character:0,stash:0},life:100,mana:100,stamina:100,skills:[{id:36,level:20}]},items};}
function item(name,code,slot){return {name,base_code:code,base:{id:code,type_code:D.items[code]?.t},quality:{id:5},modifiers:[],location:{zone:'Equipped',equipment:slot}};}
const tal=[item("Tal Rasha's Fine-Spun Cloth",'zmb','Belt'),item("Tal Rasha's Adjudication",'amu','Amulet'),item("Tal Rasha's Lidless Eye",'oba','Right Hand'),item("Tal Rasha's Guardianship",'uth','Armor'),item("Tal Rasha's Horadric Crest",'xsk','Helm')];
const compute=items=>A.compute(A.fromArmory(character(items),D),D,{});
let C=compute(tal);assert.equal(C.levels(36).lvl,24,'full Tal adds 3 sorc and 1 orb partial');assert.equal(C.T(39),50,'full set fire res');assert.equal(C.T(105),30,'orb, belt and armour set FCR');assert.equal(C.T(333),15,'orb fire pierce');
assert.equal(compute(tal.slice(0,2)).levels(36).lvl,20,'no orb and no full bonus');
assert.equal(compute(tal.slice(0,3)).levels(36).lvl,21,'orb partial +1');
const off=tal.map((x,i)=>i===3?{...x,location:{storage:'Stash'}}:x);assert.equal(compute(off).levels(36).lvl,21,'stash armour cannot complete set');
const swap=tal.map(x=>x.base_code==='oba'?{...x,location:{zone:'Equipped',equipment:'Right Hand Switch'}}:x);assert.equal(compute(swap).levels(36).lvl,20,'inactive swap cannot complete set');
// All known pieces can be resolved by the .d2s numeric ID as well as their display name.
const save={name:'SaveSet',class:{id:1},level:90,attributes:{strength:100,dexterity:100,vitality:100,energy:100,maxhp:100,maxmana:100,maxstamina:100},skills:[{id:36,level:20}],items:tal.map((x,i)=>({name:x.name,code:x.base_code,type:x.base.type_code,quality:5,set_id:D.setitems.findIndex(s=>s.set===19&&s.code===x.base_code),stats:[],location:{parent:'equipped',bodyloc:[8,2,4,3,1][i]}}))};
C=A.compute(A.fromSave(save,D),D,{});assert.equal(C.levels(36).lvl,24,'save imports include full set');
console.log('Set import tests passed: displayed names, partial/full bonuses, pierce, skill levels, FCR, stash/swap exclusions, save IDs.');
const angelic=[item('Angelic Wings','amu','Amulet'),item('Angelic Halo','rin','Left Ring')];
const one=compute(angelic),two=compute([...angelic,item('Angelic Halo','rin','Right Ring')]);
assert.equal(two.T(19),one.T(19)*2,'both rings receive the per-piece attack-rating bonus');
assert.equal(two.T(127),0,'duplicate rings do not complete the set');
console.log('Duplicate-piece test passed: both rings get bonuses without increasing distinct-piece count.');
const saveFile=process.argv[2];
if(saveFile){
 const b=fs.readFileSync(saveFile);vm.runInContext(fs.readFileSync(__dirname+'/vendor/save.js','utf8'),c);
 const P=c.PD2Save.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),c.SAVE_DATA);
 const C=A.compute(A.fromSave(P,D),D,{});
 assert.equal(C.equipmentStat(329),68,'MavsFireArrow gets 63 item + 5 set fire damage');
 assert.equal(C.equipmentStat(333),70,'fire pierce unchanged');
 assert.equal(C.levels(7).lvl,46,'Fire Arrow level');
 assert.equal(C.equipmentStat(331),5,'Mav gloves cold set damage');
 console.log('Actual MavsFireArrow save passed: level 46 Fire Arrow, 68% fire damage, 70% fire pierce and 5% cold set damage.');
}
// CTA's buff survives swapping; its own item +skills do not transfer.
const ctaModel=A.fromArmory(character(tal),D);
const cta={name:'Call to Arms',code:'fla',type:'mace',loc:'equip',slot:'rarm2',quality:2,stats:[{id:97,param:155,val:6},{id:127,param:0,val:1}],children:[],runewordStats:[],childrenIncluded:true};
ctaModel.items.push(cta);
const unbuffed=A.compute(ctaModel,D,{}),buffed=A.compute(ctaModel,D,{assumeBattleCommand:true});
assert.equal(buffed.battleCommandAssumed,true);
assert.equal(buffed.levels(36).lvl,unbuffed.levels(36).lvl+1,'CTA adds exactly one skill after swapping back');
assert.equal(buffed.levels(36).blvl,20,'CTA must not change hard-point synergies');
assert.equal(buffed.equipmentStat(127),unbuffed.equipmentStat(127),'inactive CTA equipment skills stay excluded');
assert.equal(buffed.levels(37).lvl,0,'CTA does not teach unlearned skills');
cta.loc='stash';assert.equal(A.compute(ctaModel,D,{assumeBattleCommand:true}).battleCommandAssumed,false,'stash CTA cannot be used');
cta.loc='equip';cta.slot='rarm';assert.equal(A.compute(ctaModel,D,{swap:true,assumeBattleCommand:true}).battleCommandAssumed,true,'detect CTA on either equipped weapon set');
console.log('CTA tests passed: +1 skill, unchanged hard points, no inactive equipment leakage, stash excluded and either swap supported.');

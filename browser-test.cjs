// Real-DOM regression checks. Requires Playwright and an installed Chromium browser.
// Optional: set PD2_BROWSER_PATH to a Chromium/Chrome/Brave executable.
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const path=require('node:path');
const {chromium}=require('playwright');

(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PD2_BROWSER_PATH?{executablePath:process.env.PD2_BROWSER_PATH}:{})});
 try{
  const page=await browser.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(pathToFileURL(path.join(__dirname,'index.html')).href);
  async function healthy(name){
   assert.equal(await page.locator('#criticalResults').count(),1,name+': shared strike output must stay in the document');
   assert(!/error|null|NaN/i.test(await page.locator('#status').innerText()),name+': calculation error');
   const rows=await page.locator('#damageRows').innerText();
   assert(/\d/.test(rows)&&!/null|NaN/i.test(rows),name+': missing numeric output');
  }
  for(let repeat=0;repeat<2;repeat++){
   for(const name of ['Twister','Shock Wave']){
    await page.selectOption('#class',{label:'Druid'});
    await page.selectOption('#skill',{label:name});await healthy(name);
    await page.fill('#level','50');await healthy(name);
    await page.locator('#synergyDetails').evaluate(e=>e.open=true);
    for(const input of await page.locator('#synergies input').all()){
     await input.fill('19');await healthy(name);
    }
    await page.fill('#deadlyChance','30');await healthy(name);
    await page.locator('#criticalDetails').evaluate(e=>e.open=true);
    await page.fill('#criticalChance','75');await healthy(name);
    await page.fill('#enemyRes','25');await healthy(name);
    await page.uncheck('#truncateNumbers');await healthy(name);
    const expected=await page.evaluate(()=>{
     const points=Object.fromEntries(Array.from(document.querySelectorAll('#synergies input')).map(e=>[e.dataset.synergy,Number(e.value)]));
     const value=calculate(skillFormula(),{skillLevel:50,synergyPoints:points,enemyResistancePct:25});
     return fmt(value.avg*criticalDamage({criticalChancePct:75,deadlyChancePct:30}).averageMultiplier);
    });
    assert.equal(await page.locator('#damageRows tr:first-child td:last-child').innerText(),expected);
    const url=await page.evaluate(()=>buildUrl());await page.goto(url);await healthy(name);
    await page.fill('#level','40');await healthy(name);
    await page.click('#resetBuild');await healthy(name);
    // Switching away must not leave the next skill without its shared output.
    await page.selectOption('#class',{label:'Necromancer'});
    await page.selectOption('#skill',{label:'Poison Nova'});await healthy('Poison Nova');
    await page.fill('#poisonFcr','125');await healthy('Poison Nova');
   }
  }
  assert.deepEqual(errors,[]);
  console.log('Passed: repeated real-DOM Twister/Shock Wave updates, weighted damage, saved links, reset and skill switching.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});

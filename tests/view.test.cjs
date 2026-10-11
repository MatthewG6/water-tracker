const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = () => fs.readFileSync('view.js', 'utf8');
function view() { const context = { window: {} }; vm.runInNewContext(source(), context); return context.window.WaterView; }
test('hydration progress distinguishes remaining water from a completed goal', () => {
  const ui = view();
  assert.equal(ui.summary(32, 128).remaining, 96);
  assert.equal(ui.summary(32, 128).percent, 25);
  assert.equal(ui.summary(160, 128).remaining, 0);
  assert.equal(ui.summary(160, 128).ringDegrees, 360);
  assert.equal(ui.summary(160, 128).percent, 125);
});
test('fractional ounces stay visible without floating point noise', () => {
  const ui = view();
  assert.equal(ui.ounces(12.5), '12.5');
  assert.equal(ui.ounces(32), '32');
  assert.equal(ui.ounces(0.1 + 0.2), '0.3');
});
test('existing water records retain their key, history, and reset boundary', () => {
  const records = new Map([['wt:data:v1', JSON.stringify({version:1,resetHourLocal:5,dailyTotals:{'2026-10-10':40},entries:{'2026-10-10':[{ts:1,oz:40}]}})]]);
  const context = { window: {}, localStorage: { getItem:k=>records.get(k),setItem:(k,v)=>records.set(k,v) }, console };
  vm.runInNewContext(fs.readFileSync('data.js','utf8'),context);
  const wt = context.window.WT;
  const early = new Date(2026,9,11,4,59);
  assert.equal(wt.getTodayTotal(early).totalOz,40);
  assert.equal(wt.getTodayTotal(new Date(2026,9,11,5,0)).totalOz,0);
  wt.addWater(8,early);
  assert.equal(wt.getTodayTotal(early).totalOz,48);
  wt.undoLastEntry(early);
  assert.equal(wt.getTodayTotal(early).totalOz,40);
  assert.equal(records.size,1);
});
test('offline navigation returns this app shell without intercepting Daily Fuel', async () => {
  const handlers = {}, shell = {body:'Daily Water'};
  vm.runInNewContext(fs.readFileSync('sw.js','utf8'), {URL,self:{location:new URL('https://example.com/water-tracker/sw.js'),addEventListener:(name,handler)=>handlers[name]=handler},fetch:()=>Promise.reject(Error('offline')),caches:{match:async url=>url==='https://example.com/water-tracker/index.html'?shell:undefined}});
  let response;
  handlers.fetch({request:{url:'https://example.com/water-tracker/',method:'GET',mode:'navigate'},respondWith:value=>response=value});
  assert.equal(await response,shell);
  let intercepted=false;
  handlers.fetch({request:{url:'https://example.com/daily-fuel/',method:'GET',mode:'navigate'},respondWith:()=>intercepted=true});
  assert.equal(intercepted,false);
});

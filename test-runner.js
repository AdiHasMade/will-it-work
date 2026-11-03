const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

(async ()=>{
  try{
    const base = path.resolve(__dirname);
    const index = fs.readFileSync(path.join(base, 'index.html'), 'utf8');
    const script = fs.readFileSync(path.join(base, 'script.js'), 'utf8');

    const dom = new JSDOM(index, { runScripts: 'outside-only', resources: 'usable' });
    const { window } = dom;

    // Minimal browser polyfills used by script.js
    window.requestAnimationFrame = (cb) => setTimeout(cb, 16);
    window.cancelAnimationFrame = () => {};
    window.navigator = window.navigator || {};
    window.navigator.clipboard = window.navigator.clipboard || { writeText: async () => {} };
    window.console = console;

    // Evaluate the script in the JSDOM window context
    window.eval(script);

    // Ensure function exists
    if(typeof window.startCounterFor !== 'function'){
      console.error('startCounterFor not found in script.js');
      process.exit(2);
    }

    // Use a known DOB far in the past so ms > 0
    window.startCounterFor('1990-01-01');

    // Wait for the update to run at least once
    await new Promise(r => setTimeout(r, 200));

    const total = window.document.getElementById('total-ms').textContent || '';
    const breakdown = window.document.getElementById('breakdown').textContent || '';
    const calendarButton = window.document.getElementById('open-calendar');
    const dobInput = window.document.getElementById('dob');

    console.log('TOTAL_MS:', total);
    console.log('BREAKDOWN:', breakdown);

    // Basic assertions
    if(!/ms$/.test(total)){
      console.error('Assertion failed: total-ms does not end with "ms"');
      process.exit(3);
    }
    if(!/days/.test(breakdown)){
      console.error('Assertion failed: breakdown does not contain "days"');
      process.exit(4);
    }
    if(!calendarButton){
      console.error('Assertion failed: calendar button is missing');
      process.exit(5);
    }
    if(!dobInput || !dobInput.max || !dobInput.min){
      console.error('Assertion failed: DOB input is missing date limits');
      process.exit(6);
    }

    console.log('TEST PASSED');
    process.exit(0);
  }catch(err){
    console.error('ERROR:', err);
    process.exit(1);
  }
})();
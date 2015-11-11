
/// imports
var imports = [
    'Base.Functions.BasicFunctions',
    'Base.Visual.Template'
];

window.Hycs.setUp({
    scripts: imports,
    callbackFunction: window.runningNow,
    callbackScope: window,
    callbackDelay: 100,
    startImporting: true,
    consoleLog: true
});


function runningNow() {
    console.time('NEWTEST');
    // do something when all scripts loaded
    console.timeEnd('NEWTEST');
}


/// imports 
var imports = [
    'Base.Functions.BasicFunctions',
    'Base.Visual.Template'      
];

window.Hycs.setUp(imports, window.runningNow, window, 100, true);




function runningNow() {
    console.time('NEWTEST');
    // do something when all scripts loaded
    console.timeEnd('NEWTEST');
}


window.HyperCore.addBlueprint('HyperCORE', {

    singleton: true,

    eventName: 'HyperCoreFiredEvent',

    HYPERCORE: null,

    toLoadCount: 0,

    readyCount: 0,

    scripts: null,

    encounteredError: false,

    errorCallBackFunction: null,

    errorCallBackScope: null,

    callBackFunction: null,

    callBackScope: null,

    callBackDelay: 0,

    shallReload: false,

    doConsoleLog: false,

    listOfLoadedScripts: null,

    flderURL: '',


    setUp: function(scripts, cbFn,cbScope,cbDelay, startImporting, shallReloadPage, consoleLog, eCbFn, eCbScope,appFolderUrl) {
        this.listOfLoadedScripts = [];
        this.setupWindowOnError();
        this.scripts = scripts;
        this.callBackFunction = cbFn || null;
        this.callBackScope = cbScope || null;
        this.errorCallBackFunction = eCbFn || null;
        this.errorCallBackScope = eCbScope || null;
        this.callBackDelay = cbDelay || 0;
        this.shallReload = shallReloadPage ? true : false;
        this.doConsoleLog = consoleLog ? true : false;
        this.folderURL = appFolderUrl || '';

        var me = this;
        window.addEventListener(this.eventName, function (e) {
            me.onHyperCoreEvent(e.detail);
        }, false);

        if (startImporting)
            this.startImport();
    },

    setCallBack: function (cbFn, cbScope, cbDelay) {
        this.callBackFunction = cbFn;
        this.callBackScope = cbScope;
        this.callBackDelay = cbDelay;
    },

    startImport: function() {
        if (this.scripts)
            this.importScripts(this.scripts);
    },

    scriptLoadedHandler: function() {
        var me = this;
        console.log([me.loadedCount, me.readyCount, me.toLoadCount, me.encounteredError]);
        if (me.readyCount == me.toLoadCount &&/* me.readyCount == me.toLoadCount &&*/ !me.encounteredError) {

            window.setTimeout(function () {
                me.callBackFunction.apply(me.callBackScope);
            }, me.callbackDelay);
        }

        if (me.encounteredError) {
            alert('ENCOUNTERED ERROR PLEASE REFRESH');
        }
    },

    scriptHandle: function() {
        this.readyCount = this.readyCount + 1;
        this.scriptLoadedHandler();
        this.fireEvent({
            action: 'scriptStatus',
            status: 'loaded',
            args: arguments
        });
        //debugger;
    },

    populateListOfScripts: function(newArray) {
        this.listOfLoadedScripts.push(newArray);
        this.listOfLoadedScripts = this.flattenArrayOfArrays(this.listOfLoadedScripts);
    },

    cleanseArrayOfScripts: function(arrayOfScripts) {
        var cleanArray = [];

        for (var i = 0;i < arrayOfScripts.length;i++) {

            if (this.listOfLoadedScripts.indexOf(arrayOfScripts[i]) === -1) {
                cleanArray.push(arrayOfScripts[i])
            }
        }

        return cleanArray;
    },

    importScripts: function(arrayOfScripts, ignoreEvents) {
        var cleanArray = this.cleanseArrayOfScripts(arrayOfScripts);

        this.populateListOfScripts(cleanArray);

        if (this.doConsoleLog)
            console.log(this.listOfLoadedScripts);
        if (! ignoreEvents) {
            this.toLoadCount = this.countItemsInObject(cleanArray);
            this.loadedCount = 0;
            this.readyCount = 0;
        }

        for (var script in cleanArray) {
            if (cleanArray[script].indexOf('://') === -1)
                cleanArray[script] = this.appFolderUrl + '/' + this.dotToSlash(cleanArray[script]).toLowerCase()+ '.js';
            this.loadScript(cleanArray[script],this.scriptHandle);
        }
    },

    loadScript: function(src, callback)
    {
        console.log(src);
        var s,
            r,
            t,
            scope = this;

        r = false;
        s = document.createElement('script');
        s.type = 'text/javascript';
        s.setAttribute('defer',null);
        s.src = src;

        s.onload = s.onreadystatechange = function() {
            var me = this;
        //console.log( this.readyState ); //uncomment this line to see which ready states are called.
            if ( !r && (!me.readyState || me.readyState == 'complete') ) {
                r = true;
                if (callback)
                    callback.apply(scope);
            }
        };
        t = document.getElementsByTagName('script')[0];
        t.parentNode.insertBefore(s, t);
    },

    importScript: function(script,ignoreEvents) {
        var me = this,
            imported = document.createElement('script');

        script = this.dotToSlash(script);
        imported.src = '/' + script.toLowerCase()+ '.js';

        if (!ignoreEvents) {
            imported.onload = me.scriptHandle_Load.bind(me);
            imported.onreadystatechange = me.scriptHandle_ReadyStateChange.bind(me);
            //imported.onerror = me.scriptHandle_Error(); NOT RELIABLE
        }

        document.head.appendChild(imported);
    },

    dotToSlash: function(string) {
        return string.replace(/\./g, '/');
    },

    countItemsInObject: function(object) {
        var cnt = 0 ;

        for (var i in object)
            cnt ++;

        return cnt;
    },

    setupWindowOnError: function() {
        window.onerror = this.errorHandle.bind(this);
    },

    errorHandle: function() {
        if (this.doConsoleLog)
            console.log(arguments);

        if (this.errorCallBackFunction)
            this.errorCallBackFunction.apply(this);

        if (this.shallReload) {
            this.reloadPage();
        }
    },

    flattenArrayOfArrays: function(a, r){
        if(!r){ r = []}

        for(var i=0; i<a.length; i++){
            if(a[i].constructor == Array){
                this.flattenArrayOfArrays(a[i], r);
            }else{
                r.push(a[i]);
            }
        }
        return r;
    },

    reloadPage: function() {BackScope
        //browser function
        location.reload();
    },

    onHyperCoreEvent: function(data) {
        if(data.action == "requires") {
            this.importScripts(data.data, true);
        }
    },

    callBack: function(args, func, scope) {
        if (! scope) scope = window;
        (function(args, scope, func) {
            func.apply(scope, args);
        })(args, scope, func);
    },

    laggedCallBack: function(delay, args, func , scope) {
        var me = this;
        window.setTimeout( function () {
            me.callBack(args, func, scope);
        }, delay);
    },

    fireEvent: function(data) {
        var evnt = new CustomEvent(this.eventName,{
            detail: data
        });
        window.dispatchEvent(evnt);
    }
});

window['Hycs'] = window['HyperCORE'];

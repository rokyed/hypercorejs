'use strict';

function HyperCoreClassManagementSystem (hostingObject) {

    this.clsName = 'ROOT';
    this.hostingObject = hostingObject;
    this.keyWords = {
        fireEventName: 'HyperCoreFiredEvent',
        className: '$className',
        singleton: 'singleton',
        config: 'config',
        types: ['blueprint'],
        initials: 'initials',
        requires: 'requires',
        autoInitialize: 'autoInitialize',
        treeSeparator: '.',
        mixins: 'mixins',
        parentClass: 'parentClass',
        grandParent: 'grandParent',
        get: 'get',
        set: 'set',
        reset: 'reset',
        define: 'define',
        extend: 'extend',
        override: 'override',
        callParent: 'callParent',
        uniqueID: '$uniqueId'
    };

    this.ownSettings = {
        instanceId: 0,
        _blueprintList:[],
        _instanceList:[],
        _instanceTypeList:[]
        };

    this.blueprints = {};
    this.instantiatedClasses = {};
    this.instances = this.instantiatedClasses; // only used for external naming ( shorter )
    this.calledParentFlag = false;
    this.calledParentScope;
    var me = this,
        kwd = this.keyWords;


    // if you need to change some keywords to fit your solution here you go ,
    // please inspire yourself from the list of key words seen in this.keyWords
    this.setKeyword = function (keyWord, value) {
        this.keyWords[keyWord] = value;
    };

    // if any other name than 'blueprint' inside the getInstance or makeInstance will be recognized and added to the keywords
    // but for love of processor , please use 'blueprint'
    this.addType = function (typeToAdd){
        if (this.keyWords.types.indexOf(typeToAdd) === -1)
            this.keyWords.types.push(typeToAdd);
    };

    // this will override contents
    this.override = function (parentClass, contents) {

        var par = this.blueprints[parentClass];
        // override parent functions
        for (var item in contents) {
            if(item != kwd.config && item != kwd.className)
                me.copyItem(item, contents, par);
        }
        // override parent configs
        for (var item in contents.config) {
            me.copyItem(item, contents.config, par.config);
        }

    };

    //set parent class and
    this.extend = function (processedContents, incommingContents, parentClass) {
        var par, i = 0;

        par = this.blueprints[parentClass];
         // set the parent of the class
        processedContents[kwd.parentClass] = par;

        // copy class contents into a processed object ( to be processed)
        for (var item in incommingContents) {
            me.copyItem(item, incommingContents, processedContents);
        }
        // copy items from parent to class if not in class

        for (var item in par) {
            if (!processedContents[item] && item != kwd.config && item != kwd.className)
                me.copyItem(item, par, processedContents);
        }
        // copy configs from parent
        if (par)
            for (var def in par[kwd.config]) {
                var found = false;
                for (var xdef in processedContents[kwd.config]) {
                    if (xdef == def) {
                        found = true;
                    }
                }
                if (!found) {
                    me.copyItem(def, par[kwd.config], processedContents[kwd.config]);
                }
            }
    };
    // this will process add all the functionalities from a mixin blueprint to the blueprint that requires it
    this.processMixins = function (processedContents) {
        for (var i = 0; i < processedContents.mixins.length; i++) {

            var mixin = processedContents.mixins[i],
                mxin = me.blueprints[mixin];

            for (var item in mxin) {
                if (item != [kwd.config]
                && item != [kwd.className]
                && item != [kwd.parenClass]
                && item != [kwd.callParent]
                && item != [kwd.singleton])
                    me.copyItem(item, mxin, processedContents);
                if (item == [kwd.config]) {
                    for ( var cfg in mxin[kwd.config]) {
                        if (!processedContents[kwd.config][cfg]) {
                            processedContents[kwd.config][cfg] = null;
                            me.copyItem(cfg, mxin[kwd.config], processedContents[kwd.config])
                        }
                    }
                }
            }

        }

        delete processedContents[kwd.mixins];
    };

    //copies config to initial config , initial config used to
    //reset any config you need or to get the initial value before changement
    this.setInitials = function (contents) {
        contents[kwd.initials] = {};

        for (var def in contents[kwd.config]) {
            me.copyItem(def, contents[kwd.config], contents[kwd.initials]);
        }


    };



    this.addBasics = function (processedContents,classname) {

         // generate universal getter , requires string (name of variable)
        processedContents[kwd.get] = function (item) {
            return this[kwd.config][item] || null;
        };

         // generate universal setter , requires string (name of variable), requires value as second param
        processedContents[kwd.set] = function (item,value) {
            this[kwd.config][item] = value;
        };

         // generate universal resetter , requires string (name of variable)
        processedContents[kwd.reset] = function (item) {
            this[kwd.config][item] = this[kwd.initials][item];
        };

        // calling parent ( first paramenter is the function name , rest of parameters are parameters that parent function accepts)

        processedContents[kwd.callParent] = function(functionName) {
            // if not called already will not dig into parent's parent's parent..... and so on
            if (me.calledParentFlag === false) {
                me.calledParentFlag = true;
                me.calledParentScope =this[kwd.parentClass];
            } else {
                me.calledParentScope = me.calledParentScope[kwd.parentClass];
            }

            var fn = functionName,
                tempReturn;
            [].shift.apply(arguments);

            tempReturn = me.calledParentScope[fn].apply(this,arguments);

            me.calledParentFlag= false;

            return tempReturn;
        };
        // set classname for the class
        processedContents[kwd.className] = classname;

    };

    // --------------------------------------------------
    // the actual creation of the BLUEPRINT happends here
    // --------------------------------------------------
    this.addBlueprint = function (classname, itsContents, action, fromParent) {
        var processedContents = {};

        if (!itsContents[kwd.config]) {
            itsContents[kwd.config] = {};
        }

        if (itsContents[kwd.requires]) {
            this.fireEvent({
                action: 'requires',
                data: itsContents[kwd.requires]
            });
        }

        if (!action || action == kwd.define) {
            processedContents = itsContents;
        }
        // here will happend the overide if the action is to override
        if (action == kwd.override && fromParent) {
            this.override(fromParent, itsContents);
        }

        if (action == kwd.extend && fromParent) {
            this.extend(processedContents, itsContents, fromParent);
        }
         // creating the initial values ( in order to reset a variable to it's initial state)
        this.setInitials(processedContents);

         // copying mixins to class
        if (processedContents.mixins !== undefined) {
            this.processMixins(processedContents);
        }

        this.addBasics(processedContents, classname);

        // creation is done
        this.blueprints[classname] = processedContents;

        if (itsContents[kwd.singleton]) {
            var treeArray = classname.split(kwd.treeSeparator),
                newTreeObject;
            this.createTreeObjects(this.hostingObject, treeArray,this.getInstance({
                blueprint: classname
            }));

        }
    };

    // this will generate the objects in the hosting object in order like the string eg.: CORE.OBJ1.CHILD1.SUBCHILD1.ACTUALCLASS
    // this will return the objectToInsertAtEnd because that's the object we want at the end of the branch in the tree
    this.createTreeObjects = function (inObject, arrayOfObjects, objectToInsertAtEnd) {
        if (arrayOfObjects.length > 1) {
            this.createEmptyObject(arrayOfObjects[0],inObject);
            var inNewObject = inObject[arrayOfObjects[0]];
            arrayOfObjects.shift();
            return this.createTreeObjects(inNewObject, arrayOfObjects, objectToInsertAtEnd);
        } else {
            inObject[arrayOfObjects[0]] = objectToInsertAtEnd;
            return inObject
        }
    };

    // this will create an empty object in
    this.createEmptyObject = function (newObjectName,parentObject) {
        if (!parentObject[newObjectName]) {
            parentObject[newObjectName] = {};
            return parentObject[newObjectName];
        }else{
            return parentObject;
        }
    };

    // this will add prefix to the word and will make the word's first letter uppercase
    this.addPrefix = function (prefix, word) {
        word = word.substring(0,1).toUpperCase() + word.substring(1,word.length);
        return prefix + word;

    };
    // used to copy primitive items from one object to another
    // DO NOT USE FOR COMPLETE OBJECTS OR THEY WILL REFERENCE
    this.copyItem = function (itemName, fromObj, toObj){
        var typeOfVar = this.typeOf(fromObj[itemName]);

        if (typeOfVar != null && typeOfVar != "Unidentified" && typeOfVar != "Function" && typeOfVar != "String"  && typeOfVar != "Number"  && typeOfVar != "Boolean")
            toObj[itemName] = this.newVar(typeOfVar, fromObj[itemName]);
        else
            toObj[itemName] = fromObj[itemName];
    };
    // merge A into B (override is optional)
    this.mergeItems = function (objA, objB, overrideB) {
        var merged = this.clone(objB);
        for (var item in objA){
            if (!merged[item] || overrideB === true)
                this.copyItem(item, objA, merged);
        }

        return merged;
    };

    // applies settings on the instance
    this.applySettings = function (settings,onInstance) {
        if (settings[kwd.config]){
            for(var item in settings[kwd.config]){
                me.copyItem(item, settings[kwd.config], onInstance[kwd.config]);
            }
        }
        for (var item in settings) {
            if(item != kwd.config && item != kwd.className){
                me.copyItem(item, settings, onInstance);
            }
        }
    };

    // this will create an unique id for instances
    this.generateInstanceUID = function (classname) {
        return classname + this.ownSettings.instanceId++;
    };

    // NOTE : 4th argument is boolean and it only means if new instance
    // should be added to instances array , to be used only if you are
    // processing big amounts of data , else use the standard version
    this.makeInstance = function () {
        var classname, settings, readyCall=false;

        if (arguments.length == 0)
            return;
        if (arguments.length == 1) {
            // if its object(settings)
            settings = arguments[0];

        }

        if (arguments.length == 2) {
            if ( typeof arguments[0] == 'object') {
                // if is object(settings) and callback
                settings = arguments[0];
                readyCall = arguments[1];

            } else {
                // if is classname and object(settings)
                // we set the blueprint reference because we know it here
                classname = arguments[0];
                settings = arguments[1];
            }

        }

        if (arguments.length >= 3) {
            //if its classname , object(settings) ,callback
            // we set the blueprint reference because we know it here
            classname = arguments[0];
            settings = arguments[1];
            readyCall = arguments[2];
        }

        // first time we try looking for known varialbes that point to blueprint
        if (!classname) {
            for (var i = 0; i < kwd.types; i++) {
                if(settings[kwd.types[i]])
                    classname = settings[kwd.types[i]];
            }

        }

        // second time we try searching in the first level of depth of the instance settings

        if (!classname) {
            // normal search
            for (var item in settings) {
                for (var cls in this.blueprints) {

                    if (settings[item] == cls) {
                        classname = cls;
                        // also we add the new item as type alias
                        this.addType(item);
                    }
                }
            }
        }


        // third is a failure of finding referenced class
        if (!classname) {
            console.log('ERROR: no classname found');
            return;
        }

        var refObj = this.blueprints[classname],
            newClone = this.cloneForInstance(refObj,true),
            uid = this.generateInstanceUID(classname);


        this.applySettings(settings,newClone);

        this.instantiatedClasses[uid] = newClone;
        if (readyCall) {

            this.instantiatedClasses[uid][readyCall]();
        }
        this.instantiatedClasses[uid][kwd.uniqueID] = uid;

        if (this.instantiatedClasses[uid][kwd.autoInitialize]) {
            var instance = this.instantiatedClasses[uid];
            instance[instance[kwd.autoInitialize]].apply(instance, instance);
        }

        return uid;
    };

    this.clone = function(variableToClone) {
        var typeOfVar = this.typeOf(variableToClone);

        if (typeOfVar == "Array" || typeOfVar == "Object") {
            var temp = this.newVar(typeOfVar);

            if (typeOfVar == 'Array') {
                for (var key in variableToClone)
                    temp.push(this.clone(variableToClone[key]));

            } else {
                for (var key in variableToClone) {
                    if (variableToClone.hasOwnProperty(key)) {
                        temp[key] = this.clone(variableToClone[key]);
                    }
                }

            }
            return temp;
        }

        return this.newVar(typeOfVar, variableToClone);
    };

    // this will clone configs but will modify functions to reference the blueprint (but only on first level of depth)

    this.cloneForInstance = function (obj, cname,objname) {

        if (objname && cname) {
            var me = this;
            var tmpFn = function () {
                return me.blueprints[cname][objname].apply(this,arguments);
            };
            return tmpFn;

        }
        if (obj == null || this.typeOf(obj) != 'Object') {
            return obj;
        }

        var temp = {};

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if(this.typeOf(obj[key]) == 'Function') {
                    temp[key] = this.cloneForInstance(obj[key],obj[kwd.className],key);
                } else {
                    temp[key] = this.cloneForInstance(obj[key]);
                }
            }
        }
        return temp;
    };

    this.getInstance = function(uid) {

        if (this.typeOf(uid) === "Object") {
            var instanceId = this.makeInstance(uid);
            return this.instantiatedClasses[instanceId];
        } else {
            return this.instantiatedClasses[uid];
        }
    };

    this.fireEvent = function(data) {
        var evnt = new CustomEvent([kwd.fireEventName],{
            detail: data
        });
        this.hostingObject.dispatchEvent(evnt);
    };

    // call function you need ( instancename (uid) , function name ,parameter1....)
    this.callFunction = function (){
        var args = [];

        for (var i = 2; i < arguments.length; i++) {
            args.push(arguments[i]);
        }

        return this.instantiatedClasses[arguments[0]][arguments[1]](args);
    };


    this.destroyInstance = function (uid,lastCall) {

        if(lastCall)
            this.callFunction.apply(this,arguments);

        delete this.instantiatedClasses[uid];

    };

    this.getAllInstancesOfType = function(classname) {
        var list = [];
        for (var instance in this.instantiatedClasses) {
            if (classname == this.instantiatedClasses[instance][kwd.className])
                list.push(instance);
        }
        return list;
    };

    this.getAllInstancesOfTypeAsObj = function(classname) {
        var list = {};
        for (var instance in this.instantiatedClasses) {
            if (classname == this.instantiatedClasses[instance][kwd.className])
                list[instance] = this.instantiatedClasses[instance];
        }
        return list;
    };

    this.countItemsIn = function (object) {
        var cnt = 0 ;

        for (var i in object)
            cnt ++;

        return cnt;
    };

    this.isArray = function(variable) {
        if (variable.constructor === Array)
            return true;
        return false;
    };

    this.newVar = function(ofType, value) {
        if(ofType === "String")
           return new String(value);

        if(ofType === "Number")
           return new Number(value);

        if(ofType === "Boolean")
           return new String(value);

        if(ofType === "Array") 
           return JSON.parse(JSON.stringify(value));

        if(ofType === "Object")
           return new Object(value);

        if(ofType === "Function")
           return new Function(value);
    };

    this.typeOf = function(variable) {
        if (variable === undefined) return 'Undefined';
        if (variable === null) return null;
        if (variable.constructor === String) return 'String';
        if (variable.constructor === Number) return 'Number';
        if (variable.constructor === Boolean) return 'Boolean';
        if (variable.constructor === Array) return 'Array';
        if (variable.constructor === Object) return 'Object';
        if (variable.constructor === Function) return 'Function';
        if (variable.constructor === NaN) return 'NaN';
        return 'Unidentified';
    };

    this.STAT_CURRENT_LOAD = function() {
        return this.countItemsIn(this.instantiatedClasses);
    };

}
var CMS = window['Hyc'] = window['HyperCore'] = new HyperCoreClassManagementSystem(window);

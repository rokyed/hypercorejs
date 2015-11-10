window.Hyc.addBlueprint('Base.Visual.Template', {
    
    singleton: true,
    
    requires: ['Base.Functions.BasicFunctions'], 

    applyTemplate: function(strOrArray, config) {
        if(Hyc.typeOf(strOrArray) === "Array")
            strOrArray = strOrArray.join('');
        
        return strOrArray.replace(/\{([^\}])+\}/g, function(a, b) { return config[b]; });    
    },   
    
    applyTemplate: function(template, config) {
        var tokens,tokensObj,tpl,applied;

        if (typeof template !== "string")
            tpl = Conx.Base.BasicFunctions.arrayJoin(template, '');
        else
            tpl = template;

        tokens = this.tokenizer(tpl); 
        tokensObj = this.valorizer(tokens, config);
        applied = this.applier(tpl, tokensObj);
   
        return applied;
    },
     
    tokenizer: function(template) {
       // var tokens = template.split(/\{([^}]+)\}/); 
        var splitPass1 = template.split('{');//.pop().split('}').shift();
        var splitPass2 = [];

        // delete first item if is irelevant
        if (splitPass1.indexOf('<')!= -1 || splitPass1.indexOf('>')!= -1)
            splitPass1.shift();

        for (var i =0; i< splitPass1.length;i++ ) {
            splitPass2[i] = splitPass1[i].split('}').shift();
        }

        return splitPass2;
    },

    valorizer: function(tokens, config) {
        var obj = {};
       
        for (var token in tokens) {
            obj[tokens[token]] = config[tokens[token]];        
        }
        
        return obj;
    },

    applier: function(template, tokens) {
        for (var token in tokens) {        
            template = template.replace(new RegExp('{' + token + '}', 'g' ), tokens[token]);            
        }

        return template;
    },
});

//TESTS
//Lib.Basics.Template.applyTemplate('<div>{someFunc} falsjd{fdf}fjasdfs{someOtherFunc}</div>',{someFunc:'$%$%#',fdf:'BANGING MONEY',someOtherFunc:'CREEPY'})
//Lib.Basics.Template.tokenizer('<div>{someVal} some more text.</div>')

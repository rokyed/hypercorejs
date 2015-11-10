window.Hyc.addBlueprint('Base.Functions.BasicFunctions',{
    singleton: true,
   
    htmlEscape: function (str) {
        return String(str)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#39;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
    },

    decodeHtml: function (str) {
        return String(str)
                .replace(new RegExp('&amp;','g'), '&')
                .replace(new RegExp('&quot;','g'), '"')
                .replace(new RegExp('&#39;','g'), '\'')
                .replace(new RegExp('&lt;','g'), '<')
                .replace(new RegExp('&gt;','g'), '>'); 
    },

    addPrefix: function (prefix, word) {
        word = word.substring(0,1).toUpperCase() + word.substring(1,word.length);
        return prefix + word;    
    },
    
    arrayJoin: function(arrayToJoin, joiningString) {
        var str = "";
        
        for (var i in arrayToJoin) {
            str += arrayToJoin[i] + joiningString;
        }
        
        return str;
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
    camelCaseToDash: function (str) {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    }  
    
});


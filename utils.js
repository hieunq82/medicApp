module.exports = {
   
    validSmsSyntax : (text)=>{
         const _sms_syntax = [
                            "R",
                            "<number>",
                            "<number>"
                        ]
            var fist_pattent = new RegExp('^['+_sms_syntax[0]+']');
            if(text.search(fist_pattent) >= 0){
                var match_syntax_regex = /^[R]\s[0-9a-zA-Z]{1,10}\s[0-9]{1,5}$/;
                if(text.search(match_syntax_regex) >= 0){
                    return true;
                }
            }
                return false;
            
        // return ()=>{
        //     var match_syntax_regex = /^[R]\s[0-9]{1,5}\s[0-9]{1,5}$/;
        //     text.search(match_syntax_regex)
        // }
    }    
}
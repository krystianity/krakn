"use strict";

const debug = require("debug")("yildiz:accesshandler");

class AccessHandler {

    constructor(config){
    
        //check config's access field
        if(!config.access){
            debug("access is not configured, every prefix is allowed.");
            config.access = "*";
        } else if(typeof config.access === "string"){
            if(config.access === "*"){
                debug("access is opened to any prefix.");
            } else {
                throw new Error("access is configured to " + config.access 
                    + " which is not supported, defaulting to * - allowing any prefix.");
            }
        } else if(typeof config.access === "object"){

            Object.keys(config.access).forEach(key => {

                if(typeof key !== "string"){
                    debug("access keys must be a string, as they represent the prefix", key, "is not, which is why it was removed.");
                    delete config.access[key];
                    return;
                }

                if((!Array.isArray(config.access[key]) && typeof config.access[key] !== "string") || !config.access[key]){
                    debug("access values must be token arrays or wildcards(*), removing", key);
                    delete config.access[key];
                }

                if(typeof config.access[key] === "string" && config.access[key] !== "*"){
                    throw new Error(`access key ${key} is set with a different value than '*', it must be an array.`);
                }
            });

            if(config["*"]){

                if(!Array.isArray(config["*"])){
                    throw new Error("When access key '*' is defined, it must be an array.");
                }

                debug("key * is configured, meaning a few tokens will be able to create any prefix.");
            } else {
                debug("access is allowed for these prefixes only:", Object.keys(config.access).join(", "));
            }
        }

        this.access = config.access;

        if(this.access !== "*" && typeof this.access !== "object"){
            throw new Error("bad access configuration passed: " + this.access);
        }
    }

    isPrefixWithTokenAllowed(prefix, token){

        //-1 prefix not allowed
        //0 noth authorized
        //1 good to go

        if(this.access === "*"){
            return 1;
        }

        let badToken = false;
        if(this.access[prefix]){

            if(Array.isArray(this.access[prefix])){

                //find token or forbid later
                for(let i = 0; i < this.access[prefix].length; i++){
                    if(this.access[prefix][i] === token){
                        return 1;
                    }
                }
                badToken = true;
                //dont end here, as it might be "*" token
            } else {
                //should be string = *
                return 1;
            }
        }

        if(this.access["*"]){

            //find token or forbid
            for(let i = 0; i < this.access["*"].length; i++){
                if(this.access["*"][i] === token){
                    return 1;
                }
            }

            return 0;
        }

        if(badToken){
            return 0;
        }

        return -1;
    }
}

module.exports = AccessHandler;
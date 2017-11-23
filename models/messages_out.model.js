/**
 * Created by Linhnv on 07-Jun-17.
 */
module.exports = function(mongoose){
return [
{
    "register_id": {type: String},
    "content" : {type: String},
    "to" : {type: String},
    "id" : {type: String},
    "state" : {type: String},
    "type" : {type: String},
    "history": {type: Array}
} , {
            timestamps: true,
            createdby: true,
            updatedby: true
        }]
};
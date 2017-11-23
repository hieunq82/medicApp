/**
 * Created by Linhnv on 07-Jun-17.
 */
module.exports = function(mongoose){
return [
{
    "id" : {type: String},
    "register_id" : {type: String},
    "to" : {type: String},
    "content" : {type: String},
    "state" : {type: String},
    "message_history" : {type: Array},
} , {
            timestamps: true,
            createdby: true,
            updatedby: true
        }]
};
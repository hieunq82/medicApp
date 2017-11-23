/**
 * Created by fernnguyen on 7/5/2017.
 */

module.exports = function(mongoose){
    return [
        {
            "first_name" : {type: String},
            "last_name" : {type: String},
            "email" : {type: String},
            "phone_number"  : {type: String},
            "username"  : {type: String},
            "password": {type: String},
            "hf": {type: Object},
            "is_admin": {type: Boolean}
        } , {
            timestamps: true,
            createdby: true,
            updatedby: true
        }]
};

//Setting type: 1: General setting,
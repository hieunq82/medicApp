/**
 * Created by fernnguyen on 7/5/2017.
 */

module.exports = function(mongoose){
    return [
        {
            "setting_name" : {type: String},
            "setting_value" : {type: Array},
            "setting_note" : {type: String},
            "setting_type"  : {type: Number, default: 1},
            "setting_varible": {type: Array}
        } , {
            timestamps: true,
            createdby: true,
            updatedby: true
        }]
};

//Setting type: 1: General setting,
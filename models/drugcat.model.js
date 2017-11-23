/**
 * Created by Linhnv on 08-Jun-17.
 */

module.exports = function(mongoose){
    return [
        {
            "cat_name" : {type: String},
        } , {
            timestamps: true,
            createdby: true,
            updatedby: true
        }]
};
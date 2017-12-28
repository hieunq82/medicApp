/**
 * Created by sonlt on 12/25/2017.
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
/**
 * Created by sonlt on 12/15/2017.
 */

module.exports = function(mongoose){
    return [
        {
            "hf_name" : {type: String},
            "hf_category_id" : {type: String},
            "hf_category_name" : {type: String},
            "hf_description": { type: String},
            "hf_status": { type: Boolean}
        } , {
            timestamps: true,
            createdby: true,
            updatedby: true
        }]
};

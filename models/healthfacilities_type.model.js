/**
 * Created by sonlt on 12/15/2017.
 */

module.exports = function(mongoose){
    return [
        {
            "hf_type_name" : {type: String},
            "hf_type_code" : {type: String},
            "hf_type_category_id" : {type: String},
            "hf_type_category_name" : {type: String},
            "hf_type_description": { type: String},
            "hf_type_status": { type: Boolean}
        } , {
            timestamps: true,
            createdby: true,
            updatedby: true
        }]
};

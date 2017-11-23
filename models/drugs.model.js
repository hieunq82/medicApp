/**
 * Created by Linhnv on 08-Jun-17.
 */

module.exports = function(mongoose){
    return [
        {
            "drug_name" : {type: String},
            "drug_code" : {type: String},
            "drug_category_id" : {type: String},
            "drug_category_name" : {type: String},
            "drug_description": { type: String},
            "drug_status": { type: Boolean}
        } , {
            timestamps: true,
            createdby: true,
            updatedby: true
        }]
};
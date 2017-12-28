/**
 * Created by Linhnv on 08-Jun-17.
 */

module.exports = function(mongoose){
    return [
        {
            "hf_name" : {type: String},
            "hf_id" : {type: String},
            // "hf_drugs" : {type: Array},
            "drug_name": {type: String},
            "drug_code": {type: String},
            "drug_description": {type: String},
            "drug_id": {type: String},
            "drug_asl": {type: Number},
            "drug_eop": {type: Number},
            "drug_abs": {type: Number},
            "hf_detail": {
                "address":{type: String},
                "name":{type: String},
                "notes":{type: String},
                "person":{type: String},
                "person_mobile":{type: String},
                "phone":{type: String},
                "type":{type: String},
                "vdc":{type: String},
                "reporting_center": [{
                    "_id": {type: String},
                    "name": {type: String},
                    "person": {type: String},
                    "person_mobile": {type: String},
                }]
            }

        } , {
            timestamps: true,
            createdby: true,
            updatedby: true
        }]
};
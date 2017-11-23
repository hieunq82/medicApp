/**
 * Created by Linhnv on 08-Jun-17.
 */

module.exports = function(mongoose){
    return [
        {
            drug_abs: {type: String},
            drug_abs_old: {type: String},
            drug_asl: {type: String},
            drug_code: {type: String},
            drug_eop: {type: String},
            drug_id: {type: String},
            drug_name: {type: String},
            hf_detail: {type: Object},
            hf_id: {type: Object},
            update_type: {type: String},
            user_update: {type: Object}
        } , {
            timestamps: true,
            createdby: true,
            updatedby: true
        }]
};
/**
 * Created by Linhnv on 07-Jun-17.
 */
module.exports = function(mongoose){
    return [
        {
            "from": {type: String},
            "form": {type: String},
            "tasks": [
                {
                    "messages": [
                        {
                            "to": {type: String},
                            "uuid": {type: String},
                            "message": {type: String}
                        }
                    ],
                    "state": {type: String},
                    "state_history": {type: Array},
                    "timestamp": {type: String}
                }
            ],
            "fields": {
                "drug_code": {type: Number},
                "drung_quantity": {type: Number},
            },
            "reported_date":  {type: Number},
            "sms_message": {type: Object},
            "scheduled_tasks":  {type: Array}
        }
    , {
        timestamps: true,
        createdby: true,
        updatedby: true
    }]
};


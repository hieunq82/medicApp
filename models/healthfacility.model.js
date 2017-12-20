module.exports = function(mongoose){
    return [{
    "name": {type: String},
    "phone":   {type: String},
    "reporting_center": {
        "_id": {type: String},
        "name": {type: String},
        "person": {type: String},
        "person_mobile": {type: String},
    },
    "type": {type: String},
    "place_type": {type: String},
    "person": {type: String},
    "person_mobile": {type: String},
    "vdc": {type: String},
    "active": {type: Boolean},
    "notes": {type: String}
}, {
    "timestamps": true,
    "createdby": true,
    "updatedby": true
}]
};

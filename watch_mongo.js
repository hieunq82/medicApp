var MongoStream = require('mongo-watch');

var watcher = new MongoStream({format: 'pretty'});

// watch the collection
watcher.watch('drugmon.healthfacilities', function(event) {
  // parse the results
  console.log('Health Facilities changes:', event);
})





// Initializes the `workhours` service on path `/workhours`
const createService = require('feathers-mongodb');
const hooks = require('./workhours.hooks');

module.exports = function (app) {
  const paginate = app.get('paginate');
  const mongoClient = app.get('mongoClient');
  const options = { paginate };

  // Initialize our service with any options it requires
  app.use('/workhours', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('workhours');

  mongoClient.then(db => {
    service.Model = db.collection('workhours');
  });

  service.hooks(hooks);
};

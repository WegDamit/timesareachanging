// Initializes the `projects` service on path `/projects`
const createService = require('feathers-mongodb');
const hooks = require('./projects.hooks');

module.exports = function (app) {
  const paginate = app.get('paginate');
  const mongoClient = app.get('mongoClient');
  const options = { paginate };

  // Initialize our service with any options it requires
  app.use('/projects', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('projects');

  mongoClient.then(db => {
    service.Model = db.collection('projects');
  });

  service.hooks(hooks);
};

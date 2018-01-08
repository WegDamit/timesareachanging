const users = require('./users/users.service.js');
const projects = require('./projects/projects.service.js');
const workhours = require('./workhours/workhours.service.js');
module.exports = function (app) {
  app.configure(users);
  app.configure(projects);
  app.configure(workhours);
};

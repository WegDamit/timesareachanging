const workhours = require('./workhours/workhours.service.js');
const users = require('./users/users.service.js');
const projects = require('./projects/projects.service.js');
module.exports = function (app) {
  app.configure(workhours);
  app.configure(users);
  app.configure(projects);
};

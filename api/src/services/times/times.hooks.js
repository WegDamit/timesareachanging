const { authenticate } = require('feathers-authentication').hooks;
const { populate } = require('feathers-hooks-common');
const processTimes = require('../../hooks/process-times');

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [],
    create: [processTimes()],
    update: [processTimes()],
    patch: [processTimes()],
    remove: []
  },

  after: {
    all: [
      populate({
        schema: {
          include: [{
            service: 'users',
            nameAs: 'user',
            parentField: 'userId',
            childField: '_id'
          }]
        }
      })
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

/**
  hook.data looks like
  {
    range:
     { from: '2017-12-31T11:00:54.348Z',
       to: '2017-12-31T19:00:54.348Z' },
    spent_hours: 0.5,
    project_title: 'huhu',
    project_id: '3PbxknIU3hiia2C6',
    description: 'nix'
  }

*/
module.exports = function() {
  return function(hook) {
    // The authenticated user
    const user = hook.params.user
    // The actual message text
    const text = hook.data.description
      // Messages can't be longer than 400 characters
      .substring(0, 400)
      // Do some basic HTML escaping
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    // Override the original data
    hook.data = {
      project_title: hook.data.project_title,
      spent_hours: hook.data.spent_hours,
      description: text,
      day: hook.data.day,
      range: hook.data.range,
      project_id: hook.data.project_id,
      // Set the user id
      userId: user._id,
      // Add the current time via `getTime`
      createdAt: new Date().getTime()
    }
    console.info("saved data: ", hook.data)

    // Hooks can either return nothing or a promise
    // that resolves with the `hook` object for asynchronous operations
    return Promise.resolve(hook)
  }
}

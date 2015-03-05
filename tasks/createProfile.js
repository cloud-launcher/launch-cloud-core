import fs from 'fs';
import promise from 'promise-callback';

module.exports = (gulp) => {
  gulp.task('createProfile', ['transpile'], () => {
    const createProfile = require('../.dist/providers/digitalocean/createProfile');

    return createProfile(new require('do-wrapper'), process.env.DO_TOKEN)
      .then(
        profile => promise(fs.writeFile,
                            './src/providers/digitalocean/profile.json',
                            JSON.stringify(profile, null, '  ')),
        error => console.log('Error creating digitalocean profile', error.stack));
  });
};
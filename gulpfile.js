const browserify = require('browserify'),
      gulp = require('gulp'),
      source = require('vinyl-source-stream');

const {
  cached,
  clean,
  concat,
  gutil,
  jshint,
  pipe,
  print,
  run,
  sequence,
  sourcemaps,
  tasks,
  traceur
} = require('gulp-load-plugins')({
  rename: {
    'gulp-util': 'gutil'
  }
});

const result = tasks(gulp, require);
if (typeof result === 'string') console.log(result);

gulp.task('default', ['build']);

gulp.task('build', sequence('clean', 'templates', 'copyProfiles'));

gulp.task('dev', ['templates', 'copyProfiles'], () => gulp.watch(paths.scripts, ['templates']));

gulp.task('run', () => run(`node ${paths.dist}/index.js`).exec());

gulp.task('runtime', ['transpile'],
  () => pipe([
    gulp.src([traceur.RUNTIME_PATH])
    ,print()
    ,concat('traceur-runtime.js')
    ,gulp.dest(paths.dist)
  ])
  .on('error', function(e) { console.log(e); }));

gulp.task('transpile', //['jshint'],
  () => pipe([
    gulp.src(paths.scripts)
    ,cached('transpile')
    ,print()
    ,sourcemaps.init()
    // ,to5()
    ,traceur({modules: 'commonjs', asyncGenerators: true, forOn: true, asyncFunctions: true})
    ,sourcemaps.write('.')
    ,gulp.dest(paths.dist)
  ])
  .on('error', function(e) { console.log(e); }));


gulp.task('templates', ['runtime'],
  () => pipe([
    browserify(paths.templates)
      .transform('brfs')
      .bundle()
    ,source('templates/index.js')
    ,print()
    ,gulp.dest(paths.dist)
  ]));

gulp.task('copyProfiles',
  () => pipe([
    gulp.src(['src/providers/**/profile.json'])
    ,gulp.dest('.dist/providers')
  ]));

gulp.task('jshint',
  () => pipe([
    gulp.src(paths.scripts)
    ,cached('jshint')
    ,print()
    ,jshint()
    ,jshint.reporter('jshint-stylish')
    ,jshint.reporter('fail')
  ]));

gulp.task('clean',
  () => pipe([
    gulp.src(paths.dist, {read: false})
    ,clean()
  ]));

const paths = {
  scripts: ['src/**/*.js'],
  templates: './src/templates/index.js',
  dist: '.dist'
};

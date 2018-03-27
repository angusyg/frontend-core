const gulp = require('gulp');
const del = require('del');
const pump = require('pump');
const plugins = require('gulp-load-plugins')();
const gutil = require('gulp-util');
const uglify = require('gulp-uglify-es').default;
const fs = require('fs');

const libJs = [
  'node_modules/jquery/dist/jquery.min.js',
  'node_modules/angular/angular.min.js',
  'node_modules/angular-animate/angular-animate.min.js',
  'node_modules/angular-messages/angular-messages.min.js',
  'node_modules/@uirouter/angularjs/release/angular-ui-router.min.js',
  'node_modules/angular-storage/dist/angular-storage.min.js',
  'node_modules/angular-translate/dist/angular-translate.min.js',
  'node_modules/angular-translate-loader-partial/angular-translate-loader-partial.min.js',
  'node_modules/ui-bootstrap4/dist/ui-bootstrap-tpls.js',
];
const libCss = ['node_modules/bootstrap/dist/css/bootstrap.min.css'];
const sourceJs = [
  'src/app/**/*.module.js',
  'src/app/**/*.js',
  '!**/*gulpfile.js',
  '!**/*.eslintrc.js'
];
const sourceCss = [
  'src/styles/**/*.sass',
  'src/styles/**/*.scss'
];
const indexHtml = './dist/index.html';
const sourceHtml = ['tests/**/*.html'];
const destinationJs = './dist';
const destinationCss = './dist';
const destinationHtml = './dist';
const finalJs = 'frontend.core.js';
const finalLibJs = 'lib.min.js';
const esLintJs = ['src/app/**/*.js'];
const cleanJs = [`${destinationJs}/**/*.js`];
const cleanCss = [
  `${destinationCss}/**/*.css`,
  `${destinationCss}/**/*.map`,
];
const cleanHtml = [`${destinationCss}/**/*.html`];

/**
 * Log to console an Error
 *
 * @param  {error} err error thrown during gulp task
 */
function logError(err) {
  if (err) gutil.log(gutil.colors.red('[Error]'), err.toString());
}

// validate js files
gulp.task('eslint', () => {
  pump([
    gulp.src(esLintJs),
    plugins.eslint(),
    plugins.eslint.format('stylish'),
    plugins.eslint.results((results) => {
      if (results.errorCount > 0) {
        gutil.log(gutil.colors.red('End in eslint task due to error(s)'));
        process.exit(1);
      }
    }),
  ], logError);
});

// remove js libs
gulp.task('clean-js', () => {
  del(cleanJs)
    .catch(logError);
});

// remove css libs
gulp.task('clean-css', () => {
  del(cleanCss)
    .catch(logError);
});

// remove css libs
gulp.task('clean-html', () => {
  del(cleanHtml)
    .catch(logError);
});

// remove js and css lib from public
gulp.task('clean', ['clean-js', 'clean-css', 'clean-html']);

// expose js lib in public
gulp.task('copy-js-lib', ['clean-js'], () => {
  pump([
    gulp.src(libJs),
    plugins.concat(finalLibJs),
    gulp.dest(destinationJs),
  ], logError);
});

gulp.task('sass', () => {
  pump([
    gulp.src(sourceCss),
    plugins.sass(),
    gulp.dest(destinationCss),
    plugins.connect.reload(),
  ], logError);
});

// minification of client js
gulp.task('uglify', () => {
  pump([
    gulp.src(sourceJs),
    plugins.concat(finalJs),
    gulp.dest(destinationJs),
    uglify({
      mangle: {
        toplevel: true,
      },
    }),
    gulp.dest(destinationJs),
    plugins.connect.reload(),
  ], logError);
});

gulp.task('jsdoc', plugins.shell.task(
  'node node_modules/jsdoc/jsdoc.js ' +
  '-c node_modules/angular-jsdoc/common/conf.json ' +
  '-t node_modules/angular-jsdoc/default ' +
  '-d doc ' +
  './README.md ' +
  '-r src'
));

gulp.task('connect', () => {
  plugins.connect.server({
    root: 'dist',
    livereload: true,
    open: {
      browser: 'chrome'
    }
  });
});

// Creates an index page for development tests
gulp.task('init-html', () => {
  try {
    fs.writeFileSync(indexHtml, `
      <!DOCTYPE html>
      <html ng-app="frontend.core">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Frontend core module dev page</title>
        <link rel="stylesheet" href="style.css">
      </head>
      <body>
        <auth-dialog></auth-dialog>
        <div ui-view />
        <script src="lib.min.js"></script>
        <script src="frontend.core.js"></script>
      </body>
      </html>`);
  } catch (err) {
    logError(err);
  }
});

// Livereload du HTML
gulp.task('html', () => {
  pump([
    gulp.src(indexHtml),
    plugins.connect.reload(),
  ], logError);
});

// watch files for reload in dev mode
gulp.task('watch', () => {
  gulp.watch(sourceCss, ['sass']);
  gulp.watch(sourceJs, ['uglify']);
  gulp.watch(indexHtml, ['html']);
});

// default task (production)
gulp.task('default', ['copy-js-lib', 'init-html', 'html', 'sass', 'uglify', 'connect', 'watch'])
gulp.task('postinstall', ['sass', 'uglify']);

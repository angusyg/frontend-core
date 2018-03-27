const gulp = require('gulp');
const del = require('del');
const pump = require('pump');
const plugins = require('gulp-load-plugins')();
const gutil = require('gulp-util');
const uglify = require('gulp-uglify-es').default;
const runSequence = require('run-sequence');

const libJs = [
  'node_modules/jquery/dist/jquery.js',
  'node_modules/angular/angular.js',
  'node_modules/angular-animate/angular-animate.js',
  'node_modules/angular-messages/angular-messages.js',
  'node_modules/@uirouter/angularjs/release/angular-ui-router.js',
  'node_modules/angular-storage/dist/angular-storage.js',
  'node_modules/angular-translate/dist/angular-translate.js',
  'node_modules/angular-translate-loader-partial/angular-translate-loader-partial.js',
  'node_modules/ui-bootstrap4/dist/ui-bootstrap-tpls.js',
];
const localJs = [
  'src/app/**/*.module.js',
  'src/app/**/*.js',
  '!**/*gulpfile.js',
  '!**/*.eslintrc.js'
];
const sourceJs = libJs.concat(localJs);
const sourceCss = [
  'src/styles/**/*.sass',
  'src/styles/**/*.scss'
];
const sourceHtml = ['src/html/**/*'];
const dest = 'web';
const destinationJs = `${dest}/js`;
const destinationCss = `${dest}/stylesheets`;
const destinationHtml = `${dest}`;
const finalJs = 'frontend.core.js';
const lintJs = [
  'src/app/**/*.js',
  '!**/gulpfile.js',
  '!**/.eslintrc'
];
const cleanJs = [`${destinationJs}`];
const cleanCss = [`${destinationCss}`];
const cleanHtml = [
  `${destinationHtml}/**/*.html`,
  `${destinationHtml}/partials`
];
const isProduction = (process.env.NODE_ENV === 'production');
const pumpPromise = (streams) => {
  return new Promise((resolve, reject) => {
    pump(streams, (err) => {
      if (err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
        reject(err);
      } else resolve();
    });
  });
};

// validate js files
gulp.task('lint', () => pumpPromise([
  gulp.src(lintJs),
  plugins.eslint(),
  plugins.eslint.format('stylish'),
  plugins.eslint.failAfterError(),
]));

// removes js
gulp.task('clean-js', () => del(cleanJs));

// removes css
gulp.task('clean-css', () => del(cleanCss));

// removes html
gulp.task('clean-html', () => del(cleanHtml));

// removes all static files
gulp.task('clean', (callback) => runSequence('clean-js', 'clean-css', 'clean-html', callback));

// creates css from sass files and reload in dev mode
gulp.task('css', () => pumpPromise([
  gulp.src(sourceCss),
  plugins.sass(),
  plugins.cleanCss(),
  gulp.dest(destinationCss),
  plugins.if(!isProduction, plugins.connect.reload()),
]));

// copy and minifies if necessary js files and reload in dev mode
gulp.task('js', () => pumpPromise([
  gulp.src((isProduction ? sourceJs : localJs)),
  plugins.concat(finalJs),
  gulp.dest(destinationJs),
  plugins.if(isProduction, uglify({ mangle: false })),
  plugins.if(isProduction, plugins.rename({ suffix: '.min' })),
  plugins.if(isProduction, gulp.dest(destinationJs)),
  plugins.if(!isProduction, plugins.connect.reload()),
]));

// copy and replaces in html js import if production mode and reload in dev mode
gulp.task('html', () => pumpPromise([
  gulp.src(sourceHtml),
  plugins.if(isProduction, plugins.htmlReplace({ js: '/js/frontend.core.min.js' })),
  gulp.dest(destinationHtml),
  plugins.if(!isProduction, plugins.connect.reload()),
]));

// creates connect server for dev mode
gulp.task('connect', () => {
  if (!isProduction) {
    plugins.connect.server({
      root: ['web', 'node_modules'],
      livereload: true,
    });
  }
});

// watch files for reload in dev mode
gulp.task('watch', () => {
  if (!isProduction) {
    gulp.watch(sourceCss, ['css']);
    gulp.watch(sourceJs, ['js']);
    gulp.watch(sourceHtml, ['html']);
  }
});

gulp.task('default', (callback) => runSequence('clean', ['html', 'css', 'js'], 'connect', 'watch', callback));
gulp.task('postinstall', ['default']);

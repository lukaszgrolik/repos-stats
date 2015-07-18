var gulp = require('gulp');
var gp = require('gulp-load-plugins')();
var runSequence = require('run-sequence');
var yaml = require('js-yaml');
var fs = require('fs');
var minimist = require('minimist');
var lodash = require('lodash');

var tasks = {};

var paths = {
  buildTemp: 'build-temp',
  devBundle: 'web/dev',
  prodBundle: 'web/prod',
};

//
//
//

function getAssets() {
  var result = null;

  try {
    result = yaml.safeLoad(fs.readFileSync('./src/assets.yml', 'utf8'));
  } catch (e) {
    console.log(e);
  }

  return result;
}

//
//
//

tasks.connectDev = function() {
  return gulp.src(paths.devBundle + '/')
  .pipe(gp.webserver({
    host: '0.0.0.0',
    port: 3400,
    // livereload: true
    fallback: 'index.html',
  }));
}

tasks.connectProd = function() {
  return gulp.src(paths.prodBundle + '/')
  .pipe(gp.webserver({
    host: '0.0.0.0',
    port: 3401,
    fallback: 'index.html',
  }));
}

tasks.livereload = function() {
  return gulp.src('web/**/*.{html,css,js}')
  .pipe(gp.plumber())
  // .pipe(gp.connect.reload());
}

tasks.buildDevIndex = function() {
  return gulp.src('src/base-index.html')
  .pipe(gp.plumber())
  .pipe(gp.rename('index.html'))
  .pipe(gp.template({
    env: 'dev',
    assets: getAssets(),
  }))
  .pipe(gulp.dest(paths.devBundle));
}

tasks.buildProdIndex = function() {
  // var assets = gp.useref.assets();

  return gulp.src('src/base-index.html')
  .pipe(gp.plumber())
  .pipe(gp.rename('index.html'))
  .pipe(gp.template({
    env: 'prod',
    assets: getAssets(),
  }))
  // .pipe(assets)
  // .pipe(assets.restore())
  // .pipe(gp.useref())
  .pipe(gulp.dest(paths.prodBundle));
}

tasks.buildAngularTemplates = function() {
  return gulp.src('src/app/**/*.html')
  .pipe(gp.plumber())
  .pipe(gp.htmlmin({
    removeComments: true,
    collapseWhitespace: true,
    conservativeCollapse: true,
  }))
  .pipe(gp.angularTemplatecache({
    filename: 'angular-templates.js',
    module: 'templates',
    standalone: true,
  }))
  .pipe(gulp.dest(paths.buildTemp));
}

tasks.buildAngularModules = function() {
  return gulp.src(['src/app/**/*.js'])
  .pipe(gp.angularModules('angular-modules.js', {
    name: 'modules',
  }))
  .pipe(gulp.dest(paths.buildTemp));
}

tasks.buildDevVendorCss = function() {
  var scripts = getAssets().vendorStyles.map(function(asset) {

    return asset.src;
  });

  return gulp.src(scripts)
  .pipe(gp.plumber())
  .pipe(gp.sourcemaps.init())
  .pipe(gp.concat('vendor.css'))
  .pipe(gp.sourcemaps.write('./'))
  .pipe(gulp.dest(paths.devBundle + '/css'));
}

tasks.buildProdVendorCss = function() {
  var scripts = getAssets().vendorStyles.map(function(asset) {
    return (asset.dist || asset.src);
  });

  return gulp.src(scripts)
  .pipe(gp.plumber())
  .pipe(gp.sourcemaps.init())
  .pipe(gp.concat('vendor.min.css'))
  .pipe(gp.sourcemaps.write('./'))
  .pipe(gulp.dest(paths.prodBundle + '/css'));
}

tasks.buildVendorCss = function(cb) {
  runSequence(
    ['buildDevVendorCss', 'buildProdVendorCss'],
    cb
  );
};

tasks.buildDevCoreCss = function() {
  // return gulp.src('src/style/**/*.scss')
  return gulp.src('src/style/main.scss')
  .pipe(gp.plumber()) // @test after sass because of errLogToConsole:true
  .pipe(gp.sourcemaps.init())
  .pipe(gp.cssGlobbing({
    extensions: ['.scss'],
  }))
  .pipe(gp.sass({
    // includePaths: ['fonts/', 'components/'],
    // errLogToConsole: true,
  }))
  .on('error', function (err) {
    var displayErr = gp.util.colors.red(err);

    gp.util.log(displayErr);
    gp.util.beep();

    this.emit('end');
  })
  .pipe(gp.autoprefixer({
    browsers: ['> 0.5%']
  }))
  .pipe(gp.sourcemaps.write('./'))
  .pipe(gulp.dest(paths.devBundle + '/css'));
}

tasks.buildProdCoreCss = function() {
  return gulp.src('src/style/main.scss')
  .pipe(gp.plumber())
  .pipe(gp.sourcemaps.init())
  .pipe(gp.cssGlobbing({
    extensions: ['.scss'],
  }))
  .pipe(gp.sass({
    // includePaths: ['fonts/', 'components/'],
    // errLogToConsole: true,
  }))
  .on('error', function (err) {
    var displayErr = gp.util.colors.red(err);

    gp.util.log(displayErr);
    gp.util.beep();

    this.emit('end');
  })
  .pipe(gp.autoprefixer({
    browsers: ['> 0.5%']
  }))
  .pipe(gp.minifyCss({
    advanced: false,
  }))
  .pipe(gp.rename('main.min.css'))
  .pipe(gp.sourcemaps.write('./'))
  .pipe(gulp.dest(paths.prodBundle + '/css'));
}

tasks.buildCoreCss = function(cb) {
  runSequence(
    ['buildDevCoreCss', 'buildProdCoreCss'],
    cb
  );
};

tasks.buildDevVendorJs = function() {
  var scripts = getAssets().vendorScripts.map(function(asset) {
    return asset.src;
  });

  return gulp.src(scripts)
  .pipe(gp.plumber())
  .pipe(gp.sourcemaps.init())
  .pipe(gp.concat('vendor.js'))
  .pipe(gp.sourcemaps.write('./'))
  .pipe(gulp.dest(paths.devBundle + '/js'));
}

tasks.buildProdVendorJs = function() {
  var scripts = getAssets().vendorScripts.map(function(asset) {
    return (asset.dist || asset.src);
  });

  return gulp.src(scripts)
  .pipe(gp.plumber())
  .pipe(gp.sourcemaps.init())
  .pipe(gp.concat('vendor.min.js'))
  .pipe(gp.sourcemaps.write('./'))
  .pipe(gulp.dest(paths.prodBundle + '/js'));
}

tasks.buildVendorJs = function(cb) {
  runSequence(
    ['buildDevVendorJs', 'buildProdVendorJs'],
    cb
  );
};

var buildCoreJsScripts = [
  paths.buildTemp + '/angular-templates.js',
  paths.buildTemp + '/angular-modules.js',
  'src/app/**/*Module.js',
  'src/app/**/*.js',
];
var jsWrapCode = "(function() {\n\n<%= contents %>\n\n}());";

tasks.buildDevCoreJs = function() {
  return gulp.src(buildCoreJsScripts)
  .pipe(gp.plumber())
  .pipe(gp.sourcemaps.init())
  .pipe(gp.wrap(jsWrapCode))
  .pipe(gp.concat('main.js'))
  .pipe(gp.sourcemaps.write('./'))
  .pipe(gulp.dest(paths.devBundle + '/js'));
}

tasks.buildProdCoreJs = function() {
  return gulp.src(buildCoreJsScripts)
  .pipe(gp.plumber())
  .pipe(gp.sourcemaps.init())
  .pipe(gp.wrap(jsWrapCode))
  .pipe(gp.concat('main.min.js'))
  .pipe(gp.ngAnnotate())
  .pipe(gp.uglify())
  .pipe(gp.sourcemaps.write('./'))
  // .pipe(gp.rename('main.min.js'))
  .pipe(gulp.dest(paths.prodBundle + '/js'));
}

tasks.buildCoreJs = function(cb) {
  runSequence(
    ['buildAngularTemplates', 'buildAngularModules'],
    // 'buildAngularModules',
    ['buildDevCoreJs', 'buildProdCoreJs'],
    cb
  );
};

//
//
//

tasks.removeAnnotations = function() {
  return gulp.src('src/app/**/*.js')
  .pipe(gp.plumber())
  .pipe(gp.ngAnnotate({
    remove: true,
  }))
  .pipe(gulp.dest('src/app'));
}

//
//
//

tasks.generateComponent = function(cb) {
  var options = minimist(process.argv.slice(2), {});
  var path = options.path || '';
  var hyphenName = options.name;
  var jsName = hyphenName.split('-')
  .map(function(word, i) {
    if (i != 0) {
      word = capitalizeFirstLetter(word);
    }

    return word;
  })
  .join('');
  var pcName = capitalizeFirstLetter(jsName);
  var names = {
    hyphenName: hyphenName,
    pcName: pcName,
    jsName: jsName,
  };

  var contents = {
    module: getContent('module.js'),
    controller: getContent('controller.js'),
    directive: getContent('directive.js'),
    template: getContent('template.html'),
    style: getContent('style.scss'),
  };

  fs.mkdirSync('src/app/' + path + hyphenName);
  fs.writeFileSync('src/app/' + path + hyphenName + '/' + jsName + 'Module.js', contents.module);
  fs.writeFileSync('src/app/' + path + hyphenName + '/' + pcName + 'Ctrl.js', contents.controller);
  fs.writeFileSync('src/app/' + path + hyphenName + '/' + jsName + '.js', contents.directive);
  fs.writeFileSync('src/app/' + path + hyphenName + '/' + hyphenName + '.html', contents.template);
  fs.writeFileSync('src/app/' + path + hyphenName + '/_' + hyphenName + '.scss', contents.style);

  cb();

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  function getContent(name) {
    return lodash.template(fs.readFileSync('src/generatorTemplates/component/' + name))(names)
  }
};

//
//
//

gulp.task('connectDev', tasks.connectDev);
gulp.task('connectProd', tasks.connectProd);
// gulp.task('livereload', tasks.livereload);

gulp.task('buildDevIndex', tasks.buildDevIndex);
gulp.task('buildProdIndex', tasks.buildProdIndex);

gulp.task('buildAngularTemplates', tasks.buildAngularTemplates);
gulp.task('buildAngularModules', tasks.buildAngularModules);

gulp.task('buildDevVendorCss', tasks.buildDevVendorCss);
gulp.task('buildProdVendorCss', tasks.buildProdVendorCss);
gulp.task('buildDevCoreCss', tasks.buildDevCoreCss);
gulp.task('buildProdCoreCss', tasks.buildProdCoreCss);

gulp.task('buildDevVendorJs', tasks.buildDevVendorJs);
gulp.task('buildProdVendorJs', tasks.buildProdVendorJs);
gulp.task('buildDevCoreJs', tasks.buildDevCoreJs);
gulp.task('buildProdCoreJs', tasks.buildProdCoreJs);

gulp.task('buildVendorCss', tasks.buildVendorCss);
gulp.task('buildCoreCss', tasks.buildCoreCss);

gulp.task('buildVendorJs', tasks.buildVendorJs);
gulp.task('buildCoreJs', tasks.buildCoreJs);

gulp.task('removeAnnotations', tasks.removeAnnotations);
gulp.task('generateComponent', tasks.generateComponent);

gulp.task('watch', function() {
  gulp.watch('src/app/**/*.html', {interval: 500}, ['buildCoreJs']);
  gulp.watch('src/style/**/*.scss', {interval: 500}, ['buildCoreCss']);
  gulp.watch('src/app/**/*.scss', {interval: 500}, ['buildCoreCss']);
  gulp.watch('src/app/**/*.js', {interval: 500}, ['buildCoreJs']);
  gulp.watch([
    'bower_components/**/*.{css,js}',
    'src/vendor/**/*.{css,js}',
  ], {interval: 500}, [
    'buildVendorCss',
    'buildVendorJs',
  ]);
  gulp.watch('src/base-index.html', {interval: 500}, [
    'buildDevIndex',
    'buildProdIndex'
  ]);
  gulp.watch('src/assets.yml', {interval: 500}, [
    'buildDevIndex',
    'buildProdIndex',
    'buildVendorCss',
    'buildVendorJs',
    'buildProdCoreCss',
    'buildCoreJs',
  ]);
  // gulp.watch('web/**/*.{html,css,js}', ['livereload'])
});

gulp.task('build', [
  'buildDevIndex',
  'buildProdIndex',
  // 'buildAngularTemplates',
  'buildVendorCss',
  'buildVendorJs',
  'buildCoreCss',
  'buildCoreJs',
]);
gulp.task('server', function(cb) {
  runSequence(
    'build',
    ['connectDev', 'connectProd'],
    'watch',
    cb
  );
});
gulp.task('default', ['server']);
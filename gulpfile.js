var gulp = require('gulp'),
    paths = require('./gulp.config.json'),
    plug = require('gulp-load-plugins')(),
    del = require('del'),
    KILOBYTE_SIZE = 1000,
    PERCENTAGE = 100,

    log = plug.util.log;

gulp.task('analyze', analyze);
gulp.task('default', defaultTask);
gulp.task('js', minifyJavascript);
gulp.task('vendorjs', vendorjs);
gulp.task('sass', sass);
gulp.task('css', minifyingCss);
gulp.task('vendorcss', vendorCss);
gulp.task('images', compressImages);
gulp.task('clean', clean);

/**
 * Lint the code.
 * @return {Stream}
 */
function analyze() {
    'use strict';

    log('Analyzing source with ESLint');

    return gulp
        .src(paths.js)
        .pipe(plug.eslint())
        .pipe(plug.eslint.format())
        .pipe(plug.eslint.failAfterError());
}

/**
* Minify and bundle the app's JavaScript.
* @return {Stream}
*/
function minifyJavascript() {
    'use strict';

    log('Bundling, minifying, and copying the app\'s JavaScript');

    return gulp
        .src(paths.js)
        .pipe(plug.concat('all.min.js'))
        .pipe(plug.bytediff.start())
        .pipe(plug.uglify({
            mangle: true
        }))
        .pipe(plug.bytediff.stop(bytediffFormatter))
        .pipe(gulp.dest(paths.build + 'javascripts'));
}

/**
 * Formatter for bytediff to display the size changes after processing
 * @param {Object} data - Byte data
 * @return {String}
 */
function bytediffFormatter(data) {
    'use strict';

    var difference = '';

    if (data.savings > 0) {
        difference = ' smaller.';
    } else {
        difference = ' larger.';
    }

    return data.fileName + ' went from ' +
        (data.startSize / KILOBYTE_SIZE).toFixed(2) +
        ' kB to ' + (data.endSize / KILOBYTE_SIZE).toFixed(2) +
        ' kB and is ' +
        formatPercent(1 - data.percent, 2) + '%' + difference;
}

/**
 * Format a number as a percentage
 * @param {Number} num - Number to format as a percent
 * @param {Number} precision - Precision of the decimal
 * @return {String}
 */
function formatPercent(num, precision) {
    'use strict';

    return (num * PERCENTAGE).toFixed(precision);
}


/**
 * Copy the Vendor JavaScript
 * @return {Stream}
 */
function vendorjs() {
    'use strict';

    log('Bundling, minifying, and copying the Vendor JavaScript');

    // noinspection JSUnresolvedFunction
    return gulp
        .src(paths.vendorjs)
        .pipe(plug.concat('vendor.min.js'))
        .pipe(gulp.dest(paths.build + 'javascripts'));
}

/**
 * Minify and bundle the CSS
 * @return {Stream}
 */
function minifyingCss() {
    'use strict';

    log('Bundling, minifying, and copying the app\'s CSS');

    return gulp
        .src(paths.css)
        .pipe(plug.concat('all.min.css'))
        .pipe(plug.autoprefixer('last 2 version', '> 5%'))
        .pipe(plug.bytediff.start())
        .pipe(plug.minifyCss())
        .pipe(plug.bytediff.stop(bytediffFormatter))
        .pipe(gulp.dest(paths.build + 'stylesheets'));
}

/**
 * Minify and bundle the Vendor CSS
 * @return {Stream}
 */
function vendorCss() {
    'use strict';

    var vendorFilter = plug.filter(['**/*.css']);

    log('Compressing, bundling, copying vendor CSS');

    return gulp
        .src(paths.vendorcss)
        .pipe(vendorFilter)
        .pipe(plug.concat('vendor.min.css'))
        .pipe(plug.bytediff.start())
        .pipe(plug.minifyCss({}))
        .pipe(plug.bytediff.stop(bytediffFormatter))
        .pipe(gulp.dest(paths.build + 'stylesheets'));
}

/**
 * Compress images
 * @return {Stream}
 */
function compressImages() {
    'use strict';

    var dest = paths.build + 'images';

    log('Compressing, caching, and copying images');

    return gulp
        .src(paths.images)
        .pipe(plug.imagemin({
            optimizationLevel: 3
        }))
        .pipe(gulp.dest(dest));
}

/**
 * Remove all files from the build folder
 * One way to run clean before all tasks is to run
 * from the cmd line: gulp clean && gulp build
 * @param {Function} cb - Callback function
 * @return {Stream}
 */
function clean(cb) {
    'use strict';

    var delPaths = paths.build;

    log('Cleaning: ' + plug.util.colors.blue(paths.build));

    return del(delPaths, cb);
}

/**
 * Compile sass
 * @return {Stream}
 */
function sass() {
    'use strict';

    log('Compiling sass');

    return gulp.src('./client/src/sass/**/*.scss')
        .pipe(plug.sass().on('error', plug.sass.logError))
        .pipe(gulp.dest('./client/www/stylesheets'));
}

/**
 * Default task
 */
function defaultTask() {
    'use strict';

    log('Default task');

    gulp.watch('./client/src/sass/**/*.scss', ['sass']);
}
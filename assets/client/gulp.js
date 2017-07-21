var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    cssnano = require('gulp-cssnano'),
    gulpif = require('gulp-if'),
    del = require('del'),
    connect = require('gulp-connect'),
    historyApiFallback = require('connect-history-api-fallback'),
    browserSync = require('browser-sync').create(),
    gulpSequence = require('gulp-sequence'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    stripDebug   = require('gulp-strip-debug'),
    flatten = require('gulp-flatten'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    sourcemaps = require('gulp-sourcemaps'),
    plugins = require('gulp-load-plugins')({
        pattern: ['*'],
        rename: {}
    });

var paths = {
    sass: './app/**/*.scss',
    destSass: './app/assets/css',
    css: './app/assets/css/**/*.css',
    concatCssDest: './wwwroot/css/site.css',
    cssManifest: './wwwroot/css/rev-manifest.json',
    html: './app/*.html',
    js: './app/**/*.js',
    concatJsDest: './wwwroot/js/site.js',
    images: './app/assets/img/**/*.{tif,tiff,gif,jpeg,jpg,png,svg}',
    fonts: './app/assets/fonts/**/*.{ttf,woff,woff2,eot,svg}'
};

var dest = {
    css: './wwwroot/css',
    images: './wwwroot/images',
    fonts: './wwwroot/fonts'
};

var isProduction = process.env.NODE_ENV === 'production';

function minifyIfNeeded() {
    return isProduction ? uglify() : gutil.noop();
}

function stripDebugIfNeeded() {
    return isProduction ? stripDebug() : gutil.noop();
}

function loadSourcemapsIfNeeded() {
    return isProduction ? sourcemaps.init({
        loadMaps: true
    }) : gutil.noop();
}

function writeSourcemapsIfNeeded() {
    return isProduction ? sourcemaps.write('.') : gutil.noop();
}

function revisionIfNeeded() {
    return isProduction ? rev() : gutil.noop();
}

function manifestIfNeeded() {
    return isProduction ? rev.manifest() : gutil.noop();
}

// Sub tasks

// Clean subtask
gulp.task('clean:js', function() {
    return del(paths.concatJsDest);
});

gulp.task('clean:css', function() {
    return del(dest.css);
});

gulp.task('clean', ['clean:js', 'clean:css']);

// Resources subtask
gulp.task('images', function() {
    return gulp.src(paths.images)
        .pipe(flatten())
        .pipe(gulp.dest(dest.images));
});

gulp.task('fonts', function() {
    return gulp.src(paths.fonts)
        .pipe(flatten())
        .pipe(gulp.dest(dest.fonts));
});

gulp.task('copy-resources', ['fonts', 'images']);

// Sass subtask
gulp.task('sass', function() {
    return gulp.src(paths.sass)
        .pipe(loadSourcemapsIfNeeded())
        .pipe(sass({
            outputStyle: 'expanded'
        })
        .on('error', sass.logError))
        .pipe(autoprefixer({
            browsers: [
                'last 2 Chrome versions',
                'last 2 Safari versions',
                'last 2 Firefox versions',
                'iOS 8',
                'ie > 9'
            ],
            cascade: false
        }))
        .pipe(isProduction ? cssnano({
            minifyFontValues: false,
            discardUnused: false
        }) : gutil.noop())
        .pipe(writeSourcemapsIfNeeded())
        .pipe(gulp.dest(paths.destSass));
});

// Bundling subtasks
gulp.task('bundlecss', ['sass'], function() {
    return gulp.src(paths.css)
        .pipe(concat(paths.concatCssDest))
        .pipe(revisionIfNeeded())
        .pipe(gulp.dest('.'))
        .pipe(manifestIfNeeded())
        .pipe(isProduction ? gulp.dest(dest.css) : gutil.noop());
});

gulp.task('bundlejs', function() {
    return gulp.src(paths.js)
        .pipe(concat(paths.concatJsDest))
        .pipe(minifyIfNeeded())
        .pipe(stripDebugIfNeeded())
        .pipe(gulp.dest('.'));
});

// Revisioning subtask
gulp.task('revreplace', ['bundlecss'], function() {
    var manifest = gulp.src(paths.cssManifest);

    return isProduction ? gulp.src('./index.html')
        .pipe(revReplace({
            manifest: manifest
        }))
        .pipe(gulp.dest('.')) : gutil.noop();
});

// BrowserSync subtask
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: './',
            middleware: [historyApiFallback()]
        }
    });
});

// Main tasks
gulp.task('watch', ['browserSync', 'sass', 'bundlecss', 'revreplace', 'bundlejs'], function() {
    gulp.watch(paths.sass, ['sass', 'bundlecss', browserSync.reload]);
    gulp.watch(paths.html, browserSync.reload);
    gulp.watch(paths.js, ['bundlejs', browserSync.reload]);
});

gulp.task('default', gulpSequence('clean', 'copy-resources', 'sass', 'bundlecss', 'revreplace', 'bundlejs'));

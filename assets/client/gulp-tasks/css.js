( function() {
	'use strict';

    var INPRODUCTION = (process.env.ENV === 'production' ? true : false);

    module.exports = {
        sass: sass,
        bundlecss: bundlecss
    };

    var paths = {
        sass: "./app/**/*.scss",
        cssDest: "./www/css"
    };

    function sass(gulp, plugins) {
        return function () {
            return gulp.src(paths.sass)
            .pipe(plugins.sourcemaps.init())
            .pipe(plugins.if(INPRODUCTION, plugins.sass({ outputStyle: 'compressed' }), plugins.sass()))
            .pipe(plugins.postcss([ plugins.autoprefixer({ browsers: ['Chrome >= 45', 'FF >= 41', 'IE >= 11', 'last 1 version'] }) ]))
            .pipe(plugins.if(INPRODUCTION, plugins.sourcemaps.write('../../www/maps', {
                sourceMappingURL: function (file) {
                    var path = '../maps/' + file.relative + '.map';
                    console.log('SAVING TO ', path, 'File: ', file);
                    return path;
                }
            }), plugins.sourcemaps.write('../maps')))
            .pipe(gulp.dest('./app/assets/css'));
        };
    }

    function bundlecss(gulp, plugins) {
        return gulp.src('./app/assets/css')
            .pipe(concat('./wwwroot/css/site.css'))
            .pipe(plugins.if(INPRODUCTION, plugins.cssnano()))
            .pipe(gulp.dest("."));
    }

})();

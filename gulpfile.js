'use strict';

const $           = require('gulp-load-plugins')();
const gulp        = require('gulp');
const browserSync = require('browser-sync').create();

let debug = true;
let proxy = 'html-starter.dev';
let staticSrc = 'src/**/*.{webm,svg,eot,ttf,woff,woff2,otf,mp4,json,pdf,ico}';

/*  
 * Clean
 */
gulp.task('clean', () => {
	
	return gulp.src('dist', {read: false})
		.pipe($.clean());
});

/*  
 * Copy static files
 */
gulp.task('copy', () => {
	
	return gulp.src(staticSrc)
	.pipe(gulp.dest('dist/'))
})

/*  
 * SASS
 */
gulp.task("sass", () => {

	// Create Sourmaps for develop
	if (debug) {
			
		gulp.src('src/scss/style.scss')
			.pipe($.sourcemaps.init())
			.pipe($.sass({ style: 'compressed', sourcemap: true}))
			.on('error', $.sass.logError)
			.on('error', (err) => {
				$.notify().write(err);
			})
			.pipe( $.autoprefixer({
				browsers: ['last 2 versions','ie >= 9'],
				cascade: false
			}))
			.pipe($.rename('site.min.css'))
			.pipe($.sourcemaps.write('./'))
			.pipe(gulp.dest('./dist/css'))
			.pipe(browserSync.stream({match: '**/*.css'}));
	}

	// Remove sourcemaps and minify for production
	else {
		
		gulp.src('src/scss/style.scss')
			.pipe($.sass({ style: 'compressed', sourcemap: true}))
			.on('error', $.sass.logError)
			.on('error', (err) => {
				$.notify().write(err);
			})
			.pipe( $.autoprefixer({
				browsers: ['last 2 versions','ie >= 9'],
				cascade: false
			}))
			.pipe($.rename('site.min.css'))
			.pipe(cleanCSS())
			.pipe(gulp.dest('./dist/css'))
	}

});

/*  
 * Javascript
 */
gulp.task('js', () => {
	
	// Development 
	if (debug) {
		return gulp.src('src/js/site.js')
			.pipe($.sourcemaps.init())
			.pipe($.browserify({
				insertGlobals : true,
				debug : debug
			}))
			.on('error', (err) => {
				$.notify().write(err);
			})
			.pipe($.babel({
				presets: ['es2015']
			}))
			.pipe($.sourcemaps.write('./'))
			.pipe(gulp.dest('dist/js'))
	}
	// Production 
	else {
		return gulp.src('src/js/site.js')
			.pipe($.browserify({
				insertGlobals : true,
				debug : debug
			}))
			.on('error', (err) => {
				$.notify().write(err);
			})
			.pipe($.babel({
				presets: ['es2015']
			}))
			.pipe(gulp.dest('dist/js'))
	}

});


/*  
 * Javascript watch
 */
gulp.task('js-watch', ['js'], (done) => {
	
	browserSync.reload();
	done();
});

/*  
 * Image optimisation
 */
gulp.task('images', () => {
  
	return gulp.src(['./src/img/**/*.jpg', './src/img/**/*.png', './src/img/**/*.jpeg'])
		.pipe($.image())
		.pipe(gulp.dest('./dist/img/'));
});

/*  
 * Serve and watch for changes
 */
gulp.task( "dev", ['copy', 'sass', 'js'], () => {

	// Serve
	browserSync.init({
		proxy: proxy,
		ghostMode: false
	});

	// Watch
	// gulp.watch('src/img/**/*', ['images']);
	gulp.watch('src/scss/**/*.scss', ['sass']);
	gulp.watch('src/js/**/*.js', ['js-watch']);
	gulp.watch(['./**/*.html']).on('change', browserSync.reload);
	gulp.watch(staticSrc, ['copy']);

	gulp.watch([
		'dist/**/*.js',
		'dist/**/*.css'
	]);
});

/*  
 * Set debug mode to false
 */
gulp.task('production', () => {

	debug = false;
	console.log(`Set debug to: ${debug}`);
})

// gulp.task('build', ['production', 'images', 'copy', 'sass', 'js']);
gulp.task('build', ['production', 'copy', 'sass', 'js']);
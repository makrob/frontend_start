// Подключение зависимостей
var
    gulp          = require('gulp'),
    sass          = require('gulp-sass'),
    browserSync   = require('browser-sync'),
    concat        = require('gulp-concat'),
    uglify        = require('gulp-uglifyjs'),
    cssNano       = require('gulp-cssnano'),
    rename        = require('gulp-rename'),
    cssConcat     = require('gulp-concat-css'),
    del           = require('del'),
    imagemin      = require('gulp-imagemin'),
    pngquant      = require('imagemin-pngquant'),
    cache         = require('gulp-cache'),
    autoprefixer  = require('gulp-autoprefixer');

// Получение настроек проекта из projectConfig.json
var projectConfig = require('./projectConfig.json'),
    dirs = projectConfig.dirs,
    libs = projectConfig.libs;

// Задачи
// -- сборка стилей
gulp.task('sass', function() {
  return gulp.src(dirs.srcPathSass + '/style.sass') // работаем с диспетчером подключений
    .pipe(plumber())
    .pipe(sass())
    .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(gulp.dest(dirs.srcPathCss))
    .pipe(browserSync.reload({stream: true}));
});

// -- сборка скриптов
gulp.task('scripts', function() {
  return gulp.src([
      dirs.srcPathBlocks + '/**/*.js',
      dirs.srcPathJs + '/main.js',
    ])
    .pipe(plumber())
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest(dirs.srcPathJs))
    .pipe(browserSync.reload({stream: true}));
});

// -- синхронизация
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    },
    notify: false
  });
});

// -- сборка скриптов библиотек
gulp.task('scripts-libs', function() {
  return gulp.src(libs.jsPath)
    .pipe(concat('libs.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dirs.srcPathJs));
});

// -- сборка стилей библиотек
gulp.task('css-libs', function() {
  return gulp.src(libs.cssPath)
    .pipe(cssConcat('libs.min.css'))
    .pipe(cssNano())
    .pipe(gulp.dest(dirs.srcPathCss));
});

// -- обновление файлов
gulp.task('watch', ['browser-sync', 'sass', 'scripts', 'css-libs', 'scripts-libs'], function() {
  gulp.watch(dirs.srcPath + '/**/*.sass', ['sass']);
  gulp.watch(dirs.srcPath + '/**/*.js', ['scripts']);
  gulp.watch(dirs.srcPath + '/**/*.html', browserSync.reload);
});

// -- очистка папки сборки
gulp.task('clean', function() {
  return del.sync(dirs.buildPath);
});

// -- оптимизация картинок
gulp.task('img', function() {
  return gulp.src(dirs.srcPath + '/img/**/*')
    .pipe(cache(imagemin({
      interlaced: true,
      progressive: true,
      svgPlugins: [{removeViewBox: false}],
      use: [pngquant()]
    })))
    .pipe(gulp.dest(dirs.buildPathImg));
});

// -- окончательная сборка проекта
gulp.task('build', ['clean', 'img', 'sass', 'scripts', 'css-libs', 'scripts-libs'], function() {
    gulp.src(dirs.srcPathCss + '/**/*').pipe(gulp.dest(dirs.buildPathCss));
    gulp.src(dirs.srcPathJs + '/**/*').pipe(gulp.dest(dirs.buildPathJs));
    gulp.src(dirs.srcPathFonts + '/**/*').pipe(gulp.dest(dirs.buildPathFonts));
    gulp.src('app/*.html').pipe(gulp.dest(dirs.buildPath));
});

// -- очистка кэша
gulp.task('clear-cache', function () {
    return cache.clearAll();
});

// -- запуск задачи обновления файлов по дефолту
gulp.task('default', ['watch']);
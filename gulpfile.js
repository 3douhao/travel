const rev = require('gulp-rev')
const cssnano = require('gulp-cssnano')
const uglify = require('gulp-uglify')
const wpconfig = require('./webpack.config.js')
const usemin = require('gulp-usemin')
const modernizr = require('gulp-modernizr')
const svg2png = require('gulp-svg2png')
const { src, dest, watch, series } = require('gulp')
const webpack = require('webpack')
const postcss = require('gulp-postcss')
const autoprefixer = require('gulp-autoprefixer')
const cssImport = require('postcss-import')
const mixins = require('postcss-mixins')
const nested = require('postcss-nested')
const cssvars = require('postcss-simple-vars')
const hexrgba = require('postcss-hexrgba')
const browserSync = require('browser-sync').create()
const svgSprite = require('gulp-svg-sprite')
const rename = require('gulp-rename')
const imagemin = require('gulp-imagemin')
const del = require('del')
const config = {
  shape: {
    spacing: {
      padding: 1
    }
  },
  mode: {
    css: {
      variables: {
        replaceSvgWithPng: function () {
          return function (sprite, render) {
            return render(sprite).split('.svg').join('.png')
          }
        }
      },
      sprite: 'sprite.svg',
      render: {
        css: {
          template: './gulp/templates/sprite.css'
        }
      }

    }
  }
}
const styles = function (done) {
  return src('./app/assets/styles/styles.css').pipe(postcss([cssImport, mixins, cssvars, nested, hexrgba, autoprefixer])).pipe(dest('./app/temp/styles'))
  done()
}
const bs = function (done) {
  browserSync.init({
    notify: false,
    server: {
      baseDir: 'app'
    }
  })
  done()
}
const reviewDist = function (done) {
  browserSync.init({
    notify: false,
    server: {
      baseDir: 'docs'
    }
  })
  done()
}
const cssInject = function (done) {
  return src('./app/temp/styles/styles.css')
    .on('error', function (errorInfo) {
      console.log(errorInfo.toString())
      this.emit('end')
    })
    .pipe(browserSync.stream())
  done()
}

const wp = function (done) {
  webpack(wpconfig, function (err, stats) {
    if (err) {
      console.log(err.toString())
    }
    console.log(stats.toString())
    done()
  })
}

const wpRefresh = function (done) {
  browserSync.reload()
  done()
}

watch('./app/index.html', function (done) {
  browserSync.reload()
  done()
})
watch('./app/assets/styles/**/*.css', series(styles, cssInject))

watch('./app/assets/scripts/**/*.js', series(wp, wpRefresh))

const svgCreate = function (done) {
  return src('./app/assets/images/icons/**/*.svg')
    .pipe(svgSprite(config))
    .pipe(dest('./app/temp/sprite/'))
}

const copySpriteCss = function (done) {
  return src('./app/temp/sprite/css/*.css')
    .pipe(rename('_sprite.css'))
    .pipe(dest('./app/assets/styles/modules/'))
}
const copySpriteImage = function (done) {
  return src('./app/temp/sprite/css/**/*.{svg,png}')
    .pipe(dest('./app/assets/images/sprites'))
}

const clean = function (done) {
  return del('./app/temp/sprite', './app/assets/images/sprites')
}
const createPngCopy = function (done) {
  return src('./app/temp/sprite/css/*.svg')
    .pipe(svg2png())
    .pipe(dest('./app/temp/sprite/css'))
  done()
}
const modern = function (done) {
  return src(['./app/assets/styles/**/*.css', './app/assets/scripts/**/*.js'])
    .pipe(modernizr({
      options: [
        'setClasses'
      ]
    })).pipe(dest('./app/temp/scripts'))
  done()
}
const imageOptimize = function (done) {
  return src(['./app/assets/images/**/*', '!./app/assets/images/icons', '!./app/assets/images/icons/**/*'])
    .pipe(imagemin({
      progressive: true,
      interlaced: true,
      multipass: true
    }))
    .pipe(dest('./docs/assets/images'))
  done()
}
const delDistFolder = function (done) {
  del('./docs')
  done()
}
const minify = function (done) {
  return src('./app/index.html')
    .pipe(usemin({
      css: [function () { return rev() }, function () { return cssnano() }],
      js: [function () { return rev() }, function () { return uglify() }]
    }))
    .pipe(dest('./docs'))
  done()
}
exports.mini = minify
exports.build = series(deldocsFolder, svgCreate, copySpriteCss, copySpriteImage, imageOptimize, styles, wp, minify)
exports.imagemin = imageOptimize
exports.modern = modern
exports.createPng = createPngCopy
exports.png = series(svgCreate, createPngCopy, copySpriteImage)

exports.icons = series(svgCreate, copySpriteCss, copySpriteImage)

exports.bs = series(clean, svgCreate, copySpriteCss, copySpriteImage, bs, wp, modern)
exports.svg = svgCreate
exports.cp = copySpriteCss
exports.wp = wp
exports.docs = reviewdocs

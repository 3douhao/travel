// require('./gulp/tasks/styles')
// require('./gulp/tasks/watch')
// const path = require('path')
const wpconfig = require('./webpack.config.js')
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
const del = require('del')
const config = {
  mode: {
    css: {
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
  return src('./app/temp/sprite/css/**/*.svg')
    .pipe(dest('./app/assets/images/sprites'))
}

const clean = function (done) {
  return del('./app/temp/sprite', './app/assets/images/sprites')
}

exports.icons = series(svgCreate, copySpriteCss, copySpriteImage)

exports.bs = series(clean, svgCreate, copySpriteCss, copySpriteImage, bs, wp)
exports.svg = svgCreate
exports.cp = copySpriteCss
exports.wp = wp

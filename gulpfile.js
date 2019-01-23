// require('./gulp/tasks/styles')
// require('./gulp/tasks/watch')

const { src, dest, watch, series } = require('gulp')
const postcss = require('gulp-postcss')
const autoprefixer = require('gulp-autoprefixer')
const cssImport = require('postcss-import')
const mixins = require('postcss-mixins')
const nested = require('postcss-nested')
const cssvars = require('postcss-simple-vars')
const browserSync = require('browser-sync').create()
const styles = function (done) {
  return src('./app/assets/styles/styles.css').pipe(postcss([cssImport, mixins, cssvars, nested, autoprefixer])).pipe(dest('./app/temp/styles'))
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

watch('./app/index.html', function (done) {
  browserSync.reload()
  done()
})
watch('./app/assets/styles/**/*.css', series(styles, cssInject))
exports.bs = bs

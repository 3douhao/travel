import $ from 'jquery'
import waypoints from '../../../../node_modules/waypoints/lib/noframework.waypoints'
class RevealOnScroll {
  constructor (els, offset) {
    this.itemToReveal = els
    this.hideInitially()
    this.offsetPersentage = offset
    this.createWaypoints()
  }
  hideInitially () {
    this.itemToReveal.addClass('reveal-item')
  }
  createWaypoints () {
    let that = this
    this.itemToReveal.each(function () {
      let currentItem = this
      new Waypoint({
        element: currentItem,
        handler: function () {
          $(currentItem).addClass('reveal-item--is-visible')
        },
        offset: that.offsetPersentage
      })
    })
  }
}

export default RevealOnScroll

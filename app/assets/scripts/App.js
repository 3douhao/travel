import MobileMenu from './modules/MobileMenu'
import RevealOnScroll from './modules/RevealOnScroll'
import $ from 'jquery'
import StickyHeader from './modules/StickyHeader'

let mobileMenu = new MobileMenu()
new RevealOnScroll($('.feature-item'), '85%')
new RevealOnScroll($('.testimonials'), '60%')
let stickyHeader = new StickyHeader()

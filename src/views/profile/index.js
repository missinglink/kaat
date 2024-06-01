import process from 'socket:process'

import { SpringView } from '../../lib/components.js'

export async function viewProfile ({ isMobile }) {
  const vProfilePositionTop = isMobile ? 90 : 48
  const vProfileTransformOrigin = isMobile ? 100 : 80
  const vProfileTransformMag = isMobile ? 0.5 : 0.08

  const elMain = document.getElementById('main')

  new SpringView(document.getElementById('profile'), {
    axis: 'Y',
    relative: true,
    position: function (pos) {
      const progress = pos / window.innerHeight
      const topProgress = vProfilePositionTop / window.innerHeight

      // Opacity calculation adjusted to be 1 at vProfilePositionTop
      const opacity = Math.max(0, 1 - (2.5 * (progress - topProgress)))
      this.el.style.opacity = Math.min(1, Math.max(0, opacity))

      const scale = 0.9 + (0.1 * progress ** vProfileTransformMag)
      elMain.style.transform = `scale(${Math.min(scale, 1)})`
      elMain.style.transformOriginY = `${vProfileTransformOrigin}%`
    },
    during: function (event) {
      if (this.dy < 40) return // Ignore upward movements for pull-to-dismiss functionality

      const newPosition = Math.min(this.clientHeight, Math.max(vProfilePositionTop, this.dy))
      this.updatePosition('Y', newPosition)
    },
    end: function (event) {
      // Determine the final action based on the dragged distance
      const finalPosition = this.currentY
      const divHeight = this.clientHeight
      const threshold = divHeight / 2 // Example: 50% of the element's height

      if (Math.abs(finalPosition) < threshold) {
        // If not dragged past the threshold, start the spring animation to snap back
        this.start(vProfilePositionTop)  // Snap back to the original position
      } else {
        // If dragged past the threshold, start the spring animation to dismiss or finalize the action
        this.start(window.innerHeight) // Or any other final position based on your use case
      }
    }
  })

  //
  // Buttons to open and close the profile view
  //
  const buttonOpen = document.getElementById('profile-open')
  const buttonClose = document.getElementById('profile-close')

  buttonOpen.addEventListener('click', () => this.start(vProfilePositionTop))
  buttonClose.addEventListener('click', () => this.start(window.innerHeight))
}

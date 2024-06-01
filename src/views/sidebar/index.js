import process from 'socket:process'

export async function viewSidebar () {
  const coMessages = document.getElementById('messages')
  const elSidebarToggle = document.getElementById('sidebar-toggle')

  // sidebar toggle is fixed position, so give it its own listener
  elSidebarToggle.addEventListener('click', e => {
    if (elSidebarToggle.getAttribute('open') === 'true') {
      coMessages.updateTransform()
      coMessages.start(0)
      elSidebarToggle.setAttribute('open', 'false')
    } else {
      coMessages.start(280)
      elSidebarToggle.setAttribute('open', 'true')
    }
  })
}
 

import process from 'socket:process'

import Indexed from '@socketsupply/indexed'

import { Register } from '../../lib/component.js'
import { Switch } from '../../components/switch.js'
import { Group } from '../../components/group.js'

async function Channels (props) {
  const {
    net,
    db
  } = props

  const { data: dataChannels } = await db.channels.readAll()
  const { data: dataPeer } = await db.state.get('peer')

  const rows = [...dataChannels.values()]
  //
  // When a channel is clicked, activate or manage it.
  //
  const onclick = async (event, match) => {
    const el = match('[data-event]')
    if (!el) return

    switch (el.dataset.event) {
      case 'manage-channel': {
        const channel = rows.find(ch => ch.channelId === el.dataset.value)
        if (!channel) return

        const elModal = document.getElementById('manage-channel')

        elModal.value = channel

        const res = await elModal.open()

        if (res === 'delete') {
          await Indexed.drop(channel.channelId)
          await db.channels.del(channel.channelId)

          if (net.subclusters[channel.channelId]) {
            delete net.subclusters[channel.channelId]
          }

          const { data: dataPeer } = await db.state.get('peer')

          if (rows.length === 1) {
            // TODO(@heapwolf): show a toaster error
            console.log('Its the last channel')
            return
          }

          const newChannel = rows.find(ch => ch.channelId !== channel.channelId)

          dataPeer.channelId = newChannel.channelId
          dataPeer.subclusterId = newChannel.subclusterId
          
          await db.state.put('peer', dataPeer)

          this.render()
        }

        break
      }

      case 'activate-channel': {
        // Find the new channel, make sure its valid
        const channel = rows.find(ch => ch.channelId === el.dataset.value)
        if (!channel) return

        const { data: dataPeer } = await db.state.get('peer')
        dataPeer.channelId = channel.channelId
        dataPeer.subclusterId = channel.subclusterId
        await db.state.put('peer', dataPeer)

        // Remove the active state from any other item in the list
        ;[...this.querySelectorAll('.channel')].forEach(el => {
          el.removeAttribute('data-active')
        })

        // Add the active state to the new item
        el.setAttribute('data-active', 'true')

        // Change the messages buffer area to show the new label
        const elMessagesHeader = document.querySelector('#messages header .title')
        if (elMessagesHeader) elMessagesHeader.textContent = `#${channel.label}`

        // get the current node
        const attachedNode = document.querySelector('virtual-messages')

        if (attachedNode) {
          // retain the node
          if (!this.state[attachedNode.dataset.id]) {
            this.state[attachedNode.dataset.id] = attachedNode
          }
        }

        // get the detatched node and reattach it
        const detatchedNode = this.state[dataPeer.channelId]

        if (attachedNode && detatchedNode) {
          // swap the detatched node with the currently attached one
          attachedNode.parentElement.replaceChild(detatchedNode, attachedNode)
        } else {
          // there is no node to swap, so create a new one by calling render.
          // this will set up all the events and everything for the new channel.
          const messagesRoot = document.querySelector('#messages')
          messagesRoot.render()
        }
      }
    }
  }

  const ontouchend = (e, m) => {
    onclick(e, m)
    e.preventDefault()
  }

  const channels = [...dataChannels.values()]

  return div({ onclick, ontouchend }, channels.map(channel => {
    return div(
      {
        class: 'channel',
        data: {
          event: 'activate-channel',
          value: channel.channelId,
          active: channel.channelId === dataPeer?.channelId
        }
      },
      span({ class: 'label' },
        span('#', { class: 'channel-symbol' }), channel.label
      ),
      button(
        { data: { event: 'manage-channel', value: channel.channelId } },
        svg({ class: 'app-icon' },
          use({ 'xlink:href': '#config-icon' })
        )
      )
    )
  }))
}

Channels = Register(Channels)

async function Sidebar (props) {
  const {
    isMobile,
    net,
    db
  } = props

  return [
    header({ class: 'primary draggable', onclick },
      div({ class: 'content' },
        button({ id: 'create-channel-open', data: { event: 'create-channel-open' } },
          svg({ class: 'app-icon' },
            use({ 'xlink:href': '#plus-icon' })
          )
        ),
        button({ id: 'profile-open', data: { event: 'profile-open' } },
          svg({ class: 'app-icon' },
            use({ 'xlink:href': '#profile-icon' })
          )
        )
      )
    ),
    div({ class: 'content' },
      await Channels({ id: 'channels', db, net })
    )
  ]
}

Sidebar = Register(Sidebar)
export { Sidebar }

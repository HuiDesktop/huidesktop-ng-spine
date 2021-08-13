/**
 * 绑定事件
 * 事件 --> 动画变换
 */

import { saveIdleState } from './userSettings'
import { ExtraState, idleStateCount, motions, MouseKeyFunction } from './definitions'
import { InteractionEvent } from 'pixi.js'
import HuiApplication from '../huiApplication'
import { dispatchEvent } from '../events'

export function bindEventCallback ({ hui, container, character, userSettings, extraState, name, pluginEvents }: HuiApplication<MouseKeyFunction, ExtraState>): void {
  const chuo = (): void => {
    if (container.current !== motions.idle) { return }
    container.enter(motions.chuo)
  }

  const switchStatus = (): void => {
    extraState.status = (extraState.status + 1) % idleStateCount
    saveIdleState(name, extraState.status)
    if (container.current === motions.idle) container.enter(motions.idle)
  }

  const walk = (): void => {
    if (container.current === motions.walk) { container.enter(motions.idle); return }
    if (container.current !== motions.idle) { return }
    container.enter(motions.walk)
  }

  const makeClickFunc = (func: MouseKeyFunction): (() => void) => {
    switch (func) {
      case MouseKeyFunction.touch: return chuo
      case MouseKeyFunction.switchStatus: return switchStatus
      case MouseKeyFunction.walk: return walk
      default: return (): void => { }
    }
  }

  const endpoint = (t: () => void): (() => boolean) => () => {
    t()
    return true
  }

  pluginEvents.leftClick.push(endpoint(makeClickFunc(userSettings.left)))
  pluginEvents.rightClick.push(endpoint(makeClickFunc(userSettings.right)))
  pluginEvents.leftDragDown.push(endpoint(() => container.enter(motions.drag)))
  pluginEvents.leftDragUp.push(endpoint(() => container.enter(motions.drop)))
  pluginEvents.rightDragDown.push(endpoint(() => container.enter(motions.drag)))
  pluginEvents.rightDragUp.push(endpoint(() => container.enter(motions.drop)))

  const leftClick = (): boolean => dispatchEvent(pluginEvents.leftClick, x => x())
  const rightClick = (): boolean => dispatchEvent(pluginEvents.rightClick, x => x())

  character.raw.addListener('click', (ev: InteractionEvent) => {
    if (ev.data.button === 0) {
      leftClick()
    }
  })
  hui.dragMoveEvent.addEventListener('leftclick', () => leftClick())
  hui.dragMoveEvent.addEventListener('leftdown', () => dispatchEvent(pluginEvents.leftDragDown, x => x()))
  hui.dragMoveEvent.addEventListener('leftup', () => dispatchEvent(pluginEvents.leftDragUp, x => x()))
  hui.setLeftDrag(userSettings.leftDrag).catch(e => console.error(e))

  character.raw.addListener('rightclick', rightClick)
  hui.dragMoveEvent.addEventListener('rightclick', () => rightClick())
  hui.dragMoveEvent.addEventListener('rightdown', () => dispatchEvent(pluginEvents.rightDragDown, x => x()))
  hui.dragMoveEvent.addEventListener('rightup', () => dispatchEvent(pluginEvents.rightDragUp, x => x()))
  hui.setRightDrag(userSettings.rightDrag).catch(e => console.error(e))
}

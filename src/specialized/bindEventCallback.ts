/**
 * 绑定事件
 * 事件 --> 动画变换
 */

import HuiDesktopIpcBridge from '../huiDesktopIpcBridge'
import { ManageSpine } from '../pixiHelper'
import ProcessManagementContainer from '../processManagementContainer'
import { UserSettings } from './userSettings'
import { ExtraState, motions, MouseKeyFunction } from './definitions'

export function bindEventCallback (hui: HuiDesktopIpcBridge, container: ProcessManagementContainer, character: ManageSpine, userSettings: UserSettings, extraState: ExtraState): void {
  const chuo = (): void => {
    if (container.current !== motions.idle) { return }
    container.enter(motions.chuo)
  }

  const switchDance = (): void => {
    if (container.current !== motions.idle) { return }
    extraState.dancing = !extraState.dancing
    container.enter(motions.idle)
  }

  const walk = (): void => {
    if (container.current === motions.walk) { container.enter(motions.idle); return }
    if (container.current !== motions.idle) { return }
    container.enter(motions.walk)
  }

  const makeClickFunc = (func: MouseKeyFunction): (() => void) => {
    switch (func) {
      case MouseKeyFunction.touch: return chuo
      case MouseKeyFunction.switchDance: return switchDance
      case MouseKeyFunction.walk: return walk
      default: return (): void => { }
    }
  }

  const leftClick = makeClickFunc(userSettings.left)
  const rightClick = makeClickFunc(userSettings.right)

  character.on('mousedown', leftClick)
  character.on('rightdown', rightClick)

  character.raw.addListener('leftclick', leftClick)
  hui.dragMoveEvent.addEventListener('leftclick', () => leftClick())
  hui.dragMoveEvent.addEventListener('leftdown', () => container.enter(motions.drag))
  hui.dragMoveEvent.addEventListener('leftup', () => container.enter(motions.drop))
  hui.setLeftDrag(userSettings.leftDrag).catch(e => console.error(e))

  character.raw.addListener('rightclick', leftClick)
  hui.dragMoveEvent.addEventListener('rightclick', () => rightClick())
  hui.dragMoveEvent.addEventListener('rightdown', () => container.enter(motions.drag))
  hui.dragMoveEvent.addEventListener('rightup', () => container.enter(motions.drop))
  hui.setRightDrag(userSettings.rightDrag).catch(e => console.error(e))
}

/**
 * 定义变换
 * 变换 --> 具体操作
 */

import { userSettingManager } from './userSettings'
import { ExtraState, getAnimationNameByIdleState, motions, MouseKeyFunction } from './definitions'
import { Tween } from '@tweenjs/tween.js'
import { getGround, getWalkSuggestions } from '../helpers'
import HuiDesktopIpcBridge, { PosListener } from '../huiDesktopIpcBridge'
import HuiApplication from '../huiApplication'
import { dispatchEvent } from '../events'

export const newTweenToGround = (hui: HuiDesktopIpcBridge, target: number): Tween<any> => {
  return new Tween(hui.posListener).to({ y: target }, 0.666 * Math.abs(target - hui.pos.y))
}

export const newTweenUp = (hui: HuiDesktopIpcBridge): Tween<PosListener> => {
  return new Tween(hui.posListener).to({ y: hui.pos.y - 100 }, 100)
}

export default async function processProcessManagementContainer ({ hui, container, character, userSettings, modelConfig, extraState, savePos, pluginEvents }: HuiApplication<MouseKeyFunction, ExtraState>): Promise<void> {
  pluginEvents.animationCompleted.push(name => {
    if (name !== 'Interact') return false
    container.enter(motions.idle)
    return true
  })

  container.addEntry(motions.idle, () => character.loop(getAnimationNameByIdleState(extraState.status)))
  container.addEntry(motions.chuo, () => character.once('Interact'))
  container.addEntry(motions.drag, () => character.loop('Relax'))

  container.addEntry(motions.jump, setLeave => {
    if (userSettings.free) { container.enter(motions.idle); return }

    let devAtom = true // DEV
    const finish = (): void => {
      if (!devAtom) console.error()
      devAtom = false
      container.enter(motions.drop)
      savePos()
    }
    const tween = newTweenUp(hui).onStop(finish).onComplete(finish).start()
    setLeave(() => tween.stop())
  })

  container.addEntry(motions.drop, setLeave => {
    if (userSettings.free) { savePos(); container.enter(motions.idle); return }
    if (container.current !== motions.drag && container.current !== motions.jump) { console.error('Unexpected current motion') }

    let devAtom = true // DEV
    const finish = (): void => {
      if (!devAtom) console.error()
      devAtom = false
      container.enter(motions.idle)
      savePos()
    }

    const tween = newTweenToGround(hui, getGround(hui, modelConfig, userSettings.scale)).onStop(finish).onComplete(finish).start()
    setLeave(() => tween.stop())
  })

  container.addEntry(motions.walk, leave => {
    const suggestion = getWalkSuggestions(hui, extraState.facingLeft, userSettings.scale, modelConfig.width)
    if (suggestion === null) { console.warn('Cannot walk'); return }
    if (suggestion.needFlip) { character.flip(); extraState.facingLeft = !extraState.facingLeft; userSettings.flip = true; userSettingManager.saveUserSettingsToLocalStorage(userSettings) }
    character.loop('Move')
    suggestion.tween.start().onComplete(() => { container.enter(motions.idle); savePos() })
    leave(() => { suggestion.tween.stop(); savePos() })
  })

  cefSharp.bindObjectAsync('_huiDesktopKeyboardSpacePlay').then(s => {
    pluginEvents.keyboard.push((t, _k) => {
      if (t === 0 && container.current === motions.idle) {
        container.enter(motions.jump)
        return true
      }
      return false
    })
    if (s.Success) {
      return _huiDesktopKeyboardSpacePlay.get((t, k) => dispatchEvent(pluginEvents.keyboard, h => h(t, k)))
    }
  }).catch(e => console.error(e))
}

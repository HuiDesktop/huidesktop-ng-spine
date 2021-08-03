import { ModelConfig } from './modelConfig'
import { Tween } from '@tweenjs/tween.js'
import HuiDesktopIpcBridge, { PosListener } from './huiDesktopIpcBridge'

export const getGround = (mc: ModelConfig, scale: number): number => huiDesktop.workingArea.height - ((mc.height - mc.y0) * scale)

export interface WalkSuggestion {
  needFlip: boolean
  tween: Tween<PosListener>
}

export const getWalkSuggestions = (hui: HuiDesktopIpcBridge, facingLeft: boolean, scale: number, noScaleWidth: number, noScaleLen = 200, looped = false): WalkSuggestion | null => {
  const current = hui.pos.x
  const maxlen = huiDesktop.workingArea.width
  const len = Math.floor(facingLeft ? current : (maxlen - current - scale * noScaleWidth))
  const maxRound = len / (noScaleLen * scale)
  if (maxRound < 1) {
    if (looped) return null
    const r = getWalkSuggestions(hui, !facingLeft, scale, noScaleWidth, noScaleLen, true)
    if (r === null) return null
    return { ...r, needFlip: true }
  }
  const round = Math.ceil(Math.random() * maxRound)
  const dest = current + ((facingLeft ? -1 : +1) * round * scale * noScaleLen)
  const duration = 1.5 * round * 1000
  const tween = new Tween(hui.posListener).to({ x: dest }, duration)
  return { needFlip: false, tween }
}

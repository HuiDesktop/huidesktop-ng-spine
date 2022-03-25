import HuiDesktopIpcBridge from './huiDesktopIpcBridge'
import { getGround } from './helpers'
import { ModelConfig } from './modelConfig'
import { UserSettingBase } from './userSettingBase'

const getRectSize = (modelSettings: ModelConfig, scale: number, mayFlip: boolean): { width: number, height: number } => {
  let rwidth = modelSettings.width
  if (mayFlip) rwidth = Math.max(modelSettings.x0, modelSettings.width - modelSettings.x0) * 2
  return { width: Math.ceil(rwidth * scale), height: Math.ceil(modelSettings.height * scale) }
}

const getWindowPosFromLocalStorage = (name: string): { x: number, y: number, success: boolean } => {
  const read = localStorage.getItem(name)
  if (read == null) return { x: 0, y: 0, success: false }
  return {
    ...JSON.parse(read),
    success: true
  }
}

const saveWindowPosToLocalStorage = (hui: HuiDesktopIpcBridge, name: string): void => {
  localStorage.setItem(name, JSON.stringify(/* huiDesktop.pos TODO */{ x: hui.pos.x, y: hui.pos.y }))
}

interface initializeWindowResult {
  size: { width: number, height: number }
  savePos: () => void
}

export const initializeWindow = (hui: HuiDesktopIpcBridge, modelConfig: ModelConfig, userSettings: UserSettingBase<number>, mayFlip: boolean): initializeWindowResult => {
  // 调整坐标
  const name = `cc.huix.blhx.${modelConfig.name}.pos`
  const { x, y, success } = getWindowPosFromLocalStorage(name)
  const ground = getGround(hui, modelConfig, userSettings.scale)
  if (success) { hui.pos.x = x; hui.pos.y = y } else { hui.pos.x = 0; hui.pos.y = ground }
  if (!userSettings.free) hui.posListener.y = ground

  // 调整大小
  const { width, height } = getRectSize(modelConfig, userSettings.scale, mayFlip)
  hui.setWindowSize(width + 1, height + 1).catch(e => console.error(e))

  return {
    size: { width, height },
    savePos: () => saveWindowPosToLocalStorage(hui, name)
  }
}

export const getOpeningWindowSizeStr = (width: number, height: number): string => {
  return `width=${width * devicePixelRatio}, height=${height * devicePixelRatio}`
}

export const resetWindowPos = (hui: HuiDesktopIpcBridge, modelConfig: ModelConfig, userSettings: UserSettingBase<number>): void => {
  const name = `cc.huix.blhx.${modelConfig.name}.pos`
  hui.pos.x = 0
  hui.pos.y = getGround(hui, modelConfig, userSettings.scale)
  saveWindowPosToLocalStorage(hui, name)
}

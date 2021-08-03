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

const saveWindowPosToLocalStorage = (_huiDesktop: HuiDesktopIpcBridge, name: string): void => {
  localStorage.setItem(name, JSON.stringify(/* huiDesktop.pos TODO */{ x: huiDesktop.window.left, y: huiDesktop.window.top }))
}

interface initializeWindowResult {
  size: { width: number, height: number }
  savePos: () => void
}

export const initializeWindow = (huiDesktop: HuiDesktopIpcBridge, modelConfig: ModelConfig, userSettings: UserSettingBase<number>, mayFlip: boolean): initializeWindowResult => {
  // 调整坐标
  const name = `cc.huix.blhx.${modelConfig.name}.pos`
  const { x, y, success } = getWindowPosFromLocalStorage(name)
  const ground = getGround(modelConfig, userSettings.scale)
  if (success) { huiDesktop.pos.x = x; huiDesktop.pos.y = y } else { huiDesktop.pos.x = 0; huiDesktop.pos.y = ground }
  if (!userSettings.free) huiDesktop.posListener.y = ground

  // 调整大小
  const { width, height } = getRectSize(modelConfig, userSettings.scale, mayFlip)
  huiDesktop.setWindowSize(width, height)

  return {
    size: { width, height },
    savePos: () => saveWindowPosToLocalStorage(huiDesktop, name)
  }
}

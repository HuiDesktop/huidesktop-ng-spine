/* eslint-disable accessor-pairs */
// API Version = 1
declare const _huiDesktopIpcBridge: {
  getScreenInfo: () => Promise<{
    avaliHeight: number
    avaliWidth: number
    avaliX: number
    avaliY: number
    height: number
    width: number
  }>
  getWindowPosition: () => Promise<{ X: number, Y: number }>
  getWindowSize: () => Promise<{ height: number, width: number }>
  registerDragMoveListener: (cb: (type: number, status: number) => void) => Promise<void>
  registerWindowPositionListener: (cb: (x: number, y: number) => void) => Promise<void>
  setBooleanAttribute: (name: string, value: boolean) => Promise<void>
  setWindowPosition: (x: number, y: number) => Promise<void>
  setWindowSize: (width: number, height: number) => Promise<void>
  registerSetting: (cb: () => void) => Promise<void>
}

declare const cefSharp: { bindObjectAsync: (name: string) => Promise<{ Message: string }> }

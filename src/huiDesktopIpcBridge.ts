export class PosListener {
  private readonly _parent: HuiDesktopIpcBridge

  public get x (): number { return this._parent.pos.x }
  public set x (value: number) {
    this._parent.pos.x = value
    if (this._parent.autoSync) this._parent.send()
  }

  public get y (): number { return this._parent.pos.y }
  public set y (value: number) {
    this._parent.pos.y = value
    if (this._parent.autoSync) this._parent.send()
  }

  constructor (parent: HuiDesktopIpcBridge) {
    this._parent = parent
  }
}

export default class HuiDesktopIpcBridge {
  private readonly _legacy = true
  public get legacy (): boolean { return this._legacy }

  private readonly _locked = false
  public get locked (): boolean { return this._locked }

  private readonly _pos = { x: 0, y: 0 }
  private readonly _posListener: PosListener
  public get pos (): {x: number, y: number} { return this._pos }

  public get posListener (): PosListener { return this._posListener }

  public autoSync = true

  public constructor () {
    if (this._legacy) { this._pos.x = huiDesktop.window.left; this._pos.y = huiDesktop.window.top }
    this._posListener = new PosListener(this)
  }

  private patchWindowMoved (): void {
    this._pos.x = huiDesktop.window.left
    this._pos.y = huiDesktop.window.top
  }

  public send (): void {
    if (this._locked) {
      console.warn('Try to send position to host during the period of the lock')
      return
    }
    if (this._legacy) {
      huiDesktop.window.left = this._pos.x
      huiDesktop.window.top = this._pos.y
      return
    }
    throw new Error('Not implemented')
  }

  public setWindowSize (width: number, height: number): void {
    huiDesktop.window.width = width
    huiDesktop.window.height = height
  }

  public setUserSettingsResponse (val: () => void): void {
    window.requestSettings = val
  }

  onLeftClick = (val: () => void): void => {
    window.huiDesktop_DragMove_OnMouseLeftClick = val
  }

  onRightClick = (val: () => void): void => {
    window.huiDesktop_DragMove_OnMouseRightClick = val
  }

  onLeftDown = (val: () => void): void => {
    window.huiDesktop_DragMove_OnMouseLeftDown = val
  }

  onRightDown = (val: () => void): void => {
    window.huiDesktop_DragMove_OnMouseRightDown = val
  }

  onLeftUp = (val: () => void): void => {
    window.huiDesktop_DragMove_OnMouseLeftUp = () => {
      this.patchWindowMoved()
      val()
    }
  }

  onRightUp = (val: () => void): void => {
    window.huiDesktop_DragMove_OnMouseRightUp = () => {
      this.patchWindowMoved()
      val()
    }
  }

  setTopMost = (val: boolean): void => {
    huiDesktop.topMost = val
  }

  hideTaskbarIcon = (val: boolean): void => {
    huiDesktop.showInTaskbar = !val
  }

  setClickTransparent = (val: boolean): void => {
    huiDesktop.clickTransparent = val
  }

  setLeftDrag = (val: boolean): void => {
    huiDesktop.dragMoveLeft = val
  }

  setRightDrag = (val: boolean): void => {
    huiDesktop.dragMoveRight = val
  }
}

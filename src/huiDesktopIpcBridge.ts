function receiveAlonePromise<T> (promise: Promise<T>): void {
  promise.catch(e => console.error(e))
}

export class PosListener {
  private readonly _parent: HuiDesktopIpcBridge

  public get x (): number { return this._parent.pos.x }
  public set x (value: number) {
    this._parent.pos.x = value
    if (this._parent.autoSync) receiveAlonePromise(this._parent.send())
  }

  public get y (): number { return this._parent.pos.y }
  public set y (value: number) {
    this._parent.pos.y = value
    if (this._parent.autoSync) receiveAlonePromise(this._parent.send())
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

  public readonly width: number
  public readonly height: number
  public readonly screenWidth: number
  public readonly screenHeight: number
  public readonly workingAreaWidth: number
  public readonly workingAreaHeight: number
  public readonly workingAreaX: number
  public readonly workingAreaY: number
  public readonly dragMoveEvent=new EventTarget()

  public constructor (posX: number, posY: number, width: number, height: number, screenWidth: number, screenHeight: number, workingAreaWidth: number, workingAreaHeight: number, workingAreaX: number, workingAreaY: number) {
    this._pos.x = posX
    this._pos.y = posY
    this.width = width
    this.height = height
    this.screenWidth = screenWidth
    this.screenHeight = screenHeight
    this.workingAreaWidth = workingAreaWidth
    this.workingAreaHeight = workingAreaHeight
    this.workingAreaX = workingAreaX
    this.workingAreaY = workingAreaY
    this._posListener = new PosListener(this)
  }

  private static instance: HuiDesktopIpcBridge

  public static async getInstance (): Promise<HuiDesktopIpcBridge> {
    if (HuiDesktopIpcBridge.instance !== undefined) return HuiDesktopIpcBridge.instance
    if ((await cefSharp.bindObjectAsync('_huiDesktopIpcBridge')).Message === 'Zero objects bounds') {
      alert('Failed to bind IPC')
    }
    const pos = await _huiDesktopIpcBridge.getWindowPosition()
    const size = await _huiDesktopIpcBridge.getWindowSize()
    const info = await _huiDesktopIpcBridge.getScreenInfo()
    HuiDesktopIpcBridge.instance = new HuiDesktopIpcBridge(pos.X, pos.Y, size.width, size.height, info.width, info.height, info.avaliWidth, info.avaliHeight, info.avaliX, info.avaliY)
    await _huiDesktopIpcBridge.registerWindowPositionListener((x, y) => {
      console.log(x, y)
      this.instance._pos.x = x; this.instance._pos.y = y
    })
    await _huiDesktopIpcBridge.registerDragMoveListener((type, status) => {
      this.instance.dragMoveEvent.dispatchEvent(new Event(['left', 'right'][type] + ['click', 'down', 'up'][status]))
    })
    return HuiDesktopIpcBridge.instance
  }

  public async send (): Promise<void> {
    await _huiDesktopIpcBridge.setWindowPosition(this.pos.x, this.pos.y)
  }

  public async setWindowSize (width: number, height: number): Promise<void> {
    await _huiDesktopIpcBridge.setWindowSize(width, height)
  }

  public async setUserSettingsResponse (val: () => void): Promise<void> {
    await _huiDesktopIpcBridge.registerSetting(val)
  }

  setTopMost = async (val: boolean): Promise<void> => {
    await _huiDesktopIpcBridge.setBooleanAttribute('TopMost', val)
  }

  hideTaskbarIcon = async (val: boolean): Promise<void> => {
    await _huiDesktopIpcBridge.setBooleanAttribute('ShowInTaskBar', !val)
  }

  setClickTransparent = async (val: boolean): Promise<void> => {
    await _huiDesktopIpcBridge.setBooleanAttribute('ClickTransparent', val)
  }

  setLeftDrag = async (val: boolean): Promise<void> => {
    await _huiDesktopIpcBridge.setBooleanAttribute('DragMoveLeft', val)
  }

  setRightDrag = async (val: boolean): Promise<void> => {
    await _huiDesktopIpcBridge.setBooleanAttribute('DragMoveRight', val)
  }
}

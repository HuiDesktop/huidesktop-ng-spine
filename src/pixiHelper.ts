import { spine } from 'pixi.js'
import premultipliedImageLoader from './premultipliedImageLoader'
import { premultiplied } from './specialized/definitions'

export class ManageSpine {
  public readonly raw: spine.Spine
  public onComplete = (_entry: spine.core.TrackEntry): void => { }

  constructor (raw: spine.Spine) {
    this.raw = raw
    this.raw.state.addListener({ complete: entry => this.onComplete(entry) })
  }

  public static async downloadFromSkelUrl (url: string): Promise<ManageSpine> {
    const loader = new PIXI.Loader()
    loader.add(url, url, premultiplied ? { metadata: { imageLoader: premultipliedImageLoader } } : undefined)
    const resources = await new Promise<Partial<Record<string, PIXI.LoaderResource>>>(resolve => loader.load((_, x) => resolve(x)))
    const characterResources = resources[url]
    if (characterResources === undefined) throw new Error('Cannot read resources')
    return new ManageSpine(new PIXI.spine.Spine(characterResources.spineData))
  }

  public loop (name: string): void {
    this.raw.state.setAnimation(0, name, true)
  }

  public once (name: string): void {
    this.raw.state.setAnimation(0, name, false)
  }

  public whenComplete (name: string, run: () => void, interrupt = true): void {
    const next = this.onComplete
    this.onComplete = entry => {
      if (entry.animation.name === name) {
        run()
        if (interrupt) return
      }
      next(entry)
    }
  }

  public get on (): (event: string, fn: Function, context?: any) => void {
    return this.raw.on.bind(this.raw)
  }

  public setScale (scale: number, flip = false): void {
    this.raw.skeleton.scaleX = scale * (flip ? -1 : 1)
    this.raw.skeleton.scaleY = scale
  }

  public flip (): void {
    this.raw.scale.x *= -1
  }
}

export class ManagedApplication {
  public readonly raw: PIXI.Application

  public constructor ({ width, height }: { width: number, height: number }) {
    this.raw = new PIXI.Application({ width, height, transparent: true, autoStart: false })
    document.body.appendChild(this.raw.view)
  }

  public get opacity (): string { return this.raw.view.style.opacity }
  public set opacity (val: string) { this.raw.view.style.opacity = val }

  public add (obj: PIXI.Container | ManageSpine): void {
    this.raw.stage.addChild(obj instanceof ManageSpine ? obj.raw : obj)
  }

  public start (): void { this.raw.start() }

  public render (): void { this.raw.renderer.render(this.raw.stage) }
}

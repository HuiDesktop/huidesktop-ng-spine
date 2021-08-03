// 自动调参

import 'pixi.js'
import 'pixi-spine'
import { ModelConfig } from './modelConfig'
import { animations, premultiplied } from './specialized/definitions'
import premultipliedImageLoader from './premultipliedImageLoader'

type LoaderReturnType = Partial<Record<string, PIXI.LoaderResource>>

async function loadCharacter (app: PIXI.Application, characterName: string, path: string): Promise<PIXI.spine.Spine> {
  const loader = app.loader.add(characterName, path, premultiplied ? { metadata: { imageLoader: premultipliedImageLoader } } : undefined)
  const resources = await new Promise<LoaderReturnType>(resolve => loader.load((_, x) => resolve(x)))
  const characterResources = resources[characterName]
  if (characterResources === undefined) throw new Error('Cannot load character data')
  return new PIXI.spine.Spine(characterResources.spineData)
}

export default async (modelName: string): Promise<ModelConfig> => {
  const app = new PIXI.Application({ width: 512, height: 512, transparent: true, autoStart: false })
  const spine = await loadCharacter(app, modelName, '/sandbox/' + modelName + '.skel')
  app.stage.addChild(spine)

  const dz = animations
  const fixed = { x: 0, y: 0, w: 0, h: 0, t: 0, d: 0 } // 可能需要自己在本子上画画

  const updateWithCurrentBound = (): void => {
    const bound = spine.getBounds()
    if (bound.x < 0) fixed.x = Math.ceil(fixed.x - bound.x)
    if (bound.y < 0) fixed.y = Math.ceil(fixed.y - bound.y)
    fixed.w = Math.max(fixed.w, Math.ceil(bound.width + bound.x))
    fixed.h = Math.max(fixed.h, Math.ceil(bound.height + bound.y))
    spine.x = fixed.x
    spine.y = fixed.y
  }

  dz.forEach(currentAnimationName => {
    const currentAnimation = spine.spineData.findAnimation(currentAnimationName)
    spine.state.setAnimationWith(0, currentAnimation, true)
    let time = 0
    while (time < currentAnimation.duration) {
      time += 1 / 120 // 模拟120帧
      spine.update(time)
      app.render()
      updateWithCurrentBound()
    }
  })

  return {
    width: fixed.w,
    height: fixed.h,
    x0: fixed.x,
    y0: fixed.h - fixed.y,
    location: `/sandbox/${modelName}.skel`,
    name: modelName
  }
}

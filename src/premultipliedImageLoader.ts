export default function imageLoaderAdapter (loader: any, namePrefix: string, baseUrl: string, imageOptions: any): (line: string, callback: (baseTexture?: PIXI.BaseTexture) => any) => void {
  if ((typeof baseUrl === 'string') && baseUrl.lastIndexOf('/') !== (baseUrl.length - 1)) {
    baseUrl += '/'
  }
  return function (line: string, callback: (baseTexture?: PIXI.BaseTexture) => any) {
    const name = namePrefix + line
    const url = baseUrl + line

    const cachedResource = loader.resources[name]
    if (typeof cachedResource === 'object') {
      const done = (): void => {
        cachedResource.texture.baseTexture.alphaMode = 2 /* !! PIXI.ALPHA_MODES.PREMULTIPLY_ALPHA */
        callback(cachedResource.texture.baseTexture)
      }
      if (typeof cachedResource.texture === 'object') {
        done()
      } else {
        cachedResource.onAfterMiddleware.add(done)
      }
    } else {
      loader.add(name, url, imageOptions, (resource: PIXI.LoaderResource) => {
        if (resource.error === undefined || resource.error === null) {
          resource.texture.baseTexture.alphaMode = 2
          callback(resource.texture.baseTexture)
        } else {
          callback(undefined)
        }
      })
    }
  }
}

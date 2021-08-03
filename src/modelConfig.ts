export interface ModelConfig {
  name: string
  location: string
  width: number
  height: number
  x0: number
  y0: number
}

export const parseModelConfig = (str: string): ModelConfig => {
  const got = JSON.parse(str) as ModelConfig
  if (typeof got !== 'object' || typeof got.name !== 'string' || typeof got.location !== 'string' || typeof got.width !== 'number' || typeof got.height !== 'number' || typeof got.x0 !== 'number' || typeof got.y0 !== 'number') throw new Error('Invalid model config')
  return got
}

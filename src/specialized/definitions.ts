export const motions = {
  idle: 'idle',
  drag: 'drag',
  drop: 'drop',
  chuo: 'chuo',
  walk: 'walk'
}

export interface ExtraState {
  dancing: boolean
  facingLeft: boolean
}

export enum MouseKeyFunction {
  void,
  touch,
  switchDance,
  walk
}

export const animations = ['stand2', 'walk', 'touch', 'tuozhuai2']

export const premultiplied = false

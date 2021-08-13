export default class HuiEvents {
  leftClick = [] as Array<() => boolean>
  rightClick = [] as Array<() => boolean>
  animationCompleted = [] as Array<(name: string) => boolean>
  leftDragDown = [] as Array<() => boolean>
  leftDragUp = [] as Array<() => boolean>
  rightDragDown = [] as Array<() => boolean>
  rightDragUp = [] as Array<() => boolean>
  keyboard = [] as Array<(type: number, key: number) => boolean>
}

export function dispatchEvent<T> (handlers: T[], caller: (handler: T) => boolean): boolean {
  return handlers.some(handler => caller(handler))
}

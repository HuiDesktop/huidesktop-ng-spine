export default class HuiEvents {
  leftClick = [] as Array<() => boolean>
  rightClick = [] as Array<() => boolean>
  animationCompleted = [] as Array<(name: string) => boolean>
  dragStart = [] as Array<() => boolean>
  dragEnd = [] as Array<() => boolean>
  keyboard = [] as Array<(type: number, key: number) => boolean>
}

export function dispatchEvent<T> (handlers: T[], caller: (handler: T) => boolean): boolean {
  return handlers.some(handler => caller(handler))
}

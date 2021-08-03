export const motions = {
  idle: 'idle',
  drag: 'drag',
  drop: 'drop',
  chuo: 'chuo',
  walk: 'walk',
  jump: 'jump'
}

export const idleStateCount = 3
export enum IdleState { stand, sit, sleep }

export interface ExtraState { status: IdleState, facingLeft: boolean }

export const getAnimationNameByIdleState = (s: IdleState): string => {
  switch (s) {
    case IdleState.stand: return 'Relax'
    case IdleState.sit: return 'Sit'
    case IdleState.sleep: return 'Sleep'
    default: throw new Error()
  }
}

export enum MouseKeyFunction {
  void,
  touch,
  switchStatus,
  walk
}

export const animations = ['Interact', 'Move', 'Relax', 'Sit', 'Sleep']

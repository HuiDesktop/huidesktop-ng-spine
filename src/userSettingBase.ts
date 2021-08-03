/* eslint-disable @typescript-eslint/strict-boolean-expressions */ // TODO

export interface UserSettingBase<MouseKeyFunction> {
  version: number
  left: MouseKeyFunction
  right: MouseKeyFunction
  leftDrag: boolean
  rightDrag: boolean
  scale: number
  free: boolean
  opacity: number
  topMost: boolean
  hideTaskbarIcon: boolean
  clickTransparent: boolean
  flip: boolean
  walkRandom: number
}

const tryParseInt = (sth: any, defaultValue: number): number => {
  try {
    return parseInt(sth || defaultValue)
  } catch {
    return defaultValue
  }
}

const tryParseFloat = (sth: any, defaultValue: number): number => {
  try {
    return parseFloat(sth || defaultValue)
  } catch {
    return defaultValue
  }
}

const inEnumRange = (sth: number, end: number, defaultValue?: number): number => {
  sth = Math.ceil(sth)
  if (sth < 0 || sth > end) return defaultValue ?? 0
  return sth
}

const inFloatRange = (sth: number, start: number, end: number, defaultValue?: number): number => {
  if (sth < start || sth > end) return defaultValue ?? 0
  return sth
}

export default class UserSettingManagerBase<T extends number> {
  currentVersion: number
  mouseKeyFunctionTotal: number
  keyName = ''

  constructor (currentVersion: number, mouseKeyFunctionTotal: number) {
    this.currentVersion = currentVersion
    this.mouseKeyFunctionTotal = mouseKeyFunctionTotal
  }

  parseUserSettings (config: string | null): UserSettingBase<T> {
    let obj: Partial<UserSettingBase<T>> = config === null ? {} : JSON.parse(config)
    if (obj.version !== this.currentVersion) obj = {}
    const real: UserSettingBase<T> = {
      version: this.currentVersion,
      left: inEnumRange(tryParseInt(obj.left, 0), this.mouseKeyFunctionTotal - 1) as T,
      right: inEnumRange(tryParseInt(obj.right, 0), this.mouseKeyFunctionTotal - 1) as T,
      leftDrag: !!obj.leftDrag,
      rightDrag: !!obj.rightDrag,
      topMost: !!obj.topMost,
      hideTaskbarIcon: !!obj.hideTaskbarIcon,
      opacity: inFloatRange(tryParseFloat(obj.opacity, 1), 0, 1, 1),
      scale: inFloatRange(tryParseFloat(obj.scale, 1), 0, 1, 1),
      free: !!obj.free,
      clickTransparent: !!obj.clickTransparent,
      flip: !!obj.flip,
      walkRandom: inEnumRange(tryParseInt(obj.walkRandom, 0), 114514)
    }
    return real
  }

  loadUserSettingsFromLocalStorage (): UserSettingBase<T> {
    return this.parseUserSettings(localStorage.getItem(this.keyName))
  }

  saveUserSettingsToLocalStorage (settings: UserSettingBase<T>): void {
    localStorage.setItem(this.keyName, JSON.stringify(settings))
  }

  getUserSettingsFromHTMLDocument<T extends number> (document: HTMLDocument): UserSettingBase<T> {
    const on = <T extends HTMLElement>(name: string): T => {
      const obj = document.getElementById(name)
      if (obj == null) throw new Error(`${name} not found in the document`)
      return obj as T
    }
    const onSelect: (name: string) => HTMLSelectElement = on
    const onInput: (name: string) => HTMLInputElement = on
    const settings: UserSettingBase<T> = {
      version: this.currentVersion,
      left: onSelect('left-click').selectedIndex as T,
      right: onSelect('right-click').selectedIndex as T,
      leftDrag: onInput('dragmove-left').checked,
      rightDrag: onInput('dragmove-right').checked,
      topMost: onInput('top-most').checked,
      hideTaskbarIcon: !onInput('show-in-taskbar').checked,
      walkRandom: parseInt(onInput('walk-random').value),
      opacity: parseFloat(onInput('opacity').value),
      scale: parseFloat(onInput('zoom').value),
      flip: onInput('reverse').checked,
      free: onInput('free').checked,
      clickTransparent: onInput('click-transparent').checked
    }
    return settings
  }

  showUserSettingsToHTMLDocument<T extends number> (it: UserSettingBase<T>, document: HTMLDocument): void {
    const on = <T extends HTMLElement>(name: string): T => {
      const obj = document.getElementById(name)
      if (obj == null) throw new Error(`${name} not found in the document`)
      return obj as T
    }
    const onSelect: (name: string) => HTMLSelectElement = on
    const onInput: (name: string) => HTMLInputElement = on
    onSelect('left-click').selectedIndex = it.left
    onSelect('right-click').selectedIndex = it.right
    onInput('dragmove-left').checked = it.leftDrag
    onInput('dragmove-right').checked = it.rightDrag
    onInput('top-most').checked = it.topMost
    onInput('show-in-taskbar').checked = !it.hideTaskbarIcon
    onInput('walk-random').value = it.walkRandom.toString()
    onInput('opacity').value = it.opacity.toString()
    onInput('zoom').value = it.scale.toString()
    onInput('reverse').checked = it.flip
    onInput('free').checked = it.free
    onInput('click-transparent').checked = it.clickTransparent
  }
}

/* eslint-disable @typescript-eslint/strict-boolean-expressions */ // TODO

import UserSettingManagerBase, { UserSettingBase } from '../userSettingBase'
import { IdleState, MouseKeyFunction } from './definitions'

export const currentVersion = 5
export const mouseKeyFunctionTotal = 4

export interface UserSettings extends UserSettingBase<MouseKeyFunction> {}

export const userSettingManager = new UserSettingManagerBase(currentVersion, mouseKeyFunctionTotal)

// TODO: save in userSettings
export function getIdleState (name: string): IdleState {
  const item = localStorage.getItem(`cc.huix.mrfz.idle.${name}`)
  switch (item) {
    case 'sit':
      return IdleState.sit
    case 'sleep':
      return IdleState.sleep
  }
  return IdleState.stand
}

export function saveIdleState (name: string, state: IdleState): void {
  let save = 'stand'
  switch (state) {
    case IdleState.sit:
      save = 'sit'
      break
    case IdleState.sleep:
      save = 'sleep'
      break
  }
  localStorage.setItem(`cc.huix.mrfz.idle.${name}`, save)
}

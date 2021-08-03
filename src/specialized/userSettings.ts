/* eslint-disable @typescript-eslint/strict-boolean-expressions */ // TODO

import UserSettingManagerBase, { UserSettingBase } from '../userSettingBase'
import { MouseKeyFunction } from './definitions'

export const currentVersion = 5
export const mouseKeyFunctionTotal = 4

export interface UserSettings extends UserSettingBase<MouseKeyFunction> {}

export const userSettingManager = new UserSettingManagerBase(currentVersion, mouseKeyFunctionTotal)

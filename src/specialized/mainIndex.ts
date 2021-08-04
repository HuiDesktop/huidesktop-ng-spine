import processProcessManagementContainer from './processProcessManagementContainer'
import { userSettingManager } from './userSettings'
import { bindEventCallback } from './bindEventCallback'
import { ExtraState, motions, MouseKeyFunction } from './definitions'
import mainIndex from '../mainIndex'

export default mainIndex<MouseKeyFunction, ExtraState>(
  userSettingManager,
  name => `cc.huix.blhx.${name}`,
  us => ({ dancing: false, facingLeft: us.flip }),
  (_, userSettings) => userSettings.walkRandom > 0 || userSettings.left === MouseKeyFunction.walk || userSettings.right === MouseKeyFunction.walk,
  processProcessManagementContainer,
  bindEventCallback,
  motions.idle,
  motions.idle,
  motions.walk)

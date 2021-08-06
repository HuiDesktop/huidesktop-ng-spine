import TWEEN from '@tweenjs/tween.js'
import HuiDesktopIpcBridge from './huiDesktopIpcBridge'
import { ModelConfig } from './modelConfig'
import { ManagedApplication, ManageSpine } from './pixiHelper'
import ProcessManagementContainer from './processManagementContainer'
import { getOpeningWindowSizeStr, initializeWindow } from './shapeHelper'
import UserSettingManagerBase, { UserSettingBase } from './userSettingBase'

const applyPureUserSettings = (hui: HuiDesktopIpcBridge, userSettings: UserSettingBase<number>): void => {
  hui.setTopMost(userSettings.topMost).catch(e => console.error(e))
  hui.hideTaskbarIcon(userSettings.hideTaskbarIcon).catch(e => console.error(e))
  hui.setClickTransparent(userSettings.clickTransparent).catch(e => console.error(e))
}

const initializeApp = (app: ManagedApplication, modelConfig: ModelConfig, userSettings: UserSettingBase<number>): void => {
  // 你猜
  app.opacity = userSettings.opacity.toString()

  // 设置世界坐标原点，这样小人就不需要管坐标了~
  app.raw.stage.x = modelConfig.x0 * userSettings.scale
  app.raw.stage.y = (modelConfig.height - modelConfig.y0) * userSettings.scale
  // 如果只设置了翻转，且不走动，那么由于窗口大小的原因，要“翻转”x
  if (userSettings.flip) app.raw.stage.x = app.raw.view.width - app.raw.stage.x
}

const initializeCharacter = (character: ManageSpine, modelConfig: ModelConfig, userSettings: UserSettingBase<number>): void => {
  character.raw.stateData.defaultMix = 1 / 6
  character.setScale(userSettings.scale, userSettings.flip)
}

export default function<MouseKeyFunction extends number, ExtraState> (
  userSettingManager: UserSettingManagerBase<MouseKeyFunction>,
  keyNameBuilder: (name: string) => string, // `cc.huix.blhx.${modelConfig.name}`
  extraStateBuilder: (userSettings: UserSettingBase<MouseKeyFunction>) => ExtraState, // { dancing: false, facingLeft: userSettings.flip }
  canFlipBuilder: (modelConfig: ModelConfig, userSettings: UserSettingBase<MouseKeyFunction>) => boolean, // userSettings.walkRandom > 0 || userSettings.left === MouseKeyFunction.walk || userSettings.right === MouseKeyFunction.walk
  processProcessManagementContainer: (hui: HuiDesktopIpcBridge, container: ProcessManagementContainer, character: ManageSpine, userSettings: UserSettingBase<MouseKeyFunction>, modelConfig: ModelConfig, extraState: ExtraState, savePos: () => void) => void,
  bindEventCallback: (hui: HuiDesktopIpcBridge, container: ProcessManagementContainer, character: ManageSpine, userSettings: UserSettingBase<MouseKeyFunction>, extraState: ExtraState) => void,
  containerEntry: string,
  idleEntry: string,
  walkEntry: string
) {
  return async (modelConfig: ModelConfig): Promise<void> => {
    userSettingManager.keyName = keyNameBuilder(modelConfig.name)
    const hui = await HuiDesktopIpcBridge.getInstance()
    const userSettings = userSettingManager.loadUserSettingsFromLocalStorage()
    const container = new ProcessManagementContainer()
    const extraState = extraStateBuilder(userSettings)

    applyPureUserSettings(hui, userSettings)

    const { size, savePos } = initializeWindow(hui, modelConfig, userSettings, canFlipBuilder(modelConfig, userSettings))
    const app = new ManagedApplication(size)
    initializeApp(app, modelConfig, userSettings)

    const character = await ManageSpine.downloadFromSkelUrl(modelConfig.location)
    initializeCharacter(character, modelConfig, userSettings)
    character.raw.interactive = true
    processProcessManagementContainer(hui, container, character, userSettings, modelConfig, extraState, savePos)
    bindEventCallback(hui, container, character, userSettings, extraState)
    app.add(character)

    const loop = (time: number): void => {
      TWEEN.update(time)
      app.render()
      requestAnimationFrame(time => loop(time))
    }

    container.enter(containerEntry)
    app.start()
    requestAnimationFrame(time => loop(time))

    if (userSettings.walkRandom > 0) {
      setInterval(() => {
        if (container.current === idleEntry && Math.random() < 1 / userSettings.walkRandom) {
          container.enter(walkEntry)
        }
      }, 1000)
    }

    userSettingManager.saveUserSettingsToLocalStorage(userSettings)

    window.saveSettings = d => userSettingManager.saveUserSettingsToLocalStorage(userSettingManager.getUserSettingsFromHTMLDocument(d))
    window.showSettings = d => userSettingManager.showUserSettingsToHTMLDocument(userSettings, d)
    hui.setUserSettingsResponse(() => window.open('config.html', '设置', getOpeningWindowSizeStr(370, 760))).catch(e => console.error(e))
  }
}

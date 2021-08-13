import HuiEvents from './events'
import HuiDesktopIpcBridge from './huiDesktopIpcBridge'
import { ModelConfig } from './modelConfig'
import { ManagedApplication, ManageSpine } from './pixiHelper'
import ProcessManagementContainer from './processManagementContainer'
import UserSettingManagerBase, { UserSettingBase } from './userSettingBase'

export const HUIAPP_VERSION = 1

export default class <MouseKeyFunction extends number, ExtraState> {
  readonly ver = HUIAPP_VERSION
  hui: HuiDesktopIpcBridge
  name: string
  app: ManagedApplication
  character: ManageSpine
  container: ProcessManagementContainer
  extraState: ExtraState
  modelConfig: ModelConfig
  userSettings: UserSettingBase<MouseKeyFunction>
  userSettingManager: UserSettingManagerBase<MouseKeyFunction>
  savePos: () => void
  pluginEvents = new HuiEvents()

  constructor (hui: HuiDesktopIpcBridge,
    name: string,
    app: ManagedApplication,
    character: ManageSpine,
    container: ProcessManagementContainer,
    extraState: ExtraState,
    modelConfig: ModelConfig,
    userSettings: UserSettingBase<MouseKeyFunction>,
    userSettingManager: UserSettingManagerBase<MouseKeyFunction>,
    savePos: () => void) {
    this.hui = hui
    this.name = name
    this.app = app
    this.character = character
    this.container = container
    this.extraState = extraState
    this.modelConfig = modelConfig
    this.userSettings = userSettings
    this.userSettingManager = userSettingManager
    this.savePos = savePos
  }
}

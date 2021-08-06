/* eslint-disable no-unreachable */
import appMain from './specialized/mainIndex'
import autoMake from './autoMake'
import { ModelConfig, parseModelConfig } from './modelConfig'
import HuiDesktopIpcBridge from './huiDesktopIpcBridge'
import { getOpeningWindowSizeStr } from './shapeHelper'

const enterMain = (conf: ModelConfig): void => {
  appMain(conf).catch(e => console.error(e))
}

fetch('/sandbox/model_config.json')
  .then(async response => {
    if (response.ok) {
      return await Promise.resolve(response).then(async response => await response.text())
        .then(async param => {
          if (!param.includes('{')) {
            document.body.innerText = '正在处理模型，如30秒内未自动刷新，请联系老猫'
            document.body.style.backgroundColor = 'white';
            (await HuiDesktopIpcBridge.getInstance()).setWindowSize(180, 120).catch(e => console.error(e))
            autoMake(param)
              .then(async settings => await fetch('/sandbox/model_config.json', { method: 'POST', body: JSON.stringify(settings) }))
              .then(() => location.reload())
              .catch(console.error)
          } else enterMain(parseModelConfig(param))
        })
    } else {
      document.body.innerText = '请在弹出窗口内操作'
      document.body.style.backgroundColor = 'white';
      (await HuiDesktopIpcBridge.getInstance()).setWindowSize(180, 120).catch(e => console.error(e))
      window.onDownloadModelSuccess = () => location.reload()
      window.open('setup.html', '模型下载器', getOpeningWindowSizeStr(400, 400))
    }
  })
  .catch(async e => {
    document.body.innerText = '出现错误，请联系老猫'
    document.body.style.backgroundColor = 'white';
    (await HuiDesktopIpcBridge.getInstance()).setWindowSize(180, 120).catch(e => console.error(e))
    console.error(e)
  })

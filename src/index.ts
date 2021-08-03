/* eslint-disable no-unreachable */
import appMain from './specialized/azurLaneDefinition'
import autoMake from './autoMake'
import { ModelConfig, parseModelConfig } from './modelConfig'

const enterMain = (conf: ModelConfig): void => {
  appMain(conf).catch(e => console.error(e))
}

fetch('/sandbox/model_config.json')
  .then(async response => {
    if (response.ok) {
      return await Promise.resolve(response).then(async response => await response.text())
        .then(param => {
          if (!param.includes('{')) {
            document.body.innerText = '正在处理模型，如30秒内未自动刷新，请联系老猫'
            document.body.style.backgroundColor = 'white'
            huiDesktop.window.width = 180
            huiDesktop.window.height = 128
            autoMake(param)
              .then(async settings => await fetch('/sandbox/model_config.json', { method: 'POST', body: JSON.stringify(settings) }))
              .then(() => location.reload())
              .catch(console.error)
          } else enterMain(parseModelConfig(param))
        })
    } else {
      document.body.innerText = '请在弹出窗口内操作'
      document.body.style.backgroundColor = 'white'
      huiDesktop.window.width = 180
      huiDesktop.window.height = 128
      window.onDownloadModelSuccess = () => location.reload()
      window.open('setup.html', '模型下载器', 'width=400, height=400')
    }
  })
  .catch(e => {
    document.body.innerText = '出现错误，请联系老猫'
    document.body.style.backgroundColor = 'white'
    huiDesktop.window.width = 180
    huiDesktop.window.height = 128
    console.error(e)
  })

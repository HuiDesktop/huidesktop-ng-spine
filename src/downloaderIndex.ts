import { modelNameUrl, modelOrigin, configUrl } from './specialized/downloader'

async function tryGetInfo (name: string): Promise<string> {
  const response = await fetch(modelNameUrl(name))
  if (!response.ok) throw new Error('Not found')
  return await response.text()
}

const modelNameInput = document.getElementById('model-name') as HTMLInputElement
const techDiv = document.getElementById('tech') as HTMLDivElement
const sbDiv = document.getElementById('sb') as HTMLDivElement
const okDiv = document.getElementById('youareok') as HTMLDivElement
const waitDiv = document.getElementById('waitinfo') as HTMLDivElement
const tryButton = document.getElementById('trybutton') as HTMLButtonElement
const goButton = document.getElementById('go') as HTMLButtonElement

let modelName = ''

async function finishinput (): Promise<void> {
  tryButton.disabled = true
  const r = await tryGetInfo(modelNameInput.value).catch(e => {
    sbDiv.hidden = false
    techDiv.innerText = e instanceof Error ? e.message : e
    return undefined
  })
  if (typeof r === 'string') {
    sbDiv.hidden = true
    okDiv.hidden = false
    modelNameInput.disabled = true
    tryButton.disabled = true
    modelName = r
  } else {
    tryButton.disabled = false
  }
}

let hasConfig = false // 真是丑陋啊

async function downloadFile (origin: string, ext: string, dest: string): Promise<void> {
  try {
    const response = await fetch(origin + ext)
    if (response.ok) {
      const blob = await response.arrayBuffer()
      await fetch(dest + ext, { method: 'POST', body: blob, headers: { 'Content-Type': 'application/octet-stream' } }) // 用Blob就不行，真是奇怪呢
      if (ext == '') {
        waitDiv.innerText += '网站存在配置，跳过自动配置\n'
        hasConfig = true
      } else {
        waitDiv.innerText += `${ext}下载成功\n`
      }
    }
  } catch (e) {
    if (ext == '') {
      waitDiv.innerText += '网站不存在配置，将自动配置\n'
    } else {
      waitDiv.innerText += `${ext}下载失败\n`
    }
  }
}

async function startDownload (): Promise<void> {
  goButton.disabled = true
  waitDiv.innerText = ''
  const origin = modelOrigin(modelNameInput.value, modelName)
  const dest = `https://huidesktop/sandbox/${modelName}`
  await Promise.all([
    downloadFile(origin, '.skel', dest),
    downloadFile(origin, '.png', dest),
    downloadFile(origin, '.atlas', dest),
    downloadFile(configUrl(modelNameInput.value), '', 'https://huidesktop/sandbox/model_config.json')])
  if (!hasConfig) {
    await fetch('https://huidesktop/sandbox/model_config.json', { method: 'POST', body: modelName })
  }
  waitDiv.innerText += '下载完成，即将自动刷新主窗口'
  window.opener.onDownloadModelSuccess()
  window.close()
}

tryButton.onclick = finishinput
goButton.onclick = startDownload

fetch('/sandbox/modelName.txt').then(r => {
  if (r.ok) {
    return r.text()
  } else return null
}).then(v => {
  if (typeof v === 'string') {
    modelNameInput.value = v
    return finishinput()
  }
}).catch(e => console.error(e))

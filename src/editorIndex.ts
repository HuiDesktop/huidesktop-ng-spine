import Codemirror from 'codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/javascript/javascript'
import { HUIAPP_VERSION } from './huiApplication'

const cm = Codemirror.fromTextArea(document.getElementById('editor') as HTMLTextAreaElement, { lineNumbers: true, mode: 'javascript' })
;(window as any).cm = cm

function load (): void {
  fetch('/sandbox/plugin.js').then(async r => {
    if (r.ok) {
      cm.setValue(await r.text())
    } else {
      cm.setValue('// HuiAPP API version: ' + HUIAPP_VERSION.toString())
    }
  }).catch(e => cm.setValue(e))
}

function save (): void {
  fetch('/sandbox/plugin.js', { method: 'POST', body: cm.getValue() }).catch(e => { console.log(e); alert(e) })
}

(window as any).load = load;
(window as any).save = save

load()

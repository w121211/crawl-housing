import { load } from 'cheerio'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const js = fs.readFileSync(path.join(__dirname, 'data.js')).toString()

const dom = new JSDOM(`<script>${js}</script>`, { runScripts: 'dangerously' })
// console.log(dom.window.Nifty.Data.AreasData)
// console.log(Object.keys(dom.window.Nifty.Data.AreasData))
// console.log(dom.window.Nifty.Data.AreasData.prefIds)

console.log(dom.window.Nifty.Data.AreasData.prefData['10'])

for (const id of dom.window.Nifty.Data.AreasData.prefIds) {
  const [prefName, prefCode, _, __, cityDict] =
    dom.window.Nifty.Data.AreasData.prefData[id]
  for (const [k, v] of Object.entries(cityDict)) {
    const [cityName, cityCode] = v
    console.log(`/rent/${prefCode}/${cityCode}_ct/`)
  }
}

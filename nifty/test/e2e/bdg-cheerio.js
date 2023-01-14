import { load } from 'cheerio'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { JSDOM } from 'jsdom'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const html = fs.readFileSync(path.join(__dirname, 'bdg.html')).toString()
const $ = load(html)

const ld = JSON.parse($('script[type="application/ld+json"]').text())
const itemList = ld['itemListElement']
console.log(itemList)

const map = $('div#detailMapArea').data()
console.log(map)

const basics = $('div.box.is-space-xxs > dl')
  .map(function () {
    const k = $(this).find('dt').text().trim()
    const v = $(this).find('dd').text().trim()
    return { k, v }
  })
  .get()
  .map(e => [e.k, e.v])
console.log(basics)

const bukkenDataScript = $('script[type="text/javascript"]')
  .filter((i, el) => $(el).text().includes('window.Nifty.Data.Bukken'))
  .prop('outerHTML')
const dom = new JSDOM(bukkenDataScript, { runScripts: 'dangerously' })
console.log(dom.window.Nifty.Data.Bukken)

const detailUrls = $('a')
  .filter((i, el) => el.attribs['href'].includes('detail_'))
  .map((i, el) => el.attribs['href'])
  .get()
console.log(detailUrls)

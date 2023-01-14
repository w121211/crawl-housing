import { load } from 'cheerio'
import { JSDOM } from 'jsdom'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const html = fs.readFileSync(path.join(__dirname, 'detail.html')).toString()
const $ = load(html)

const canonicalUrl = $('link[rel="canonical"]').attr('href')
console.log(canonicalUrl)

const ld = JSON.parse($('script[type="application/ld+json"]').text())
const itemList = ld['itemListElement']
console.log(itemList)

const map = $('div#detailMapArea').data()
console.log(map)

const updatedAtFound = $('p')
  .filter((i, el) => $(el).text().includes('情報公開日'))
  .get()
const updatedAt =
  updatedAtFound.length > 0
    ? $(updatedAtFound[0])
        .text()
        .split(/[：\s]/)[1]
    : null
console.log(updatedAt)

const basics = $('div.box.is-space-xxs > dl')
  .map(function () {
    const k = $(this).find('dt').text().trim()
    const v = $(this).find('dd').text().trim()
    return { k, v }
  })
  .get()
  .map(e => [e.k, e.v])
console.log(basics)

const table = $('table')
  .eq(0)
  .find('tr')
  .map((i, tr) => {
    const kvs = []
    $(tr)
      .find('th')
      .each((i, th) => {
        const k = $(th).text().trim()
        const v = $(th).next('td').text().trim()
        kvs.push({ k, v })
      })
    return kvs
  })
  .get()
console.log(table)

const badge = $('div.grid > div > p.badge')
  .map((i, e) => {
    const p = $(e)
    return { k: p.text().trim(), v: !p.hasClass('is-disabled') }
  })
  .get()
console.log(badge)

const badge2 = $('div.column > div.box > p.badge')
  .map((i, e) => {
    const p = $(e)
    return { k: p.text().trim(), v: !p.hasClass('is-disabled') }
  })
  .get()
console.log(badge2)

const bukkenDataScript = $('script[type="text/javascript"]')
  .filter((i, el) => $(el).text().includes('window.Nifty.Data.Bukken'))
  .prop('outerHTML')
const dom = new JSDOM(bukkenDataScript, { runScripts: 'dangerously' })
console.log(dom.window.Nifty.Data.Bukken)

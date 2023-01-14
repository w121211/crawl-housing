import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { load } from 'cheerio'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const html = fs.readFileSync(path.join(__dirname, 'list.html')).toString()
const $ = load(html)

const canonicalUrl = $('link[rel="canonical"]').attr('href')
console.log(canonicalUrl)

const ld = JSON.parse($('script[type="application/ld+json"]').text())
const itemList = ld['itemListElement']
console.log(itemList)

// const bukkenDataScript = $('script[type="text/javascript"]')
//   .filter((i, el) => $(el).text().includes('window.Nifty.Data.Bukken'))
//   .prop('outerHTML')
// const dom = new JSDOM(bukkenDataScript, { runScripts: 'dangerously' })
// console.log(dom.window.Nifty.Data.Bukken)

const lastPageLink = $('a[data-paging-link]:contains(">>")').attr('href')
const parts = lastPageLink.split('/')
const lastPageNumber = parseInt(parts[parts.length - 2])

for (let i = lastPageNumber; i > 1; i--) {
  parts[parts.length - 2] = i.toString() // Modify page number
  const url = parts.join('/')
  console.log(url)
}

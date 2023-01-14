// For more information, see https://crawlee.dev/, https://crawlee.dev/docs/examples/cheerio-crawler
import {
  CheerioCrawler,
  Configuration,
  log,
  LogLevel,
  ProxyConfiguration,
} from 'crawlee'
import { JSDOM } from 'jsdom'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { router } from './routes.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

log.setLevel(LogLevel.DEBUG)

const config = Configuration.getGlobalConfig()
// Storage directories are purged by default. Set to false to avoid accidental purge.
// config.set('purgeOnStart', false)

// Setup start urls. Get the latest data.js file from https://myhome.nifty.com/common/api/js/areas/data.js?20230108
const js = fs
  .readFileSync(__dirname + '/../test/e2e/data_20230108.js')
  .toString()
const dom = new JSDOM(`<script>${js}</script>`, { runScripts: 'dangerously' })
// const startUrls = ['https://myhome.nifty.com/rent/saitama/saitamashikitaku_ct/']
const startUrls: string[] = []

for (const [k, v] of Object.entries(dom.window.Nifty.Data.AreasData.prefData)) {
  const [prefName, prefCode, _, __, cityDict] = v as any
  for (const [k, v] of Object.entries(cityDict)) {
    const [cityName, cityCode] = v as any
    const url = `https://myhome.nifty.com/rent/${prefCode}/${cityCode}_ct/`
    startUrls.push(url)
  }
}

const crawler = new CheerioCrawler({
  // The crawler downloads and processes the web pages in parallel, with a concurrency
  // automatically managed based on the available system memory and CPU (see AutoscaledPool class).
  // Here we define some hard limits for the concurrency.
  // minConcurrency: 10,
  maxConcurrency: 15,
  // maxRequestsPerMinute: 100,

  // On error, retry each page at most once.
  // maxRequestRetries: 1,

  // Increase the timeout for processing of each page.
  // requestHandlerTimeoutSecs: 30,

  // Limit to 10 requests per one crawl
  maxRequestsPerCrawl: 10,

  // proxyConfiguration: new ProxyConfiguration({ proxyUrls: ['...'] }),
  requestHandler: router,
})

// console.log(startUrls.slice(0, 2))
await crawler.run(startUrls.slice(2, 3))

// After crawl process: zip storage, store data into database, ...

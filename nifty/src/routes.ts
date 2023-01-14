import { Dataset, createCheerioRouter, sleep, keys } from 'crawlee'
import { JSDOM } from 'jsdom'

export const router = createCheerioRouter()

router.addDefaultHandler(async ({ enqueueLinks, log, request, $ }) => {
  const title = $('title').text()
  log.info(`${title}`, { url: request.loadedUrl })

  const canonicalUrl = $('link[rel="canonical"]').attr('href')

  const ld = JSON.parse($('script[type="application/ld+json"]').text())
  const itemList = ld['itemListElement']

  let dom: JSDOM | undefined
  const bukkenDataScript = $('script[type="text/javascript"]')
    .filter((i, el) => $(el).text().includes('window.Nifty.Data.Bukken'))
    .prop('outerHTML')
  if (bukkenDataScript === null) {
    log.error('bukkenDataScript === null', { url: request.url })
  } else {
    const dom = new JSDOM(bukkenDataScript, {
      runScripts: 'dangerously',
    })
  }

  await Dataset.pushData({
    label: 'ct',
    url: request.url,
    canonicalUrl,
    itemList,
    bukkenData: dom && dom.window.Nifty.Data.Bukken,
    crawledAt: new Date(),
  })

  // await enqueueLinks({
  //   label: 'bdg',
  //   globs: ['https://myhome.nifty.com/**/bdg_*/'],
  // })
  // await enqueueLinks({
  //   label: 'detail',
  //   globs: ['https://myhome.nifty.com/**/detail_*/'],
  // })

  const lastPageLink = $('a[data-paging-link]:contains(">>")').attr('href')
  if (lastPageLink === undefined) {
    log.error('lastPageLink === undefined', { url: request.url })
    return
  }
  const parts = lastPageLink.split('/')
  const lastPageNumber = parseInt(parts[parts.length - 2])
  const pageUrls: string[] = []
  for (let i = lastPageNumber; i > 1; i--) {
    parts[parts.length - 2] = i.toString() // Modify page number
    pageUrls.push('https://myhome.nifty.com' + parts.join('/'))
  }
  // console.log(request.)
  console.log(pageUrls)
  await enqueueLinks({ urls: pageUrls })

  // await enqueueLinks({label: 'ct', userData: {}})

  await sleep(5000)
})

router.addHandler('bdg', async ({ enqueueLinks, request, $, log }) => {
  const title = $('title').text()
  log.info(`${title}`, { url: request.url, loadedUrl: request.loadedUrl })

  const canonicalUrl = $('link[rel="canonical"]').attr('href')
  // console.log(canonicalUrl)

  const ld = JSON.parse($('script[type="application/ld+json"]').text())
  const itemList = ld['itemListElement']
  // console.log(itemList)

  const map = $('div#detailMapArea').data()
  // console.log(map)

  const basics = $('div.box.is-space-xxs > dl')
    .map(function () {
      const k = $(this).find('dt').text().trim()
      const v = $(this).find('dd').text().trim()
      return { k, v }
    })
    .get()
    .map(e => [e.k, e.v])
  // console.log(basics)

  const bukkenDataScript = $('script[type="text/javascript"]')
    .filter((i, el) => $(el).text().includes('window.Nifty.Data.Bukken'))
    .prop('outerHTML')
  if (bukkenDataScript === null) throw new Error('bukkenDataScript === null')
  const dom = new JSDOM(bukkenDataScript, {
    runScripts: 'dangerously',
  })
  // console.log(dom.window.Nifty.Data.Bukken)

  await Dataset.pushData({
    label: 'bdg',
    url: request.url,
    canonicalUrl,
    itemList,
    map,
    basics,
    bukkenData: dom.window.Nifty.Data.Bukken,
    crawledAt: new Date(),
  })

  // await enqueueLinks({
  //   label: 'bdg',
  //   globs: ['https://myhome.nifty.com/**/bdg_*/'],
  // })
  await enqueueLinks({
    label: 'detail',
    globs: ['https://myhome.nifty.com/**/detail_*/'],
  })

  await sleep(5000)
})

router.addHandler('detail', async ({ enqueueLinks, request, $, log }) => {
  const title = $('title').text()
  log.info(`${title}`, { url: request.loadedUrl })

  const canonicalUrl = $('link[rel="canonical"]').attr('href')
  // console.log(canonicalUrl)

  const ld = JSON.parse($('script[type="application/ld+json"]').text())
  const itemList = ld['itemListElement']
  // console.log(itemList)

  const map = $('div#detailMapArea').data()
  // console.log(map)

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
    .map((i, el) => {
      const k = $(el).find('dt').text().trim()
      const v = $(el).find('dd').text().trim()
      return { k, v }
    })
    .get()
  // console.log(basics)

  const table = $('table')
    .eq(0)
    .find('tr')
    .map((i, tr) => {
      const kvs: { k: string; v: string }[] = []
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
  // console.log(table)

  const badge1 = $('div.grid > div > p.badge')
    .map((i, e) => {
      const p = $(e)
      return { k: p.text().trim(), v: !p.hasClass('is-disabled') }
    })
    .get()
  // console.log(badge1)

  const badge2 = $('div.column > div.box > p.badge')
    .map((i, e) => {
      const p = $(e)
      return { k: p.text().trim(), v: !p.hasClass('is-disabled') }
    })
    .get()
  // console.log(badge2)

  await Dataset.pushData({
    label: 'detail',
    url: request.url,
    canonicalUrl,
    itemList,
    map,
    basics, // (key, value) tuples
    table, // (key, value) tuples
    badge1,
    badge2,
    // photos: '',
    updatedAt,
    crawledAt: new Date(),
  })

  // await enqueueLinks({
  //   label: 'bdg',
  //   globs: ['https://myhome.nifty.com/**/bdg_*/'],
  // })
  // await enqueueLinks({
  //   label: 'detail',
  //   globs: ['https://myhome.nifty.com/**/detail_*/'],
  // })

  await sleep(5000)
})

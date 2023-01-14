import { Dataset, createCheerioRouter, sleep, Configuration } from 'crawlee'

const config = Configuration.getGlobalConfig()
// Storage directories are purged by default. Set to false to avoid accidental purge.
config.set('purgeOnStart', false)

const dataset = await Dataset.open()

await dataset.forEach(async (e, i) => {
  switch (e.label) {
    case 'building':
      break
    case 'room':
      break
    default:
      console.error('Found no label', e)
      break
  }

  console.log(e)
})

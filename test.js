const tap = require('tap')
const manga = require('./App')
const axios = require('axios')
const opts = require('./opt')
const { existsSync } = require('fs')
const tstdata = { title: 'Jujutsu kaisen', num: 185 }
const argtstdata = [{ s: './tstdir/' }, { r: true }].map(ob => {
  ob._ = []
  return ob
})

// add arg test
tap.test('Error test', async t => {
  await t.rejects(manga(), { message: 'Please enter a vaild name' })
  await t.rejects(manga(2323), { message: 'Please enter a vaild name' })
  await t.rejects(manga(''), { message: 'Please enter a vaild name' })
})
tap.test('Output test', async t => {
  const main = (await manga(tstdata.title))[0]
  t.equal(typeof main.title === 'string' && main.title.length > 0, true)
  t.equal(typeof main.time === 'string' && main.time.length > 0, true)
  t.equal(typeof main.author === 'string' && main.author.length > 0, true)
  t.equal(typeof main.latest === 'object' && main.latest.length === 2, true)
  t.equal(typeof main.chapters === 'object' && main.chapters.length > tstdata.num, true)
  t.equal((await isReachable(main.url)), true)
  t.equal((await isReachable(main.coverImg)), true)
  // write test for chapters
})

tap.test('Argument Test', async t => {
  argtstdata.forEach(dt => {
    const out = opts(dt)
    t.equal(existsSync(out.path), true)
    t.equal(typeof out.thanksMsg, 'boolean')
  })
})

// simple url validation

async function isReachable (u) {
  return (await axios.get(u)).status === 200
}

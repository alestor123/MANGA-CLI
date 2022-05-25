'use strict'
const ray = require('x-ray')()
module.exports = async name => {
  if (!(name && typeof name === 'string' && name.length > 0)) throw new Error('Please enter a vaild name')
  const data = await ray('https://manganato.com/search/story/' + name.toLowerCase().replace(/ /g, '_'), '.search-story-item', [{ title: '.a-h.text-nowrap.item-title@title', coverImg: '.img-loading@src', author: '.text-nowrap.item-author@title', time: '.text-nowrap.item-time', url: '.a-h.text-nowrap.item-title@href', latest: ['a.item-chapter.a-h.text-nowrap@title'] }]).then(res => res)
  for (const mri of data) data[data.indexOf(mri)].chapters = (await ray(mri.url, '.row-content-chapter', ['.chapter-name.text-nowrap@href']).then(res => res)).map(url => url.split('/').pop().replace('chapter-', ''))
  return data
}

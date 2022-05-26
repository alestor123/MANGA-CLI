#!/usr/bin/env node
'use strict'
// chk version err
// modules
// add comment fo each function
const manga = require('./App')
const opts = require('./opt')
const { resolve, join, basename } = require('path')
const { sync } = require('rimraf')
const chalk = require('chalk')
const logUpdate = require('log-update')
const axios = require('axios')
const options = require('minimist')(process.argv.slice(2))
const ray = require('x-ray')()
const tmp = require('tmp')
const imagesToPdf = require('images-to-pdf')
const prompt = require('prompt-sync')()
const List = require('prompt-list')
const { textSync } = require('figlet')
const { writeFileSync } = require('fs')
const baseurl = 'https://readmanganato.com'
const thanks = 'https://raw.githubusercontent.com/alestor123/MANGA-CLI/8018b8d69a8d24a7cea397230352ed566ac25be2/assets/image/thanks.jpeg'
const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
let index = 0
let processed = false
// setting header
axios.defaults.headers.common.Referer = baseurl
process.on('SIGINT', Abort); // not working as intented
(async () => {
  try {
    const argo = opts(options) // checking for arguments
    console.log(chalk.bold.greenBright(textSync('MANGA-CLI')))
    console.log(chalk.bold.redBright('       Manga made available in the comfort of CLI \n '))
    const mginfo = await manga(prompt(chalk.whiteBright.bold('Search Manga : '))) // input search
    const list = new List({
      name: 'manga',
      message: chalk.redBright.bold('Choose the manga ? :'),
      choices: (mginfo.length > 0) ? mginfo.map(opts => opts.title) : Abort('Manga not found !!')
    })
    list.ask(async answers => {
      console.log(chalk.greenBright.bold(answers))
      const info = mginfo.find(o => o.title === answers)
      const questions = [{ question: 'Title', key: info.title }, { question: 'Author(s)', key: info.author }, { question: 'Updated', key: info.time.replace('Updated : ', '') }, { question: 'Latest Chapters', key: info.latest }]
      // displaing info
      console.log(chalk.redBright.bold('Manga Info : '))
      questions.forEach(gsa => console.log(chalk.redBright.bold(gsa.question + ' : ') + chalk.greenBright.bold(typeof gsa.key === 'object' ? '\n' + gsa.key.join('\n') : gsa.key)))
      const chnumPrompt = prompt(chalk.redBright.bold('Chapter number (' + info.chapters[info.chapters.length - 1] + '-' + info.chapters[0] + '): ')).toLowerCase()
      const chnums = chnumPrompt === 'all' ? info.chapters : [...new Set(chnumPrompt.split(',').filter(element => element !== ''))]
      for (const chnum of chnums) {
        if (!(validCH(chnum) && info.chapters.includes(chnum))) {
          console.log(chalk.redBright.bold('Please enter a vaild chapter number'))
          process.exit(1) // no trq (sure)
        }
      }
      if (!yesNo(prompt(chalk.greenBright.bold('Are you sure (Y/n) : ')))) Abort()
      const spinid = setInterval(spinner, 80)
      for (const chnum of chnums) {
        info.pages = await ray(info.url + '/' + 'chapter-' + chnum, '.container-chapter-reader', ['img@src']).then(res => res)
        info.pgnum = info.pages.length
        const tmpobj = tmp.dirSync()
        info.pgpaths = []
        if (!argo.thanksMsg) info.pages.push(thanks)// make it optionalargvs
        for (const img of info.pages) {
          // console.log(basename(parse(img).pathname))
          info.pgpaths.push(join(tmpobj.name, basename(new URL(img).pathname)))
          writeFileSync(join(tmpobj.name, basename(new URL(img).pathname)), (await axios.get(img, { responseType: 'arraybuffer' })).data, err => {
            if (err) throw err
          })
        };
        const mangapdfPath = resolve(join(argo.path, nameGenerator(info.title, chnum)))
        imagesToPdf(info.pgpaths, mangapdfPath)
        sync(tmpobj.name)
        processed = true
        spinner()
        clearInterval(spinid)
        console.log(chalk.greenBright.bold(mangapdfPath))
      }
      console.log(chalk.greenBright.bold('Thanks for using manga-cli !!'))
    })
  } catch (e) {
    console.log(chalk.redBright.bold('Oops : ' + e.message))
    process.exit(1) // no trq (sure)
  }
})()

// funcs

function yesNo (res) {
  return res.replace(' ', '').charAt(0).toLocaleLowerCase() === 'y'
}
function nameGenerator (res, num) {
  return res.replace(' ', '_') + '_chapter_' + num + '.pdf'
}

function validCH (str) {
  if (typeof str !== 'string') return false // we only process strings!
  return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
}
function spinner () {
  logUpdate(processed ? chalk.redBright.bold('PDF File saved at :') : chalk.greenBright.bold(frames[index = ++index % frames.length]) + chalk.redBright.bold(' Fetching the manga :'))
}
function Abort (cs) {
  console.log(chalk.redBright.bold('Aborted' + (cs ? ' : ' + cs : ' !!')))
  process.exit(0)
}

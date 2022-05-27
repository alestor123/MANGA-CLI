const imgpdf = require('./imgpdf')
const { readdirSync } = require('fs')
const { join, resolve } = require('path')
const basepath = '/tmp/tmp-29248-G31DyGeEShDh'
imgpdf(readdirSync(basepath).map(path => resolve(join(basepath, path))), './pftst/out.pdf')

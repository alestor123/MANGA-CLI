const { createWriteStream } = require('fs')
const size = require('image-size')
const PDFKit = require('pdfkit')
let doc = new PDFKit()

module.exports = (arr, outpath) => {
  let c = 0
  for (const pth of arr) {
    const sizeinfo = size(pth)
    if (c === 0) doc = new PDFKit({ size: [sizeinfo.width, sizeinfo.height] })
    else doc.addPage({ size: [sizeinfo.width, sizeinfo.height] })
    doc.image(pth, 0, 0, { width: sizeinfo.width, height: sizeinfo.height })
    c++
  }
  doc.pipe(createWriteStream(outpath))
  doc.end()
}

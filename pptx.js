import fs from 'fs';
import { Parse as unzipParse } from 'unzip-stream';
import { DOMParser } from 'xmldom';

/**
 * @param {string} filename
 * @param {function(entry)} entryMatchFunc
 * @param {function(doc)} docHandler
 * @return {Promise.<Array.<Object>>}
 */
export function readPptxFile(filename, entryMatchFunc, docHandler) {
  return new Promise((resolve, reject) => {
    const unzipParser = unzipParse();
    const result = [];

    fs.createReadStream(filename)
      .pipe(unzipParser)
      .on('entry', (entry) => {
        if (entryMatchFunc(entry)) {
          let xml = '';
          entry.setEncoding('utf8');
          entry.on('data', (chunk) => {
            xml += chunk;
          });
          entry.on('end', () => {
            const data = docHandler(new DOMParser().parseFromString(xml));
            if (data) {
              result.push(data);
            }
          });
        } else {
          entry.autodrain();
        }
      })
      .on('close', () => {
        resolve(result);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}
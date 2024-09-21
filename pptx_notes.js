import { readPptxFile } from './pptx.js';

  /**
   * @param {string} filename - the name of the file to read
   * @return {Promise.<Array.<{slideNumber: number, note: string}>>} a Promise
   */
export async function extractNotes(filename) {
  const entryMatchFunc = (entry) => {
    return entry.path.match(/^ppt\/notesSlides\/notesSlide\d+\.xml/);
  };

  const docHandler = (doc) => {
    let note = '';
    let slideNumber;

    const rowHandler = (row) => {
      const elements = row.getElementsByTagName('a:t');
      return Array.from(elements)
        .map(element => element.textContent?.trim())
        .filter(Boolean)
        .join(' ');
    };

    const rows = doc.getElementsByTagName('a:p');
    for (const row of Array.from(rows)) {
      const txt = rowHandler(row);
      const fldElm = row.getElementsByTagName('a:fld');
      if (fldElm.length && fldElm[0].getAttribute('type') === 'slidenum') {
        slideNumber = parseInt(txt, 10);
      } else {
        note += txt + "\n";
      }
    }

    note = note.trim();
    if (note === '') {
      return undefined;
    }

    return { slideNumber, note };
  };

  try {
    const result = await readPptxFile(filename, entryMatchFunc, docHandler);
    return result.sort((a, b) => a.slideNumber - b.slideNumber);
  } catch (error) {
    console.error('Error extracting notes:', error);
    throw error;
  }
}
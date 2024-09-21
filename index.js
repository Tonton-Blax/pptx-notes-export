import { parseArgs } from 'node:util';
import { extractNotes } from './pptx_notes.js';

const options = {
  input: { type: 'string', short: 'i', description: 'Path to .pptx file' },
};

async function main() {
  const { values } = parseArgs({ options, allowPositionals: true });

  if (values.input) {
    try {
      const result = await extractNotes(values.input);
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  } else {
    console.error('Please provide an input file using the -i or --input option.');
    process.exit(1);
  }
}

main();
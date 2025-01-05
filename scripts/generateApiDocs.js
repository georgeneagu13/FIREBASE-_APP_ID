import APIDocGenerator from '../src/utils/apiDocGenerator';

const generator = new APIDocGenerator({
  inputDir: './src/services',
  outputDir: './docs/api',
  format: 'markdown',
  includeExamples: true,
});

async function generateDocs() {
  try {
    console.log('Generating API documentation...');
    await generator.generate();
    console.log('API documentation generated successfully!');
  } catch (error) {
    console.error('Failed to generate API documentation:', error);
    process.exit(1);
  }
}

generateDocs(); 
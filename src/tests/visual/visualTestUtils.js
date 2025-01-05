import { device } from 'detox';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const SCREENSHOT_DIR = join(__dirname, '../../screenshots');
const BASELINE_DIR = join(SCREENSHOT_DIR, 'baseline');
const DIFF_DIR = join(SCREENSHOT_DIR, 'diff');

// Ensure directories exist
[SCREENSHOT_DIR, BASELINE_DIR, DIFF_DIR].forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

export const takeScreenshot = async (name) => {
  const screenshotPath = join(SCREENSHOT_DIR, `${name}.png`);
  await device.takeScreenshot(name);
  return screenshotPath;
};

export const compareScreenshots = async (testPath, baselineName) => {
  const baselinePath = join(BASELINE_DIR, `${baselineName}.png`);
  const diffPath = join(DIFF_DIR, `${baselineName}-diff.png`);

  // If baseline doesn't exist, create it
  if (!existsSync(baselinePath)) {
    copyFile(testPath, baselinePath);
    return true;
  }

  const testImg = PNG.sync.read(readFileSync(testPath));
  const baselineImg = PNG.sync.read(readFileSync(baselinePath));
  const { width, height } = testImg;
  const diff = new PNG({ width, height });

  const mismatchedPixels = pixelmatch(
    testImg.data,
    baselineImg.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  // Save diff image if there are mismatches
  if (mismatchedPixels > 0) {
    writeFileSync(diffPath, PNG.sync.write(diff));
  }

  // Calculate difference percentage
  const totalPixels = width * height;
  const diffPercentage = (mismatchedPixels / totalPixels) * 100;

  // Allow for small differences (0.1% threshold)
  return diffPercentage <= 0.1;
};

export const updateBaseline = (name) => {
  const testPath = join(SCREENSHOT_DIR, `${name}.png`);
  const baselinePath = join(BASELINE_DIR, `${name}.png`);
  copyFile(testPath, baselinePath);
};

const copyFile = (source, destination) => {
  writeFileSync(destination, readFileSync(source));
}; 
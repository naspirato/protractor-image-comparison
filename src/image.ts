import * as PNGImage from 'png-image';
import {RequestImageComparisonPaths, RequestImageExistsData, SaveCroppedScreenshotOptions} from "./interfaces";
import {
  calculateDprRectangles, determineImageComparisonPaths, formatFileName, isAndroid, isIOS,
  isMobile
} from "./utils";
import {join} from "path";
import {copySync, createWriteStream, pathExistsSync} from "fs-extra";

import * as resembleJS from './lib/resemble';

/**
 * Save a cropped screenshot
 * @param {SaveCroppedScreenshotOptions} args
 * @return {Promise<void>}
 */
export async function saveCroppedScreenshot(args: SaveCroppedScreenshotOptions): Promise<void> {
  return new PNGImage({
    imagePath: args.bufferedScreenshot,
    imageOutputPath: join(args.folder, formatFileName(args)),
    cropImage: args.rectangles
  }).runWithPromise();
}

/**
 * Checks if image exists as a baseline image, if not, create a baseline image if needed
 * @param {RequestImageExistsData} imageData
 */
export function checkImageExists(imageData: RequestImageExistsData) {
  if (!pathExistsSync(join(imageData.baselineFolder, imageData.fileName))) {
    if (imageData.autoSaveBaseline) {
      try {
        copySync(join(imageData.actualFolder, imageData.fileName), join(imageData.baselineFolder, imageData.fileName));
        console.log(`\nINFO: Autosaved the image to ${join(imageData.baselineFolder, imageData.fileName)}\n`);
      } catch (error) {
        throw new Error(`Image could not be copied. The following error was thrown: ${error}`);
      }
    } else {
      throw new Error('Image not found, if you want to save the image as a new baseline image please provide `autoSaveBaseline: true`.');
    }
  }
}
// 'Image not found, if you want to save the image as a new baseline image please provide `autoSaveBaseline: true`.' to equal
// 'Image not found, if you want to save the image as a new baseline image please provide `autoSaveBaseline: true`.'
/**
 * Compare images against each other
 * @param {string} fileName The file name that is used
 * @param {object} compareOptions comparison options
 * @param {object} compareOptions.blockOut blockout with x, y, width and height values
 * @param {boolean} compareOptions.blockOutStatusBar blockout the statusbar yes or no, it will override the global
 * @param {boolean} compareOptions.ignoreAntialiasing compare images an discard anti aliasing
 * @param {boolean} compareOptions.ignoreColors Even though the images are in colour, the comparison wil compare 2 black/white images
 * @param {boolean} compareOptions.ignoreTransparentPixel Will ignore all pixels that have some transparency in one of the images
 * @returns {Promise}
 * @private
 */
export async function executeImageComparison(args: RequestImageComparisonPaths, compareOptions, extra, instanceData) {
  const imageComparisonPaths = determineImageComparisonPaths(args);
  const ignoreRectangles = !!compareOptions.blockOut ? compareOptions.blockOut : [];
  const blockOutStatusBar = !!compareOptions.blockOutStatusBar ? extra.blockOutStatusBar : compareOptions.blockOutStatusBar;

  compareOptions.ignoreRectangles = !!compareOptions.ignoreRectangles ? compareOptions.ignoreRectangles.push(ignoreRectangles) : ignoreRectangles;

  // @TODO: make a private method of this
  if (isMobile(instanceData.platformName) && blockOutStatusBar
    && ((instanceData.nativeWebScreenshot && compareOptions.isScreen) || (isIOS(instanceData.platformName)))) {
    const statusBarHeight = isAndroid(instanceData.platformName) ? extra.androidOffsets.statusBar : extra.iosOffsets.statusBar;
    const statusBarBlockOut = [calculateDprRectangles({
      x: 0,
      y: 0,
      height: statusBarHeight,
      width: instanceData.browserWidth
    }, instanceData.devicePixelRatio)];

    compareOptions.ignoreRectangles = statusBarBlockOut;
  }

  if (extra.debug) {
    console.log('\n####################################################');
    console.log('compareOptions = ', compareOptions);
    console.log('####################################################\n');
  }

  return new Promise(resolve => {
    resembleJS(imageComparisonPaths.baselineImage, imageComparisonPaths.actualImage, compareOptions)
      .onComplete(data => {
        if (Number(data.misMatchPercentage) > 0 || extra.debug) {
          data.getDiffImage().pack().pipe(createWriteStream(imageComparisonPaths.imageDiffPath));
        }
        resolve(Number(data.misMatchPercentage));
      });
  });
}

import * as PNGImage from 'png-image';
import {RequestImageExistsData, SaveCroppedScreenshotOptions} from "./interfaces";
import {
  calculateDprRectangles,
  determineImageComparisonPaths,
  isAndroid,
  isIOS,
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
    imageOutputPath: join(args.folder, args.fileName),
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

/**
 * Compare images against each other
 * @TODO: rewrite docs here
 * @param {string} fileName The file name that is used
 * @param {object} args.compareOptions comparison options
 * @param {object} args.compareOptions.blockOut blockout with x, y, width and height values
 * @param {boolean} args.compareOptions.blockOutStatusBar blockout the statusbar yes or no, it will override the global
 * @param {boolean} args.compareOptions.ignoreAntialiasing compare images an discard anti aliasing
 * @param {boolean} args.compareOptions.ignoreColors Even though the images are in colour, the comparison wil compare 2 black/white images
 * @param {boolean} args.compareOptions.ignoreTransparentPixel Will ignore all pixels that have some transparency in one of the images
 * @returns {Promise}
 * @private
 */
export async function executeImageComparison(args):Promise<number> {
  const imageComparisonPaths = determineImageComparisonPaths({...args.folders, fileName:args.testInstanceData.fileName});
  const ignoreRectangles = !!args.compareOptions.blockOut ? args.compareOptions.blockOut : [];
  const blockOutStatusBar = !!args.compareOptions.blockOutStatusBar ? args.blockOutStatusBar : args.compareOptions.blockOutStatusBar;

  args.compareOptions.ignoreRectangles = !!args.compareOptions.ignoreRectangles ? args.compareOptions.ignoreRectangles.push(ignoreRectangles) : ignoreRectangles;

  // @TODO: make a private method of this
  if (isMobile(args.testInstanceData.platformName) && blockOutStatusBar
    && ((args.testInstanceData.nativeWebScreenshot && args.compareOptions.isScreen) || (isIOS(args.testInstanceData.platformName)))) {
    const statusBarHeight = isAndroid(args.testInstanceData.platformName) ? args.offsets.android.statusBar : args.offsets.ios.statusBar;
    const statusBarBlockOut = [calculateDprRectangles({
      x: 0,
      y: 0,
      height: statusBarHeight,
      width: args.testInstanceData.browserWidth
    }, args.testInstanceData.devicePixelRatio)];

    args.compareOptions.ignoreRectangles = statusBarBlockOut;
  }

  if (args.debug) {
    console.log('\n####################################################');
    console.log('args.compareOptions = ', args.compareOptions);
    console.log('####################################################\n');
  }

  return new Promise<number>(resolve => {
    resembleJS(imageComparisonPaths.baselineImage, imageComparisonPaths.actualImage, args.compareOptions)
      .onComplete(data => {
        if (Number(data.misMatchPercentage) > 0 || args.debug) {
          data.getDiffImage().pack().pipe(createWriteStream(imageComparisonPaths.imageDiffPath));
        }
        resolve(Number(data.misMatchPercentage));
      });
  });
}

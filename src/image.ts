import * as PNGImage from 'png-image';
import {SaveCroppedScreenshotOptions} from "./interfaces";
import {formatFileName} from "./utils";
import {join} from "path";

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

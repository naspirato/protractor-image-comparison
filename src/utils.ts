const camelCase = require('camel-case');
import {Rectangles, SaveCroppedScreenshotOptions} from "./interfaces";
import {takeScreenshot} from "./webdriverMethods";

/**
 * Checks if the OS is Android
 * @param {string} platformName
 * @returns {boolean}
 */
export function isAndroid(platformName: string): boolean {
  return platformName.toLowerCase() === 'android';
}

/**
 * Checks if the os is ios
 * @param {string} platformName
 * @returns {boolean}
 */
export function isIOS(platformName: string): boolean {
  return platformName.toLowerCase() === 'ios';
}

/**
 * For Appium and Perfecto the platformName needs to be provided, this will tell if the test is executed on mobile
 * @returns {boolean}
 * @param {string} platformName
 */
export function isMobile(platformName: string): boolean {
  return platformName !== '';
}

/**
 * Checks if the browser is firefox
 * @param {string} browserName
 * @returns {boolean}
 */
export function isFirefox(browserName: string): boolean {
  return browserName === 'firefox';
}

/**
 * Get a buffered screenshot
 * @return {Promise<Buffer>}
 */
export async function getBufferedScreenshot(): Promise<Buffer> {
  return new Buffer(await takeScreenshot(), 'base64');
}

/**
 * Calculate the rectangles based on the device pixel ratio
 * @param {Rectangles} rectangles
 * @param {number} devicePixelRatio
 * @return {Rectangles}
 */
export function calculateDprRectangles(rectangles: Rectangles, devicePixelRatio: number) {
  Object.keys(rectangles).map((key) => rectangles[key] *= devicePixelRatio);

  return rectangles;
}

/**
 * Create a formatted filename based on a given fileformat
 * @param {SaveCroppedScreenshotOptions} args
 * @return {string}
 */
export function formatFileName(args: SaveCroppedScreenshotOptions) {
  const defaults = {
    'browserName': args.browserName,
    'deviceName': args.deviceName,
    'dpr': args.devicePixelRatio,
    'height': args.browserHeight,
    'logName': camelCase(args.logName),
    'mobile': args.isMobile && args.testInBrowser ? args.browserName : args.isMobile ? 'app' : '',
    'name': args.name,
    'tag': args.tag,
    'width': args.browserWidth
  };
  let formatString = args.formatString;

  Object.keys(defaults)
    .forEach((value) =>
      formatString = formatString.replace(`{${value}}`, defaults[value])
    );

  return formatString + '.png';
}

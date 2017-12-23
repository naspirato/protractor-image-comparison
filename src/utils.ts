// const camelCase = require('camel-case');
import {Rectangles} from "./interfaces";
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

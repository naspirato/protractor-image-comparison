import {browser} from "protractor";

/**
 * Schedule a command to take a screenshot. The driver makes a best effort to
 * return a screenshot of the following, in order of preference:
 *
 * Entire page
 * Current window
 * Visible portion of the current frame
 * The screenshot of the entire display containing the browser
 * @return {Promise<string>} A promise that will be
 * resolved to the screenshot as a base-64 encoded PNG.
 */
export async function takeScreenshot(): Promise<string> {
  return browser.takeScreenshot();
}

/**
 * Schedules a command to execute JavaScript in the context of the currently
 * selected frame or window. The script fragment will be executed as the body
 * of an anonymous function. If the script is provided as a function object,
 * that function will be converted to a string for injection into the target
 * window.
 *
 * Any arguments provided in addition to the script will be included as script
 * arguments and may be referenced using the {@code arguments} object.
 * Arguments may be a boolean, number, string, or {@linkplain WebElement}.
 * Arrays and objects may also be used as script arguments as long as each item
 * adheres to the types previously mentioned.
 *
 * @param {Function | string} script
 * @param {...*} scriptArgs Will be an array, so access it with scriptArgs[#]
 * @return {Promise<T>} A promise that will resolve to the
 * scripts return value.
 * @template T
 */
export async function executeScript<T>(script: Function | string, ...scriptArgs: any[] ): Promise<T> {
  return browser.driver.executeScript<T>(script, scriptArgs);
}

/**
 * Get the processed configuration object that is currently being run. This
 * will contain the specs and capabilities properties of the current runner
 * instance.
 * @return {Promise<any>} A promise which resolves to the
 * capabilities object.
 */
export async function getInstanceConfiguration():Promise<any>{
  return browser.getProcessedConfig();
}

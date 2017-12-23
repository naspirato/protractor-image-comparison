import {browser} from "protractor";

export async function takeScreenshot() {
  return browser.takeScreenshot();
}

export async function executeScript<T>(script: Function | string, ...scriptArgs: any[] ): Promise<T> {
  return browser.driver.executeScript<T>(script, scriptArgs);
}

import {
  BrowserData,
  CurrentInstanceData,
  RequestCurrentInstanceData,
  RequestBrowserData,
  SetCustomCssOptions
} from "./interfaces";
import {
  isAndroid,
  isFirefox,
  isIOS,
  isMobile
} from "./utils";
import {
  executeScript,
  getInstanceConfiguration
} from "./webdriverMethods";

/**
 * Schedules a command to retrieve all the current instance data
 * @param {RequestCurrentInstanceData} args
 * @return {Promise<CurrentInstanceData>}
 */
export async function getCurrentInstanceData(args: RequestCurrentInstanceData): Promise<CurrentInstanceData> {
  // Get the current configuration of the instance that is running
  const instanceConfig = (await getInstanceConfiguration()).capabilities;
  // Substract the needed data from the running instance
  const browserName = (instanceConfig.browserName || '').toLowerCase();
  const logName = instanceConfig.logName || '';
  const name = instanceConfig.name || '';
  const testInBrowser = browserName !== '';

  // For mobile
  const platformName = (instanceConfig.platformName || '').toLowerCase();
  const deviceName = (instanceConfig.deviceName || '').toLowerCase();
  // args.nativeWebScreenshot of the constructor can be overruled by the capabilities when the constructor value is false
  const nativeWebScreenshot = !args.nativeWebScreenshot ? !!instanceConfig.nativeWebScreenshot : args.nativeWebScreenshot;
  const testInMobileBrowser = !args.SAVE_TYPE.screen && isMobile(platformName) && args.testInBrowser;
  const addressBarShadowPadding = (testInMobileBrowser && ((nativeWebScreenshot && isAndroid(platformName)) || isIOS(platformName)))
    ? args.addressBarShadowPadding
    : 0;
  const toolBarShadowPadding = (testInMobileBrowser && isIOS(platformName)) ? args.toolBarShadowPadding : 0;

  // Get the actual browserdata
  const browserData = await getBrowserData({
    browserName,
    platformName,
    defaultDevicePixelRatio: args.devicePixelRatio,
    addressBarShadowPadding,
    toolBarShadowPadding
  });

  return {
    addressBarShadowPadding,
    browserName,
    deviceName,
    logName,
    name,
    nativeWebScreenshot,
    platformName,
    testInBrowser,
    toolBarShadowPadding,
    ...browserData
  };
}

/**
 * Schedules a command to execute Javscript in the context of the currently
 * selected frame or window to set some css before screenshots are made
 * @param {SetCustomCssOptions} args
 * @return {Promise<void>}
 */
export async function setCustomCss(args: SetCustomCssOptions): Promise<void> {
  function setCss(args) {
    const animation = '* {' +
      '-webkit-transition-duration: 0s !important;' +
      'transition-duration: 0s !important;' +
      '-webkit-animation-duration: 0s !important;' +
      'animation-duration: 0s !important;' +
      '}',
      scrollBar = '*::-webkit-scrollbar { display:none; !important}',
      bodyTopPadding = args.addressBarShadowPadding === 0 ? '' : `body{padding-top: ${args.addressBarShadowPadding}px !important}`,
      bodyBottomPadding = args.toolBarShadowPadding === 0 ? '' : `body{padding-bottom: ${args.toolBarShadowPadding}px !important}`,
      css = (args.disableCSSAnimation ? animation : '') + (args.hideScrollBars ? scrollBar : '') + bodyTopPadding + bodyBottomPadding,
      head = document.head || document.getElementsByTagName('head')[0],
      style = document.createElement('style');

    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
  }

  return executeScript<void>(
    setCss,
    {
      disableCSSAnimation: args.disableCSSAnimation,
      hideScrollBars: args.hideScrollBars,
      addressBarShadowPadding: args.addressBarShadowPadding,
      toolBarShadowPadding: args.toolBarShadowPadding
    });
}

/**
 * Schedules a command to get the data of the browser of the current instance
 * @param {RequestBrowserData} getBrowserDataArguments
 * @return {Promise<BrowserData>}
 */
async function getBrowserData(getBrowserDataArguments: RequestBrowserData): Promise<BrowserData> {
  // For viewPortWidth use document.body.clientWidth so we don't get the scrollbar included in the size
  function retrieveBrowserData(retrieveBrowserDataArguments): BrowserData {
    const args = retrieveBrowserDataArguments[0];
    const fullPageHeight = document.body.scrollHeight - (args.addressBarShadowPadding + args.toolBarShadowPadding);
    const fullPageWidth = document.body.scrollWidth;
    // Firefox creates screenshots in a different way. Although it could be taken on a Retina screen,
    // the screenshot is returned in its original (no factor x is used) dimensions
    const devicePixelRatio = args.isFirefox ? args.defaultDevicePixelRatio : window.devicePixelRatio;
    const viewPortWidth = document.body.clientWidth;
    const viewPortHeight = window.innerHeight;
    const height = args.isMobile ? window.screen.height : window.outerHeight;
    const width = args.isMobile ? window.screen.width : window.outerWidth;
    const browserHeight = height !== 0 ? height : viewPortHeight;
    const browserWidth = width !== 0 ? width : viewPortWidth;
    return {
      browserHeight,
      browserWidth,
      devicePixelRatio,
      fullPageHeight,
      fullPageWidth,
      viewPortHeight,
      viewPortWidth
    };
  }

  return executeScript<BrowserData>(
    retrieveBrowserData,
    {
      addressBarShadowPadding: getBrowserDataArguments.addressBarShadowPadding,
      defaultDevicePixelRatio: getBrowserDataArguments.defaultDevicePixelRatio,
      isFirefox: isFirefox(getBrowserDataArguments.browserName),
      isMobile: isMobile(getBrowserDataArguments.platformName),
      toolBarShadowPadding: getBrowserDataArguments.toolBarShadowPadding
    }
  );
}

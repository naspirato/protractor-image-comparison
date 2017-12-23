import {BrowserData, RequestBrowserData} from "./interfaces";
import {isAndroid, isFirefox, isIOS, isMobile} from "./utils";
import {executeScript} from "./webdriverMethods";
import {browser} from "protractor";

async function getBrowserData(args: RequestBrowserData): Promise<BrowserData> {
  // For viewPortWidth use document.body.clientWidth so we don't get the scrollbar included in the size
  function retrieveBrowserData(args): BrowserData {

    const fullPageHeight = document.body.scrollHeight - args.addressBarShadowPadding - args.toolBarShadowPadding;
    const fullPageWidth = document.body.scrollWidth;
    const height = args.isMobile ? window.screen.height : window.outerHeight;
    const pixelRatio = window.devicePixelRatio;
    const viewPortWidth = document.body.clientWidth;
    const viewPortHeight = window.innerHeight;
    const width = args.isMobile ? window.screen.width : window.outerWidth;

    return {
      browserHeight: height !== 0 ? height : viewPortHeight,
      browserWidth: width !== 0 ? width : viewPortWidth,
      // Firefox creates screenshots in a different way. Although it could be taken on a Retina screen,
      // the screenshot is returned in its original (no factor x is used) dimensions
      devicePixelRatio: args.isFirefox ? args.defaultDevicePixelRatio : pixelRatio,
      fullPageHeight: fullPageHeight,
      fullPageWidth: fullPageWidth,
      viewPortHeight: viewPortHeight,
      viewPortWidth: viewPortWidth
    };
  }

  return executeScript<BrowserData>(
    retrieveBrowserData,
    {
      addressBarShadowPadding: args.addressBarShadowPadding,
      defaultDevicePixelRatio: args.defaultDevicePixelRatio,
      isFirefox: isFirefox(args.browserName),
      isMobile: isMobile(args.platformName),
      toolBarShadowPadding: args.toolBarShadowPadding
    }
  );
}

// @TODO: define interface!!
export async function getCurrentInstanceData(args): Promise<any> {
  // Get the current configuration of the instance that is running
  const instanceConfig: any = (await browser.getProcessedConfig()).capabilities;

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
    defaultDevicePixelRatio: args.defaultDevicePixelRatio,
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

export async function setCustomTestCSS(params: any): Promise<void> {

  function setCSS(args) {
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
    setCSS,
    {
      disableCSSAnimation: params.disableCSSAnimation,
      hideScrollBars: this.hideScrollBars,
      addressBarShadowPadding: params.addressBarShadowPadding,
      toolBarShadowPadding: params.toolBarShadowPadding
    });
}

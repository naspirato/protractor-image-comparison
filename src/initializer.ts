import {getCurrentInstanceData, setCustomCss} from "./currentInstance";
import {SAVE_TYPE, TEST_IN_BROWSER} from "./constants";
import {InstanceData, Initializer, TestInstanceData} from "./interfaces";
import {formatFileName, isMobile} from "./utils";

/**
 * Execute all the initial steps like get the instancedata, set the custom css and get the filename.
 * @param {Initializer} args
 * @return {Promise<TestInstanceData>}
 */
export async function instanceInitializer(args:Initializer):Promise<TestInstanceData>{
  const instanceData: InstanceData = await getCurrentInstanceData({
    SAVE_TYPE,
    devicePixelRatio: args.devicePixelRatio,
    testInBrowser: TEST_IN_BROWSER,
    nativeWebScreenshot: args.nativeWebScreenshot,
    addressBarShadowPadding: args.addressBarShadowPadding,
    toolBarShadowPadding: args.toolBarShadowPadding
  });

  // Set some CSS
  await setCustomCss({
    addressBarShadowPadding: instanceData.addressBarShadowPadding,
    disableCSSAnimation: args.disableCSSAnimation,
    hideScrollBars: args.hideScrollBars,
    toolBarShadowPadding: instanceData.toolBarShadowPadding
  });

  // Get the file name
  const fileName = formatFileName({
    browserHeight: instanceData.browserHeight,
    browserName: instanceData.browserName,
    browserWidth: instanceData.browserWidth,
    deviceName: instanceData.deviceName,
    devicePixelRatio: instanceData.devicePixelRatio,
    formatString: args.formatString,
    isMobile: isMobile(instanceData.platformName),
    name: instanceData.name,
    logName: instanceData.logName,
    tag: args.tag,
    testInBrowser: instanceData.testInBrowser
  });

  return {
    ...instanceData,
    fileName
  };
}

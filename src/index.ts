import {ensureDirSync} from 'fs-extra';
import {ok} from 'assert';
import {join, normalize} from 'path';
import {calculateDprRectangles, formatFileName, getBufferedScreenshot, isMobile} from './utils';
import {
  ACTUAL_FOLDER, AUTO_SAVE_BASELINE, DEBUG,
  DEFAULT_FILE_FORMAT_STRING,
  DIFF_FOLDER,
  DISABLE_CSS_ANIMATION,
  HIDE_SCROLLBARS, IGNORE_ANTIALIASING, IGNORE_COLORS, IGNORE_TRANSPARENT_PIXEL,
  SAVE_TYPE,
  TEMP_FULLSCREENSHOT_FOLDER,
  TEST_IN_BROWSER
} from "./constants";
import {
  CheckScreenOptions,
  CurrentInstanceData,
  Rectangles,
  SaveScreenOptions
} from "./interfaces";
import {initCheckScreenOptions, initSaveScreenOptions} from "./initOptions";
import {getCurrentInstanceData, setCustomCss} from "./currentInstance";
import {checkImageExists, executeImageComparison, saveCroppedScreenshot} from "./image";

export class protractorImageComparison {
  private disableCSSAnimation: boolean;
  private baselineFolder: string;
  private baseFolder: string;
  private autoSaveBaseline: boolean;
  private debug: boolean;
  private hideScrollBars: boolean;
  private formatString: string;
  private nativeWebScreenshot: boolean;
  private blockOutStatusBar: boolean;
  private ignoreAntialiasing: boolean;
  private ignoreColors: boolean;
  private ignoreTransparentPixel: boolean;
  private actualFolder: string;
  private addressBarShadowPadding: number;
  private androidOffsets: any;
  private diffFolder: string;
  private devicePixelRatio: number;
  // private fullPageHeight: number;
  // private fullPageWidth: number;
  // private formatOptions: any;
  private iosOffsets: any;
  // private isLastScreenshot: boolean;
  // private resizeDimensions: number;
  // private screenshotHeight: number;
  private tempFullScreenFolder: string;
  // private fullPageScrollTimeout: number;
  private toolBarShadowPadding: number;
  // private viewPortHeight: number;
  // private viewPortWidth: number;

  constructor(options: any) {
    ok(options.baselineFolder, 'Image baselineFolder not given.');
    ok(options.screenshotPath, 'Image screenshotPath not given.');

    this.baselineFolder = normalize(options.baselineFolder);
    this.baseFolder = normalize(options.screenshotPath);
    this.autoSaveBaseline = options.autoSaveBaseline || AUTO_SAVE_BASELINE;
    this.debug = options.debug || DEBUG;
    this.disableCSSAnimation = options.disableCSSAnimation || DISABLE_CSS_ANIMATION;
    this.hideScrollBars = options.hideScrollBars !== HIDE_SCROLLBARS;
    this.formatString = options.formatImageName || DEFAULT_FILE_FORMAT_STRING;

    this.nativeWebScreenshot = !!options.nativeWebScreenshot;
    this.blockOutStatusBar = !!options.blockOutStatusBar;

    this.ignoreAntialiasing = options.ignoreAntialiasing || IGNORE_ANTIALIASING;
    this.ignoreColors = options.ignoreColors || IGNORE_COLORS;
    this.ignoreTransparentPixel = options.ignoreTransparentPixel || IGNORE_TRANSPARENT_PIXEL;

    // OS offsets
    let androidOffsets = options.androidOffsets && typeof options.androidOffsets === 'object' ? options.androidOffsets : {};
    let iosOffsets = options.iosOffsets && typeof options.iosOffsets === 'object' ? options.iosOffsets : {};

    let androidDefaultOffsets = {
      statusBar: 24,
      addressBar: 56,
      addressBarScrolled: 0,
      toolBar: 48
    };
    let iosDefaultOffsets = {
      statusBar: 20,
      addressBar: 44,
      addressBarScrolled: 19,
      toolBar: 44
    };

    this.actualFolder = join(this.baseFolder, ACTUAL_FOLDER);
    this.addressBarShadowPadding = 6;
    this.androidOffsets = {...androidDefaultOffsets, ...androidOffsets};
    this.diffFolder = join(this.baseFolder, DIFF_FOLDER);
    this.devicePixelRatio = 1;
    // this.formatOptions = options.formatImageOptions || {};
    // this.fullPageHeight = 0;
    // this.fullPageWidth = 0;
    this.iosOffsets = {...iosDefaultOffsets, ...iosOffsets};
    // this.isLastScreenshot = false;
    // this.resizeDimensions = 0;
    // this.screenshotHeight = 0;
    this.tempFullScreenFolder = join(this.baseFolder, TEMP_FULLSCREENSHOT_FOLDER);
    // this.fullPageScrollTimeout = 1500;
    this.toolBarShadowPadding = 6;
    // this.viewPortHeight = 0;
    // this.viewPortWidth = 0;

    ensureDirSync(this.actualFolder);
    ensureDirSync(this.baselineFolder);
    ensureDirSync(this.diffFolder);

    if (this.debug) {
      ensureDirSync(this.tempFullScreenFolder);
    }
  }

  /**
   * Runs the comparison against the screen
   *
   * @method checkScreen
   *
   * @example
   * // default
   * browser.protractorImageComparison.checkScreen('imageA');
   * // Blockout the statusbar
   * browser.protractorImageComparison.checkScreen('imageA', {blockOutStatusBar: true});
   * // Blockout a given region
   * browser.protractorImageComparison.checkScreen('imageA', {blockOut: [{x: 10, y: 132, width: 100, height: 50}]});
   * // Disable css animation on all elements
   * browser.protractorImageComparison.checkScreen('imageA', {disableCSSAnimation: true});
   * // Ignore antialiasing
   * browser.protractorImageComparison.checkScreen('imageA', {ignoreAntialiasing: true});
   * // Ignore colors
   * browser.protractorImageComparison.checkScreen('imageA', {ignoreColors: true});
   * // Ignore alpha pixel
   * browser.protractorImageComparison.checkScreen('imageA', {ignoreTransparentPixel: true});
   *
   * @param {string} tag The tag that is used
   * @param {object} options (non-default) options
   * @param {boolean} options.blockOutStatusBar blockout the statusbar yes or no, it will override the global
   * @param {object} options.blockOut blockout with x, y, width and height values
   * @param {boolean} options.disableCSSAnimation enable or disable CSS animation
   * @param {boolean} options.ignoreAntialiasing compare images an discard anti aliasing
   * @param {boolean} options.ignoreColors Even though the images are in colour, the comparison wil compare 2 black/white images
   * @param {boolean} options.ignoreTransparentPixel Will ignore all pixels that have some transparency in one of the images
   * @return {Promise} When the promise is resolved it will return the percentage of the difference
   * @public
   */
  public async checkScreen(tag, options): Promise<void> {
    const checkScreenOptions: CheckScreenOptions = initCheckScreenOptions(
      this.blockOutStatusBar,
      this.disableCSSAnimation,
      this.ignoreAntialiasing,
      this.ignoreColors,
      this.ignoreTransparentPixel,
      options
    );
    SAVE_TYPE.screen = true;

    const instanceData: CurrentInstanceData = await getCurrentInstanceData({
      SAVE_TYPE,
      devicePixelRatio: this.devicePixelRatio,
      testInBrowser: TEST_IN_BROWSER,
      nativeWebScreenshot: this.nativeWebScreenshot,
      addressBarShadowPadding: this.addressBarShadowPadding,
      toolBarShadowPadding: this.toolBarShadowPadding
    });

    // Save the screenshot
    await this.saveScreen(
      tag,
      {
        disableCSSAnimation: checkScreenOptions.disableCSSAnimation,
        hideScrollBars: this.hideScrollBars
      },
      instanceData);

    // Get the file name
    const fileName = formatFileName({
      browserHeight: instanceData.browserHeight,
      browserName: instanceData.browserName,
      browserWidth: instanceData.browserWidth,
      deviceName: instanceData.deviceName,
      devicePixelRatio: instanceData.devicePixelRatio,
      formatString: this.formatString,
      isMobile: isMobile(instanceData.platformName),
      name: instanceData.name,
      logName: instanceData.logName,
      tag,
      testInBrowser: instanceData.testInBrowser
    });

    // Check if the image exists
    checkImageExists({
      actualFolder: this.actualFolder,
      autoSaveBaseline: this.autoSaveBaseline,
      baselineFolder: this.baselineFolder,
      fileName: fileName
    });

    // Compare the image
    return executeImageComparison(
      {
        actualFolder: this.actualFolder,
        baselineFolder: this.baselineFolder,
        diffFolder: this.diffFolder,
        fileName: fileName
      },
      checkScreenOptions,
      {
        androidOffsets: this.androidOffsets,
        blockOutStatusBar: this.blockOutStatusBar,
        debug: this.debug,
        iosOffsets: this.iosOffsets
      },
      instanceData);
  }

  /**
   * Saves an image of the screen
   *
   * @method saveScreen
   *
   * @example
   * // Default
   * browser.protractorImageComparison.saveScreen('imageA');
   * // Disable css animation on all elements
   * browser.protractorImageComparison.saveScreen('imageA',{disableCSSAnimation: true});
   *
   * @param {string} tag The tag that is used
   * @param {SaveScreenOptions} options (non-default) options
   * @param {boolean} options.disableCSSAnimation enable or disable CSS animation
   * @param {boolean} options.hideScrollBars hide or show scrollbars
   * @param {CurrentInstanceData} instance
   * @return {Promise<void>}
   * @public
   */
  public async saveScreen(tag: string, options?: SaveScreenOptions, instance?: CurrentInstanceData): Promise<void> {
    const saveScreenOptions: SaveScreenOptions = initSaveScreenOptions(
      this.disableCSSAnimation,
      this.hideScrollBars,
      options
    );
    SAVE_TYPE.screen = true;

    const instanceData: CurrentInstanceData = instance || await getCurrentInstanceData({
      SAVE_TYPE,
      devicePixelRatio: this.devicePixelRatio,
      testInBrowser: TEST_IN_BROWSER,
      nativeWebScreenshot: this.nativeWebScreenshot,
      addressBarShadowPadding: this.addressBarShadowPadding,
      toolBarShadowPadding: this.toolBarShadowPadding
    });

    // Set some CSS
    await setCustomCss({
      addressBarShadowPadding: instanceData.addressBarShadowPadding,
      disableCSSAnimation: saveScreenOptions.disableCSSAnimation,
      hideScrollBars: saveScreenOptions.hideScrollBars,
      toolBarShadowPadding: instanceData.toolBarShadowPadding
    });

    // Create a screenshot and save it as a buffer
    const bufferedScreenshot: Buffer = await getBufferedScreenshot();
    const screenshotHeight: number = (bufferedScreenshot.readUInt32BE(20) / instanceData.devicePixelRatio); // width = 16
    const rectangles: Rectangles = calculateDprRectangles({
      height: screenshotHeight > instanceData.viewPortHeight ? screenshotHeight : instanceData.viewPortHeight,
      width: instanceData.viewPortWidth,
      x: 0,
      y: 0
    }, instanceData.devicePixelRatio);

    await saveCroppedScreenshot({
      browserHeight: instanceData.browserHeight,
      browserName: instanceData.browserName,
      browserWidth: instanceData.browserWidth,
      bufferedScreenshot,
      deviceName: instanceData.deviceName,
      devicePixelRatio: instanceData.devicePixelRatio,
      folder: this.actualFolder,
      formatString: this.formatString,
      isMobile: isMobile(instanceData.platformName),
      name: instanceData.name,
      logName: instanceData.logName,
      rectangles,
      tag,
      testInBrowser: instanceData.testInBrowser
    });
  }
}

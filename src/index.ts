import {ensureDirSync} from 'fs-extra';
import {ok} from 'assert';
import {join, normalize} from 'path';
import {calculateDprRectangles, getBufferedScreenshot} from './utils';
import {
  ACTUAL_FOLDER, AUTO_SAVE_BASELINE, DEBUG,
  DEFAULT_FILE_FORMAT_STRING,
  DIFF_FOLDER,
  DISABLE_CSS_ANIMATION,
  HIDE_SCROLLBARS,
  IGNORE_ANTIALIASING,
  IGNORE_COLORS,
  IGNORE_TRANSPARENT_PIXEL,
  SAVE_TYPE,
  TEMP_FULLSCREENSHOT_FOLDER,
  TEST_IN_BROWSER
} from "./constants";
import {
  CheckScreenOptions, Folders,
  Rectangles,
  SaveScreenOptions, TestInstanceData
} from "./interfaces";
import {initCheckScreenOptions, initSaveScreenOptions} from "./initOptions";
import {checkImageExists, executeImageComparison, saveCroppedScreenshot} from "./image";
import {instanceInitializer} from "./initializer";

export class protractorImageComparison {
  private disableCSSAnimation: boolean;
  private autoSaveBaseline: boolean;
  private debug: boolean;
  private hideScrollBars: boolean;
  private folders: Folders;
  private formatString: string;
  private nativeWebScreenshot: boolean;
  private blockOutStatusBar: boolean;
  private ignoreAntialiasing: boolean;
  private ignoreColors: boolean;
  private ignoreTransparentPixel: boolean;
  private addressBarShadowPadding: number;
  private androidOffsets: {
    addressBar: number;
    addressBarScrolled: number;
    statusBar: number;
    toolBar: number;
  };
  private devicePixelRatio: number;
  // private fullPageHeight: number;
  // private fullPageWidth: number;
  // private formatOptions: any;
  private iosOffsets: {
    addressBar: number;
    addressBarScrolled: number;
    statusBar: number;
    toolBar: number;
  };
  // private isLastScreenshot: boolean;
  // private resizeDimensions: number;
  // private screenshotHeight: number;
  // private fullPageScrollTimeout: number;
  private toolBarShadowPadding: number;
  // private viewPortHeight: number;
  // private viewPortWidth: number;

  constructor(options: any) {
    ok(options.baselineFolder, 'Image baselineFolder not given.');
    ok(options.screenshotPath, 'Image screenshotPath not given.');

    const baseFolder = normalize(options.screenshotPath);

    this.folders = {
      actualFolder: join(baseFolder, ACTUAL_FOLDER),
      baselineFolder: normalize(options.baselineFolder),
      baseFolder: normalize(options.screenshotPath),
      diffFolder: join(baseFolder, DIFF_FOLDER),
      tempFullScreenFolder: join(baseFolder, TEMP_FULLSCREENSHOT_FOLDER)
    };

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

    this.addressBarShadowPadding = 6;
    this.androidOffsets = {...androidDefaultOffsets, ...androidOffsets};
    this.devicePixelRatio = 1;
    // this.formatOptions = options.formatImageOptions || {};
    // this.fullPageHeight = 0;
    // this.fullPageWidth = 0;
    this.iosOffsets = {...iosDefaultOffsets, ...iosOffsets};
    // this.isLastScreenshot = false;
    // this.resizeDimensions = 0;
    // this.screenshotHeight = 0;
    // this.fullPageScrollTimeout = 1500;
    this.toolBarShadowPadding = 6;
    // this.viewPortHeight = 0;
    // this.viewPortWidth = 0;

    ensureDirSync(this.folders.actualFolder);
    ensureDirSync(this.folders.baselineFolder);
    ensureDirSync(this.folders.diffFolder);

    if (this.debug) {
      ensureDirSync(this.folders.tempFullScreenFolder);
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
   * @param {boolean} options.hideScrollBars hide or show scrollbars
   * @param {boolean} options.ignoreAntialiasing compare images an discard anti aliasing
   * @param {boolean} options.ignoreColors Even though the images are in colour, the comparison wil compare 2 black/white images
   * @param {boolean} options.ignoreTransparentPixel Will ignore all pixels that have some transparency in one of the images
   * @return {Promise} When the promise is resolved it will return the percentage of the difference
   * @public
   */
  public async checkScreen(tag, options): Promise<number> {
    const checkScreenOptions: CheckScreenOptions = initCheckScreenOptions(
      this.blockOutStatusBar,
      this.disableCSSAnimation,
      this.hideScrollBars,
      this.ignoreAntialiasing,
      this.ignoreColors,
      this.ignoreTransparentPixel,
      options
    );
    SAVE_TYPE.screen = true;

    const testInstanceData: TestInstanceData = await instanceInitializer({
      addressBarShadowPadding: this.addressBarShadowPadding,
      devicePixelRatio: this.devicePixelRatio,
      disableCSSAnimation: checkScreenOptions.disableCSSAnimation,
      hideScrollBars: checkScreenOptions.hideScrollBars,
      formatString: this.formatString,
      nativeWebScreenshot: this.nativeWebScreenshot,
      SAVE_TYPE,
      tag,
      testInBrowser: TEST_IN_BROWSER,
      toolBarShadowPadding: this.toolBarShadowPadding
    });

    // Save the screenshot
    await this.saveScreen(
      tag,
      {
        disableCSSAnimation: checkScreenOptions.disableCSSAnimation,
        hideScrollBars: this.hideScrollBars
      },
      testInstanceData);

    // Check if the image exists
    checkImageExists({
      autoSaveBaseline: this.autoSaveBaseline,
      ...this.folders,
      fileName: testInstanceData.fileName
    });

    // Compare the image
    return executeImageComparison(
      {
        blockOutStatusBar: this.blockOutStatusBar,
        debug: this.debug,
        compareOptions: checkScreenOptions,
        offsets: {
          android: this.androidOffsets,
          ios: this.iosOffsets
        },
        folders: this.folders,
        testInstanceData
      });
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
   * @param {TestInstanceData} testInstance
   * @return {Promise<void>}
   * @public
   */
  public async saveScreen(tag: string, options?: SaveScreenOptions, testInstance?: TestInstanceData): Promise<void> {
    const saveScreenOptions: SaveScreenOptions = initSaveScreenOptions(
      this.disableCSSAnimation,
      this.hideScrollBars,
      options
    );
    SAVE_TYPE.screen = true;

    const testInstanceData: TestInstanceData = testInstance || await instanceInitializer({
      addressBarShadowPadding: this.addressBarShadowPadding,
      devicePixelRatio: this.devicePixelRatio,
      disableCSSAnimation: saveScreenOptions.disableCSSAnimation,
      hideScrollBars: saveScreenOptions.hideScrollBars,
      formatString: this.formatString,
      nativeWebScreenshot: this.nativeWebScreenshot,
      SAVE_TYPE,
      tag,
      testInBrowser: TEST_IN_BROWSER,
      toolBarShadowPadding: this.toolBarShadowPadding
    });

    // Create a screenshot and save it as a buffer
    const bufferedScreenshot: Buffer = await getBufferedScreenshot();
    const screenshotHeight: number = (bufferedScreenshot.readUInt32BE(20) / testInstanceData.devicePixelRatio); // width = 16
    const rectangles: Rectangles = calculateDprRectangles({
      height: screenshotHeight > testInstanceData.viewPortHeight ? screenshotHeight : testInstanceData.viewPortHeight,
      width: testInstanceData.viewPortWidth,
      x: 0,
      y: 0
    }, testInstanceData.devicePixelRatio);

    // Save the screenshot
    await saveCroppedScreenshot({
      bufferedScreenshot,
      fileName: testInstanceData.fileName,
      folder: this.folders.actualFolder,
      rectangles
    });
  }
}

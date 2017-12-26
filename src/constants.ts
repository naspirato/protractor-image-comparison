import {SaveType} from "./interfaces";

export const SAVE_TYPE: SaveType = {
  element: false,
  fullPage: false,
  screen: false
};

export const AUTO_SAVE_BASELINE = false;
export const DEBUG = false;
export const IGNORE_ANTIALIASING = false;
export const IGNORE_COLORS = false;
export const IGNORE_TRANSPARENT_PIXEL = false;
export const TEST_IN_BROWSER = false;
export const DISABLE_CSS_ANIMATION = false;
export const HIDE_SCROLLBARS = false;
export const DEFAULT_FILE_FORMAT_STRING = '{tag}-{browserName}-{width}x{height}-dpr-{dpr}';
export const ACTUAL_FOLDER = 'actual';
export const DIFF_FOLDER = 'diff';
export const TEMP_FULLSCREENSHOT_FOLDER = 'tempFullScreen';

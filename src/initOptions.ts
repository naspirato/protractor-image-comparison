import {SaveScreenOptions} from "./interfaces";

export function initSaveScreenOptions(disableCSSAnimation,
                                      hideScrollBars,
                                      options?: SaveScreenOptions): SaveScreenOptions {
  return {
    disableCSSAnimation,
    hideScrollBars,
    ...(options)
  };
}

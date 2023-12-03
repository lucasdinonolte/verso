import { isBrowser } from './utils.js';

let raf = null;
let immediate = null;

/**
 * Returns the time in milliseconds of the current frame
 *
 * @param {number} frame - current frame number
 * @param {number} fps - frames per second
 * @returns {number}
 */
const calculateTime = (frame, fps) => (1000 / fps) * frame;

/**
 * Calculates the playhead of the animation ranging from 0 to 1
 *
 * @param {number} frame - current frame number
 * @param {number} maxFrames - total number of frames
 * @returns {number}
 */
const calculatePlayhead = (frame, maxFrames) => frame / maxFrames;

const drawloopBrowser = async ({ fps = 60, maxFrames, onFrame, onDone }) => {
  // Cancel any previous drawloop
  if (raf != null) window.cancelAnimationFrame(raf);

  let frameCount = 1;
  let lastFrameTime = 0;

  // Allow the drawloop's callback invocation to vary by 5ms around the
  // mathematically correct time to draw new frame. This is done so we do not
  // unnecessarily draw frames overextend the browser. See comment below.
  const EPSILON = 5;
  const fpsInterval = 1000 / fps;

  const draw = async () => {
    const now = performance.now();
    const elapsed = now - lastFrameTime;

    // The Epsilon is taken from p5's solution. Also copying their
    // comment on why they do it here.
    //
    // From p5 source:
    // only draw if we really need to; don't overextend the browser.
    // draw if we're within 5ms of when our next frame should paint
    // (this will prevent us from giving up opportunities to draw
    // again when it's really about time for us to do so). fixes an
    // issue where the frameRate is too low if our refresh loop isn't
    // in sync with the browser. note that we have to draw once even
    // if looping is off, so we bypass the time delay if that
    // is the case.
    if (elapsed >= fpsInterval - EPSILON) {
      await onFrame({
        frame: frameCount,
        time: calculateTime(frameCount, fps),
        playhead: calculatePlayhead(frameCount, maxFrames),
      });
      frameCount++;
      lastFrameTime = now;
    }

    if (frameCount <= maxFrames) {
      raf = window.requestAnimationFrame(draw);
    } else {
      onDone?.();
    }
  };

  await draw();
};

const drawloopNode = async ({ fps = 60, maxFrames, onFrame, onDone }) => {
  if (immediate != null) clearImmediate(immediate);
  let frameCount = 1;

  const draw = async () => {
    await onFrame({
      frame: frameCount,
      time: calculateTime(frameCount, fps),
      playhead: calculatePlayhead(frameCount, maxFrames),
    });
    frameCount++;

    if (frameCount <= maxFrames) {
      setImmediate(draw);
    } else {
      onDone?.();
    }
  };

  await draw();
};

const drawloop = isBrowser ? drawloopBrowser : drawloopNode;

export { drawloop };

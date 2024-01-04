import * as MP4Muxer from 'mp4-muxer';
import { drawloop, mergeSettings } from '@verso/core';

import { renderToCanvas } from '../renderers/canvas.js';
import { createCanvas } from '../util/canvas.js';

/**
 * Utility function to calculate an ideal bitrate for the video if
 * the user didn't specify one. It aims at 0.3 bits per pixel, which
 * sits at the higher end of bitrates youtube recommends for uploads.
 *
 * See: https://support.google.com/youtube/answer/1722171?hl=en#zippy=%2Cframe-rate%2Cbitrate
 * See: http://www.silverjuke.net/public/misc/bitrate-calculator
 *
 * @param {number} width - width of the video in pixels
 * @param {number} height - height of the video in pixels
 * @param {number} framerate - frameRate of the video in fps
 *
 * @returns {number} bitrate in bits per second
 */
const calculateBitrate = (width, height, framerate) => {
  const pixels = width * height;
  const bitsPerPixel = 0.3;
  return Math.floor(pixels * bitsPerPixel * framerate);
};

const exportToVideoFactory =
  ({
    mimeType,
    extension,
    multiplexer,
    muxerCodec,
    encoderCodec,
    validateDimensions = () => { },
  }) =>
    async (sketch, _options = {}) => {
      const options = mergeSettings(_options);

      let multiplexerInstance;
      let encoderInstance;
      let videoWidth;
      let videoHeight;
      let frameCounter = 0;

      // While the WebCodecs API has fairly good support in modern versions
      // of Chrome, it is still a working draft. So we shouldn't treat it like
      // a browser standard.
      //
      // See: https://caniuse.com/webcodecs
      const supportsWebCodec = 'VideoEncoder' in window;

      if (!supportsWebCodec) {
        throw new Error('Video export is not supported in this browser.');
      }

      const _handleChunk = (chunk, meta) => {
        if (!multiplexerInstance) {
          throw new Error('No multiplexer instance found');
        }

        multiplexerInstance.addVideoChunk(chunk, meta);
      };

      const addFrame = async (canvas) => {
        // Both the video encoder and the multiplexer need to
        // know the dimenions of the video. So we cache them
        // in the instance after looking them up on the passed
        // frame canvas once.
        if (!videoWidth || !videoHeight) {
          const { width, height } = canvas;
          validateDimensions(width, height);

          videoWidth = width;
          videoHeight = height;
        }

        if (!multiplexerInstance) {
          multiplexerInstance = new multiplexer.Muxer({
            target: new multiplexer.ArrayBufferTarget(),
            video: {
              codec: muxerCodec,
              width: videoWidth,
              height: videoHeight,
            },
            firstTimestampBehavior: 'offset',
          });
        }

        if (!encoderInstance) {
          encoderInstance = new VideoEncoder({
            output: _handleChunk,
            error: (e) => {
              throw new Error(e);
            },
          });

          // If the user didn't specify a bitrate we calculate one
          // that’s focused on high output quality.
          const bitrate =
            options.bitRate ??
            calculateBitrate(videoWidth, videoHeight, options.fps);

          const encoderConfig = {
            codec: encoderCodec,
            width: videoWidth,
            height: videoHeight,
            bitrate: bitrate,
            framerate: options.fps,
          };

          encoderInstance.configure(encoderConfig);
        }

        // Timestamp of a video frame should be expressed
        // in micrsoseconds. One microsecond is 1/1,000,000th
        // of a second.
        const timestamp = (frameCounter * 1e6) / options.fps;
        const frame = new VideoFrame(canvas, {
          timestamp,
        });

        // Video compression works by not storing a full image
        // for every frame of the video, but instead encoding the
        // difference to the previous frame. Full frames are usually
        // called i-frames or keyframes. While the encoded frames
        // are referred to as p-frames, because they are predicted.
        //
        // We allow the user to set the number of keyframes they want
        // per second of video footage. A higher number of keyframes
        // usually means better quality (less compression) and makes
        // video footage easier on the CPU when editing.
        //
        // A higher density of keyframes will also mean that the video
        // should use a higher bitrate. Because a keyframe takes more
        // bits than a predicted frame. As bitrate is expressed in
        // bits per second a higher keyframe density overall leaves
        // less bits per keyframe. So this really is a power-user-setting
        // for people who know their way around video codecs.
        //
        // By default the keyFramesPerSecond are set to null, which
        // will leave the decision on where to include keyframes to
        // the codec. This is a good default in 99% of all cases.
        const enforceKeyFrame =
          options.keyFramesPerSecond !== null
            ? frameCounter === 0 ||
            frameCounter % (options.fps / options.keyFramesPerSecond) === 0
            : false;

        encoderInstance.encode(frame, {
          keyFrame: enforceKeyFrame,
        });

        frame.close();

        frameCounter++;
      };

      const complete = async () => {
        await encoderInstance.flush();
        multiplexerInstance.finalize();

        const { buffer } = multiplexerInstance.target;
        const blob = new Blob([buffer], { type: mimeType });

        return blob;
      };

      const maxFrames = options.animationDuration * options.fps;
      const isAnimated = maxFrames > 0;

      if (!isAnimated) {
        throw new Error('A non-animated sketch was passed to video exporter');
      }

      const isRenderFunction = typeof sketch === 'function';
      const canvas = createCanvas();
      const ctx = canvas.getContext('2d');

      return new Promise((res) => {
        drawloop({
          fps: options.fps,
          maxFrames,
          onFrame: ({ frame, time, playhead }) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const renderTree = isRenderFunction
              ? sketch({ frame, time, playhead })
              : sketch;

            renderToCanvas(renderTree, canvas);

            addFrame(canvas);
          },
          onDone: async () => {
            const blob = await complete();
            res({
              data: blob,
              mimeType,
              extension,
            });
          },
        });
      });
    };

export const exportToMP4 = exportToVideoFactory({
  mimeType: 'video/mp4',
  extension: 'mp4',
  multiplexer: MP4Muxer,
  // An MPEG-4 file containing AVC (H.264) video, High Profile, Level 4.2
  encoderCodec: 'avc1.64002a',
  muxerCodec: 'avc',
  validateDimensions: (width, height) => {
    // Lossy video encoders ofter work by splitting the image into smaller
    // blocks, creating a problem when the videos dimensions are odd numbers.
    // The h264 coded will fail when given non-even dimensions.
    //
    // See: https://community.adobe.com/t5/after-effects-discussions/media-encoder-is-changing-my-dimension-by-a-pixel/m-p/10100400
    if (!(width % 2 === 0 && height % 2 === 0)) {
      throw new Error(
        `Width and height must be even numbers for the h264 encoder, got ${width}x${height}.`
      );
    }
  },
});

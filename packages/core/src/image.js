import jpeg from 'jpeg-js';
import * as png from '@stevebel/png';

import { isBrowser } from './utils.js';

/**
 * @typedef {Object} Image
 * @property {"image"} type
 */

/**
 * Chacks for image mime type based on magic bytes of buffer
 *
 * @param {ArrayBuffer} buffer
 * @returns {string | null}
 */
const getImageType = (buffer) => {
  const bytes = new Uint8Array(buffer);
  const hex = bytes.reduce((acc, i) => `${acc}${i.toString(16)}`, '');
  const magicBytes = hex.slice(0, 8);

  switch (magicBytes) {
    case '89504e47':
      return 'image/png';
    case 'ffd8ffe0':
    case 'ffd8ffe1':
    case 'ffd8ffe2':
      return 'image/jpeg';
    default:
      return null;
  }
};

/**
 * Turns a buffer into base64
 *
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
const bufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  const binary = bytes.reduce(
    (acc, i) => `${acc}${String.fromCharCode(i)}`,
    ''
  );
  return btoa(binary);
};

/**
 * Turns a base64 string into a buffer
 *
 * @param {string} base64
 * @returns {ArrayBuffer}
 */
const base64ToBuffer = (base64) => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
};

/**
 * Utilizes the Canvas API to turn buffer into image data
 *
 * @param {ArrayBuffer} buffer
 * @param {string} mimeType
 * @returns {Promise<ImageData>}
 */
const bufferToImageDataCanvas = async (buffer, mimeType) => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const blob = new Blob([buffer], { type: mimeType });

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = image.width;
      canvas.height = image.height;

      ctx.drawImage(image, 0, 0);

      resolve({
        imageData: ctx.getImageData(0, 0, image.width, image.height),
        imageCanvas: canvas,
      });
    };

    image.onerror = reject;

    image.src = URL.createObjectURL(blob);
  });
};

/**
 * Turns a Buffer into image data using pure JavaScript
 *
 * @param {ArrayBuffer} buffer
 * @param {string} mimeType
 * @returns {Promise<ImageData>}
 */
export const bufferToImageDataJS = async (buffer, mimeType) => {
  if (mimeType === 'image/jpeg') {
    const { data, width, height } = jpeg.decode(buffer, { useTArray: true });
    return { data, width, height };
  }

  if (mimeType === 'image/png') {
    const { data, width, height } = png.decode(buffer);
    return { data, width, height };
  }
};

/**
 * Uses the canvas API to turn image data into a buffer
 *
 * @param {imageData} imageData
 * @param {string} mimeType
 * @returns {Promise<ArrayBuffer>}
 */
export const imageDataToBufferCanvas = async (imageData, mimeType) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const { data, width, height } = imageData;

  canvas.width = width;
  canvas.height = height;

  ctx.putImageData(new ImageData(data, width, height), 0, 0);

  return new Promise((res) =>
    res(base64ToBuffer(canvas.toDataURL(mimeType).split(',').pop()))
  );
};

/**
 * Turns image data into a buffer
 *
 * @param {ImageData} imageData
 * @param {string} mimeType
 * @returns {Promise<ArrayBuffer>}
 */
export const imageDataToBufferJS = async (imageData, mimeType) => {
  const { width, height, data } = imageData;
  if (mimeType === 'image/jpeg') {
    return jpeg.encode({
      width,
      height,
      data,
    }).data.buffer;
  }

  if (mimeType === 'image/png') {
    return png.encode({
      width,
      height,
      depth: 8,
      data,
    }).buffer;
  }
};

/**
 * Crops an image
 *
 * @param {ImageData} imageData
 * @param {number} x
 * @param {number} y
 * @param {number} targetWidth
 * @param {number} targetHeight
 * @returns {ImageData}
 */
const cropImageData = (imageData, x, y, targetWidth, targetHeight) => {
  const { width, height } = imageData;

  const cropX = (imageData, { left = 0, right = 0 }) => {
    const { data, width, height } = imageData;
    const dataLength = data.length;
    const newWidth = width - left - right;
    const rowLength = width * 4;
    const newRowLength = newWidth * 4;
    const leftCrop = left * 4;
    const newData = [];

    // loop through each row
    for (let x = 0; x < dataLength; x += rowLength) {
      const newRowStart = x + leftCrop;
      const newRowEnd = newRowStart + newRowLength;

      for (let i = newRowStart; i < newRowEnd; i += 4) {
        newData.push(data[i], data[i + 1], data[i + 2], data[i + 3]);
      }
    }

    return { data: newData, height, width: newWidth };
  };

  const cropY = (imageData, { top = 0, bottom = 0 }) => {
    const { data, width, height } = imageData;
    const rowLength = width * 4;
    const topIndex = top * rowLength;
    const bottomIndex = bottom * rowLength;
    const newHeight = height - top - bottom;
    const newDataEnd = data.length - bottomIndex;
    const newData = [];

    // save each index within the cropped area (avoid .slice() for performance)
    for (let i = topIndex; i < newDataEnd; i++) {
      newData.push(data[i]);
    }

    return { data: newData, height: newHeight, width };
  };

  if (x + targetWidth > width || y + targetHeight > height) {
    throw new Error('Crop area out of bounds');
  }

  let croppedData = cropX(imageData, {
    left: x,
    right: width - (x + targetWidth),
  });
  croppedData = cropY(croppedData, {
    top: y,
    bottom: height - (y + targetHeight),
  });

  return {
    ...croppedData,
    data: new Uint8ClampedArray(croppedData.data),
  };
};

/**
 * Resizes an image
 *
 * @param {ImageData} imageData
 * @param {number | null} targetWidth
 * @param {number | null} targetHeight
 * @returns {ImageData}
 */
export const resizeImageData = (imageData, targetWidth, targetHeight) => {
  if (!targetWidth && !targetHeight) {
    return imageData;
  }

  const ratio = imageData.width / imageData.height;
  const width = Math.ceil(
    targetWidth
      ? targetWidth
      : targetHeight
        ? targetHeight * ratio
        : imageData.width
  );
  const height = Math.ceil(
    targetHeight
      ? targetHeight
      : targetWidth
        ? targetWidth / ratio
        : imageData.height
  );

  function bilinearInterpolation(src, width, height) {
    function interpolate(k, kMin, kMax, vMin, vMax) {
      return Math.round((k - kMin) * vMax + (kMax - k) * vMin);
    }

    function interpolateHorizontal(offset, x, y, xMin, xMax) {
      const vMin = src.data[(y * src.width + xMin) * 4 + offset];
      if (xMin === xMax) return vMin;

      const vMax = src.data[(y * src.width + xMax) * 4 + offset];
      return interpolate(x, xMin, xMax, vMin, vMax);
    }

    function interpolateVertical(offset, x, xMin, xMax, y, yMin, yMax) {
      const vMin = interpolateHorizontal(offset, x, yMin, xMin, xMax);
      if (yMin === yMax) return vMin;

      const vMax = interpolateHorizontal(offset, x, yMax, xMin, xMax);
      return interpolate(y, yMin, yMax, vMin, vMax);
    }

    let pos = 0;

    const newData = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcX = (x * src.width) / width;
        const srcY = (y * src.height) / height;

        const xMin = Math.floor(srcX);
        const yMin = Math.floor(srcY);

        const xMax = Math.min(Math.ceil(srcX), src.width - 1);
        const yMax = Math.min(Math.ceil(srcY), src.height - 1);

        newData[pos++] = interpolateVertical(
          0,
          srcX,
          xMin,
          xMax,
          srcY,
          yMin,
          yMax
        ); // R
        newData[pos++] = interpolateVertical(
          1,
          srcX,
          xMin,
          xMax,
          srcY,
          yMin,
          yMax
        ); // G
        newData[pos++] = interpolateVertical(
          2,
          srcX,
          xMin,
          xMax,
          srcY,
          yMin,
          yMax
        ); // B
        newData[pos++] = interpolateVertical(
          3,
          srcX,
          xMin,
          xMax,
          srcY,
          yMin,
          yMax
        ); // A
      }
    }

    return newData;
  }

  return {
    data: new Uint8ClampedArray(
      bilinearInterpolation(imageData, width, height)
    ),
    height,
    width,
  };
};

/**
 * Registers a new image
 *
 * @param {ArrayBuffer} data
 * @returns {Promise<Image>}
 */
export const registerImage = async (data) => {
  const mimeType = getImageType(data);

  if (!mimeType) {
    throw new Error('Unsupported image type');
  }

  let imageData,
    imageCanvas = null;

  if (isBrowser) {
    const res = await bufferToImageDataCanvas(data, mimeType);
    imageData = res.imageData;
    imageCanvas = res.imageCanvas;
  } else {
    imageData = await bufferToImageDataJS(data, mimeType);
  }

  return {
    type: 'image',
    mimeType,
    width: imageData ? imageData.width : 0,
    height: imageData ? imageData.height : 0,
    toBuffer() {
      return data;
    },
    toDataURL() {
      return `data:${mimeType};base64,${bufferToBase64(data)}`;
    },
    toBlob() {
      return new Blob([data], { type: mimeType });
    },
    toImageData() {
      return imageData;
    },
    toImageCanvas() {
      if (!isBrowser) {
        throw new Error(
          'Converting to ImageCanvas is only supported in the browser.'
        );
      }
      return imageCanvas;
    },
    async crop({
      x = 0,
      y = 0,
      width = imageData.width,
      height = imageData.height,
    } = {}) {
      const cropped = cropImageData(imageData, x, y, width, height);
      const buffer = isBrowser
        ? await imageDataToBufferCanvas(cropped, mimeType)
        : await imageDataToBufferJS(cropped, mimeType);
      return await registerImage(buffer);
    },
    async resize({ width = null, height = null } = {}) {
      const resized = resizeImageData(imageData, width, height);
      const buffer = isBrowser
        ? await imageDataToBufferCanvas(resized, mimeType)
        : await imageDataToBufferJS(resized, mimeType);
      return await registerImage(buffer);
    },
    getPixel(x, y) {
      const { data, width } = imageData;
      const i = (y * width + x) * 4;

      if (i >= data.length || i < 0) {
        throw new Error('Pixel out of bounds');
      }

      return {
        r: data[i],
        g: data[i + 1],
        b: data[i + 2],
        a: data[i + 3],
      };
    },
  };
};

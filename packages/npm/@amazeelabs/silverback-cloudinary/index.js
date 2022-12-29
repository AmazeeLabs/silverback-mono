"use strict";
//import { cloudinary } from 'cloudinary';
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveResponsiveImage = void 0;
const url_gen_1 = require("@cloudinary/url-gen");
const resize_1 = require("@cloudinary/url-gen/actions/resize");
const resolveResponsiveImage = (originalImage, config) => {
    const responsiveImage = {
        src: originalImage
    };
    // If no config object is given, we just return the original image url.
    if (typeof config === 'undefined') {
        return responsiveImage;
    }
    const width = config.width;
    const height = config.height || undefined;
    const transform = config.transform || undefined;
    // The image width and height in the response should be the same as the ones
    // sent as parameters.
    // @todo: Unless the width sent is bigger that the width of the original
    // image, since we should not scale up. TBD what to do in this case.
    responsiveImage.width = width;
    responsiveImage.height = height;
    if (typeof config.sizes !== 'undefined') {
        responsiveImage.sizes = buildSizesString(config.sizes, width);
        responsiveImage.srcset = buildSrcSetString(originalImage, config.sizes, { width: width, height: height }, transform);
    }
    responsiveImage.src = getCloudinaryImageUrl(originalImage, { width: width, height: height, transform: transform });
    if (typeof config.variants !== 'undefined') {
        const sources = [];
        config.variants.map((variant) => {
            const variantWidth = variant.width;
            const variantHeight = variant.height || undefined;
            const variantTransform = variant.transform || undefined;
            const source = {
                media: variant.media,
                width: variantWidth,
                height: variantHeight,
                srcset: '',
            };
            if (typeof variant.sizes !== 'undefined') {
                source.sizes = buildSizesString(variant.sizes, variantWidth);
                source.srcset = buildSrcSetString(originalImage, variant.sizes, { width: variantWidth, height: variantHeight }, variantTransform);
            }
            else {
                source.srcset = getCloudinaryImageUrl(originalImage, { width: variantWidth, height: variantHeight, transform: variantTransform });
            }
            sources.push(source);
        });
        responsiveImage.sources = sources;
    }
    return responsiveImage;
};
exports.resolveResponsiveImage = resolveResponsiveImage;
/**
 * Builds a sizes string from a sizes array.
 *
 * @param Array sizes
 *  An array of image sizes.
 *  Example: [
 *    [400, 390] -> up until 400px screen width, use the 390px image
 *    [800, 780] -> up until 800px screen width, use the 780px image
 *  ]
 * @param number defaultWitdth
 *  The default width to add at the end of the sizes string.
 *
 * @return string
 */
const buildSizesString = (sizes, defaultWitdth) => {
    if (sizes.length === 0) {
        return '';
    }
    const sizeEntries = sizes.reduce((accumulator, currentValue) => {
        // Each size must have exactly 2 elements.
        if (currentValue.length !== 2) {
            return accumulator;
        }
        accumulator.push(`(max-width: ${currentValue[0]}px) ${currentValue[1]}px`);
        return accumulator;
    }, []);
    // At the end, add the default width.
    if (typeof defaultWitdth !== 'undefined') {
        sizeEntries.push(`${defaultWitdth}px`);
    }
    return sizeEntries.join(', ');
};
/**
 * Builds a srcset string for an original image, based on a sizes array.
 *
 * @param string originalImage
 *  The original image url
 * @param array sizes
 *  A sizes array, same is in buildSizesString().
 * @param array defaultDimensions
 *  The default dimensions (width and, optionally, height) of the image so
 *  that we can compute the height of each of the image in the src set, by
 *  preserving the aspect ratio.
 * @param string transform
 *  A string that can be any other cloudinary transformation to be added to
 *  each of the resulted images in the src set.
 *
 * @return string
 */
const buildSrcSetString = (originalImage, sizes, defaultDimensions, transform) => {
    if (sizes.length === 0) {
        return '';
    }
    const srcSetEntries = sizes.reduce((accumulator, currentValue) => {
        // Each size must have exactly 2 elements.
        if (currentValue.length !== 2) {
            return accumulator;
        }
        const imageConfig = {
            width: currentValue[1],
            transform: transform,
        };
        // If we know the default dimensions of the image, and the width of the
        // desired one, we can also calculate the height of it, assuming we keep
        // the aspect ratio.
        if (typeof (defaultDimensions === null || defaultDimensions === void 0 ? void 0 : defaultDimensions.width) !== 'undefined' && typeof (defaultDimensions === null || defaultDimensions === void 0 ? void 0 : defaultDimensions.height) !== 'undefined') {
            imageConfig.height = defaultDimensions.width > 0 ? Math.round(imageConfig.width * defaultDimensions.height / defaultDimensions.width) : 0;
        }
        accumulator.push(`${getCloudinaryImageUrl(originalImage, imageConfig)} ${imageConfig.width}w`);
        return accumulator;
    }, []);
    return srcSetEntries.join(', ');
};
const getCloudinaryImageUrl = (originalImage, config) => {
    const cld = new url_gen_1.Cloudinary({
        cloud: {
            cloudName: 'ddj1ybv54',
            apiKey: '219736568324247',
            apiSecret: 'PsDMMn1fMdm2lj9TlJMICX25KEA'
        },
    });
    const image = cld.image(originalImage);
    image.setDeliveryType('fetch');
    image.sign();
    image.format('auto');
    if (typeof (config === null || config === void 0 ? void 0 : config.width) !== 'undefined' || typeof (config === null || config === void 0 ? void 0 : config.height) !== 'undefined') {
        // If both, width and height, are provided, then we resize the image.
        if (typeof (config === null || config === void 0 ? void 0 : config.width) !== 'undefined' && typeof (config === null || config === void 0 ? void 0 : config.height) !== 'undefined') {
            image.resize((0, resize_1.fill)(config.width, config.height));
        }
        else {
            image.resize((0, resize_1.scale)(config.width, config.height));
        }
    }
    if (typeof (config === null || config === void 0 ? void 0 : config.transform) !== 'undefined') {
        const tranformation = new url_gen_1.Transformation();
        tranformation.addTransformation(config.transform);
        image.transformation = tranformation;
    }
    ;
    return image.toURL();
};

'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vips = require('../../');
const fixtures = require('../fixtures');

function almostEqual(a, b, precision) {
    precision = typeof precision !== 'undefined' ? precision : 0.000001;

    return Math.abs(a - b) < precision;
}

describe('Image', function () {
    beforeEach(function () {
        if ('gc' in global) {
            console.log("gc-ing");
            global.gc();
        }
    });

    it('Can make an image with "black"', function () {
        var image = vips.call('black', 20, 10);
        assert.strictEqual(image.get("width"), 20);
        assert.strictEqual(image.get("height"), 10);
        assert.strictEqual(image.get("bands"), 1);
        assert.strictEqual(vips.call('avg', image), 0);
    });

    it('Image properties work', function () {
        var image = vips.call('black', 20, 10);
        assert.strictEqual(image.width, 20);
        assert.strictEqual(image.height, 10);
        assert.strictEqual(image.bands, 1);
        assert.strictEqual(image.format, 'uchar');
        assert.strictEqual(image.interpretation, 'b-w');
        assert.strictEqual(image.xres, 1);
        assert.strictEqual(image.yres, 1);
        assert.strictEqual(image.xoffset, 0);
        assert.strictEqual(image.yoffset, 0);
        assert.strictEqual(image.filename, 'temp-0');
        assert.strictEqual(image.scale, 1);
        assert.strictEqual(image.offset, 0);
    });

    it('Can get type of image metadata items', function () {
        var image = vips.Image.new_from_file(fixtures.input_jpeg_file);
        assert.strictEqual(image.get_typeof('icc-profile-data'), 
            vips.GTYPES.VipsBlob);
    });

    it('Can get image metadata items', function () {
        var image = vips.Image.new_from_file(fixtures.input_jpeg_file);
        var profile = image.get('icc-profile-data');
        assert.strictEqual(profile.length, 560); 
        assert.strictEqual(profile[profile.length - 1], 156); 
    });

    it('Can enumerate image metadata', function () {
        var image = vips.Image.new_from_file(fixtures.input_jpeg_file);
        var fields = image.get_fields();
        assert.strictEqual(fields.length, 63); 
    });

    it('Can create image metadata', function () {
        var image = vips.call('black', 20, 10);
        image.set_typeof(vips.GTYPES.gint, 'banana', 42);
        assert.strictEqual(image.get('banana'), 42);
    });

    it('Can update image metadata', function () {
        var image = vips.call('black', 20, 10);
        image.set_typeof(vips.GTYPES.gint, 'banana', 42);
        image.set('banana', 45);
        assert.strictEqual(image.get('banana'), 45);
    });

    it('Can remove image metadata', function () {
        var image = vips.call('black', 20, 10);
        image.set_typeof(vips.GTYPES.gint, 'banana', 42);
        image.remove('banana');
        assert.throws(function () {
            image.get('banana');
        });
    });

    it('Can make an image from a 2D array', function () {
        var image = vips.Image.new_from_array([[1, 2], [3, 4], [5, 6]]);
        assert.strictEqual(image.width, 2);
        assert.strictEqual(image.height, 3);
        assert.strictEqual(image.bands, 1);
        assert.strictEqual(image.format, 'double');
        assert.strictEqual(image.interpretation, 'matrix');
        assert.strictEqual(vips.call('avg', image), 3.5);
    });

    it('Can make an image from a 1D array', function () {
        var image = vips.Image.new_from_array([1, 2]);
        assert.strictEqual(image.width, 2);
        assert.strictEqual(image.height, 1);
        assert.strictEqual(vips.call('avg', image), 1.5);
    });

    it('Can make a matrix image with scale and offset', function () {
        var image = vips.Image.new_from_array([1, 2], 42, 99);
        assert.strictEqual(image.scale, 42);
        assert.strictEqual(image.offset, 99);
    });

    it('Can make a scalar constant image', function () {
        var image = vips.Image.new_from_array([1, 2]);
        var image2 = image.new_from_image(12);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'double');
        assert.strictEqual(image2.interpretation, 'matrix');
        assert.strictEqual(vips.call('avg', image2), 12);
    });

    it('Can add a vector constant', function () {
        var image = vips.Image.black(2, 1);
        image = image.add([1, 2, 3]);
        assert.strictEqual(image.width, 2);
        assert.strictEqual(image.height, 1);
        assert.strictEqual(image.bands, 3);
        assert.strictEqual(image.format, 'float');
        assert.strictEqual(image.interpretation, 'b-w');
        assert.strictEqual(image.avg(), 2);
    });

    it('Can make a vector constant image', function () {
        var image = vips.Image.black(2, 1);
        var image2 = image.new_from_image([1, 2, 3]);
        /*
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'double');
        assert.strictEqual(image2.interpretation, 'matrix');
        assert.strictEqual(image2.avg(), 2);
         */
    });

});
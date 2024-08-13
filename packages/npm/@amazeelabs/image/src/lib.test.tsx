import { describe, expect, it } from 'vitest';

import {
  calculateFocusExtraction,
  calculateFocusPosition,
  inferTargetDimensions,
} from './lib.js';

describe('inferTargetDimensions', () => {
  it('uses fixed target dimensions', () => {
    expect(
      inferTargetDimensions({ width: 400, height: 300 }, 200, 150),
    ).toEqual({ width: 200, height: 150 });
  });
  it('inferres the correct height', () => {
    expect(
      inferTargetDimensions({ width: 400, height: 300 }, 200, undefined),
    ).toEqual({ width: 200, height: 150 });
  });
});

describe('calculateFocusExtraction', () => {
  it('handles equal proportions', () => {
    expect(calculateFocusExtraction([400, 300], [40, 30], [300, 100])).toEqual({
      top: 0,
      left: 0,
      width: 400,
      height: 300,
    });
  });

  describe('portrait cuts', () => {
    const source = [400, 300] as const;
    const target = [30, 40] as const;
    const width = (source[1] / target[1]) * target[0];
    const top = 0;
    const height = 300;
    it('centered', () => {
      expect(calculateFocusExtraction(source, target)).toEqual({
        top,
        left: Math.round((source[0] - width) / 2),
        width,
        height,
      });
    });
    it('slightly left', () => {
      expect(calculateFocusExtraction(source, target, [190, 150])).toEqual({
        top,
        left: Math.round(190 - width / 2),
        width,
        height,
      });
    });
    it('full left', () => {
      expect(calculateFocusExtraction(source, target, [70, 150])).toEqual({
        top,
        left: 0,
        width,
        height,
      });
    });

    it('slightly right', () => {
      expect(calculateFocusExtraction(source, target, [210, 150])).toEqual({
        top,
        left: Math.round(210 - width / 2),
        width,
        height,
      });
    });

    it('full right', () => {
      expect(calculateFocusExtraction(source, target, [330, 150])).toEqual({
        top,
        left: source[0] - width,
        width,
        height,
      });
    });
  });

  describe('landscape cuts', () => {
    const source = [400, 300] as const;
    const target = [50, 30] as const;
    const width = 400;
    const height = (source[0] / target[0]) * target[1];
    const left = 0;
    it('centered', () => {
      expect(calculateFocusExtraction(source, target)).toEqual({
        top: Math.round((source[1] - height) / 2),
        left,
        width,
        height,
      });
    });
    it('slightly up', () => {
      expect(calculateFocusExtraction(source, target, [200, 130])).toEqual({
        top: Math.round(130 - height / 2),
        left,
        width,
        height,
      });
    });
    it('full up', () => {
      expect(calculateFocusExtraction(source, target, [200, 30])).toEqual({
        top: 0,
        left,
        width,
        height,
      });
    });

    it('slightly down', () => {
      expect(calculateFocusExtraction(source, target, [200, 170])).toEqual({
        top: Math.round(170 - height / 2),
        left,
        width,
        height,
      });
    });

    it('full down', () => {
      expect(calculateFocusExtraction(source, target, [200, 370])).toEqual({
        top: source[1] - height,
        left,
        width,
        height,
      });
    });
  });
});

describe('calculateFocusPosition', () => {
  it('top left', () => {
    expect(calculateFocusPosition(100, 100, [33, 33])).toEqual('top left');
  });
  it('top center', () => {
    expect(calculateFocusPosition(100, 100, [34, 33])).toEqual('top center');
  });
  it('top right', () => {
    expect(calculateFocusPosition(100, 100, [67, 33])).toEqual('top right');
  });
  it('center left', () => {
    expect(calculateFocusPosition(100, 100, [33, 34])).toEqual('center left');
  });
  it('center', () => {
    expect(calculateFocusPosition(100, 100, [34, 66])).toEqual('center center');
  });
  it('center right', () => {
    expect(calculateFocusPosition(100, 100, [67, 66])).toEqual('center right');
  });
  it('bottom left', () => {
    expect(calculateFocusPosition(100, 100, [33, 67])).toEqual('bottom left');
  });
  it('bottom center', () => {
    expect(calculateFocusPosition(100, 100, [34, 67])).toEqual('bottom center');
  });
  it('bottom right', () => {
    expect(calculateFocusPosition(100, 100, [67, 67])).toEqual('bottom right');
  });
});

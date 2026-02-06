import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getCompileImageName } from '../src/utils/compiler/image-builder.js';

describe('Container Compile', () => {
  describe('image-builder', () => {
    it('generates correct image name', () => {
      const imageName = getCompileImageName();
      assert.equal(imageName, 'stylus-compile:latest');
    });
  });
});

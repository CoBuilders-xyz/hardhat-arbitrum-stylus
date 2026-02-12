import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  isLocalhostUrl,
  toDockerHostUrl,
} from '../src/container/network-utils.js';

describe('network-utils', () => {
  describe('isLocalhostUrl', () => {
    it('returns true for http://localhost:8547', () => {
      assert.strictEqual(isLocalhostUrl('http://localhost:8547'), true);
    });

    it('returns true for http://127.0.0.1:8547', () => {
      assert.strictEqual(isLocalhostUrl('http://127.0.0.1:8547'), true);
    });

    it('returns true for http://127.0.0.10:8547', () => {
      assert.strictEqual(isLocalhostUrl('http://127.0.0.10:8547'), true);
    });

    it('returns false for http://example.com:8547', () => {
      assert.strictEqual(isLocalhostUrl('http://example.com:8547'), false);
    });

    it('returns false for an invalid URL', () => {
      assert.strictEqual(isLocalhostUrl('not-a-url'), false);
    });
  });

  describe('toDockerHostUrl', () => {
    it('converts localhost to host.docker.internal', () => {
      assert.strictEqual(
        toDockerHostUrl('http://localhost:8547'),
        'http://host.docker.internal:8547',
      );
    });

    it('converts 127.0.0.1 to host.docker.internal', () => {
      assert.strictEqual(
        toDockerHostUrl('http://127.0.0.1:8547'),
        'http://host.docker.internal:8547',
      );
    });
  });
});

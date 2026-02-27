import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  appendImportToNodeOptions,
  buildNodeOptionsWithTsxImport,
  clearNodeOptionsCacheForTests,
} from '../src/services/runtime/node-options.js';

describe('node options helper', () => {
  it('appends import when no existing NODE_OPTIONS are set', () => {
    const actual = appendImportToNodeOptions(
      undefined,
      'file:///tsx-loader.mjs',
    );
    assert.equal(actual, '--import "file:///tsx-loader.mjs"');
  });

  it('preserves existing NODE_OPTIONS when appending import', () => {
    const actual = appendImportToNodeOptions(
      '--trace-warnings --max-old-space-size=2048',
      'file:///tsx-loader.mjs',
    );

    assert.equal(
      actual,
      '--trace-warnings --max-old-space-size=2048 --import "file:///tsx-loader.mjs"',
    );
  });

  it('does not append duplicate imports', () => {
    const actual = appendImportToNodeOptions(
      '--trace-warnings --import "file:///tsx-loader.mjs"',
      'file:///tsx-loader.mjs',
    );

    assert.equal(actual, '--trace-warnings --import "file:///tsx-loader.mjs"');
  });

  it('builds NODE_OPTIONS using tsx/esm import', async () => {
    clearNodeOptionsCacheForTests();

    const actual = await buildNodeOptionsWithTsxImport('--trace-warnings');

    assert.match(actual, /--trace-warnings/);
    assert.match(actual, /--import/);
  });
});

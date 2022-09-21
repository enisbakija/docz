#!/usr/bin/env node
/* eslint-disable no-console */
'use strict';

// ISOMORPHIC FILE: NO TOP-LEVEL IMPORT/REQUIRE() ALLOWED
// This file has to run as both ESM and CJS on older Node.js versions
// Assume ESM to start, and then call `require()` below once CJS is confirmed.
// Needed for Stackblitz: https://github.com/stackblitz/webcontainer-core/issues/281

const CI_INSTRUCTIONS = {
  NETLIFY:
    'https://docs.netlify.com/configure-builds/manage-dependencies/#node-js-and-javascript',
  GITHUB_ACTIONS:
    'https://docs.github.com/en/actions/guides/building-and-testing-nodejs#specifying-the-nodejs-version',
  VERCEL:
    'https://vercel.com/docs/runtimes#official-runtimes/node-js/node-js-version',
};

/** `Docz *` */
async function main() {
  // Check for ESM support.
  // Load the "supports-esm" package in an way that works in both ESM & CJS.
  let supportsESM =
    typeof require !== 'undefined'
      ? require('supports-esm')
      : (await import('supports-esm')).default;

  // Check for CJS->ESM named export support.
  // "path-to-regexp" is a real-world package that we depend on, that only
  // works in later versions of Node with advanced CJS->ESM support.
  // If `import {compile} from 'path-to-regexp'` will fail, we need to know.
  if (supportsESM) {
    const testNamedExportsModule = await import('path-to-regexp');
    supportsESM = !!testNamedExportsModule.compile;
  }

  // Preflight check complete. Enjoy! ✨
  if (supportsESM) {
    return import('@docz/core/cli')
      .then(() => {
        // console.log('');
      })
      .catch((error) => {
        console.log(error);
        process.exit(1);
      });
  }

  const version = process.versions.node;

  // Not supported (incomplete ESM): It's very difficult (impossible?) to load the
  // dependencies below in an unknown module type. If `require` is undefined, then this file
  // actually was run as ESM but one of the ESM preflight checks above failed. In that case,
  // it's okay to hard-code the valid Node versions here since they will not change over time.
  if (typeof require === 'undefined') {
    console.error(`\nNode.js v${version} is not supported by Docz!
Please upgrade to a version of Node.js with complete ESM support: "^14.18.0 || >=16.12.0"\n`);
  }

  const ci = require('ci-info');

  // Special instructions for CI environments, which may have special steps needed.
  // This is a common issue that we can help users with proactively.
  if (ci.isCI) {
    let platform;
    for (const [key, value] of Object.entries(ci)) {
      if (value === true) {
        platform = key;
        break;
      }
    }
    console.log(
      `${ci.name} CI Environment Detected!\nAdditional steps may be needed to set your Node.js version:`
    );
    console.log(`Documentation: https://docs.Docz.build/guides/deploy`);
    if (CI_INSTRUCTIONS[platform]) {
      console.log(`${ci.name} Documentation: ${CI_INSTRUCTIONS[platform]}`);
    }
    console.log(``);
  }

  process.exit(1);
}

main();

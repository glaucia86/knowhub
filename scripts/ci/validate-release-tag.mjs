#!/usr/bin/env node

const inputRef = process.argv[2];
const ref = inputRef || process.env.GITHUB_REF || "";
const semverTagPattern = /^refs\/tags\/v\d+\.\d+\.\d+(?:-[0-9A-Za-z-]+\.\d+)?$/;

if (!ref) {
  console.error("Missing tag reference. Use refs/tags/vX.Y.Z or refs/tags/vX.Y.Z-label.N.");
  process.exit(1);
}

if (!semverTagPattern.test(ref)) {
  console.error(`Invalid release tag: ${ref}`);
  console.error("Expected refs/tags/vX.Y.Z or refs/tags/vX.Y.Z-label.N");
  process.exit(1);
}

console.log(`Release tag validated: ${ref}`);

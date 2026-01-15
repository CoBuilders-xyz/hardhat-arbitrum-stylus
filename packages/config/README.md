# @cobuilders/config

Internal package with shared configuration for the monorepo.

> This package is private and not published to npm.

## Contents

- `tsconfig.base.json` — Base TypeScript configuration extended by all packages

## Usage

In a package's `tsconfig.json`:

```json
{
  "extends": "../config/tsconfig.base.json"
}
```


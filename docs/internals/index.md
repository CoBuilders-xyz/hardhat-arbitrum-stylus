# Internals Overview

<!-- 
=============================================================================
CONTENT DESCRIPTION FOR DOCUMENTATION AGENT
=============================================================================

This is the index page for the Internals section - deep dives into implementation details.

WHAT TO WRITE:
- What the internals section covers
- Who should read this
- Overview of internal packages and patterns
- Links to detailed pages

SECTIONS TO INCLUDE:

1. Purpose
   - Deep dive documentation
   - For understanding implementation details

2. What's Covered
   - Utils package internals
   - Hook handler implementations
   - Error handling patterns

3. Section Overview
   - Brief description of each internals page

=============================================================================
-->

This section provides deep dives into internal implementation details.

## Purpose

The Internals section is for contributors who want to:

- Understand implementation details
- Debug complex issues
- Extend internal components
- Learn from existing patterns

For high-level architecture, see [Architecture Overview](../architecture/index.md).

## What's Covered

### [Utils Package](utils-package.md)

Deep dive into `@cobuilders/hardhat-arb-utils`:

- ContainerManager implementation
- DockerClient implementation
- Web3 utilities
- Testing helpers

### [Hook Handlers](hook-handlers.md)

How Hardhat hooks are implemented:

- Config hook handler
- HRE hook handler
- Network hook handler
- Hook handler patterns

### [Error Handling](error-handling.md)

Error handling patterns used across packages:

- Custom error types
- Error propagation
- User-friendly messages

## Code Organization

Internal code follows these principles:

1. **Single responsibility** — Each module does one thing
2. **Explicit dependencies** — No hidden globals
3. **Testability** — Dependencies can be mocked
4. **Type safety** — Full TypeScript with strict mode

# Change Log

All notable changes to Fountain-js will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [1.1.1] - 2023-09-13

### Fixed

- Special characters like `#`, `$`, `%`, etc., now work in character names and are valid.
- Per specification, character names like `23` do not work but numbers in character names work regardless of order e.g. `R2D2` or `11A`.

### Changed

- You can force a character name with all numbers e.g. `123`, if desired.

## [1.1.0] - 2023-06-26

### Added

- Support for single-letter character names.
- Support for single-letter scene headings

### Fixed

- Lyrics can now be parsed from dialogue.
- `INT./EXT` and `INT/EXT` in scene headings are now parsable.

### Changed

- Tokens are now OOP-based with backwards-compatibility for legacy tokens.

## [1.0.0] - 2022-04-18

### Changed

- Updated package and repository name to `fountain-js`.

### Deprecated

- `Fountain.ts` namepsace is now deprecated in favor of `fountain-js`

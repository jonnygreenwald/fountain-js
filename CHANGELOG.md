# Change Log

All notable changes to Fountain-js will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [1.1.2] - 2023-09-17

### Fixed

- a deep copy of `this.tokens` is created in order to perserve token text from being mutated by the inline lexer within `to_html`. **The text within tokens will no longer contain HTML.**

### Notes

- any token text will now need to be seperately lexed either by the `InlineLexer` class, a modified version of said class, or alternatively you can use `Fountain.to_html()` seperately if desired.

### Changed

- tokens can be accessed as traditionally through the `getTokens` parameter on `parse` or through the `tokens` property on the `Fountain` class itself.
- the `regex` object and lexer classes like `Lexer` and `InlineLexer` can now be imported in order extend for additional token manipulation, particularly when it comes to lexing token text.

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

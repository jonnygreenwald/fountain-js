# Change Log

All notable changes to Fountain-js will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

- Improve rendering per spec like stripping sections and synopses since these should not be rendered.
- Return more explicit null values and enable strict null checking.
- Add line numbers to tokens.
- Allow any title field attributes.
- Better title page parsing in general.

## [1.1.4] - 2023-10-01

### Added

- Tokens ``@ # ! $ \ / ~ ` + = . > <`` are all escapable in addition to `*` and `_`. Additionally, all escapes are also respected when used to break the tokens' intended function.
- Symbols `< > & "` now escape to their HTML-safe variants.
- Types have been added to the regex patterns and the regex objects are now typed as a `Record<T, U>` for the lexers. These types have been included for import and manipulation as desired.

### Changed

- Italic, bold, underline and all combinations now behave more in line, but not perfectly, with [Commonmark Specifications](https://spec.commonmark.org/0.30/#emphasis-and-strong-emphasis) for emphasis. This includes preserving HTML nesting of other forms of emphasis as best as possible.
  - More work is needed to have it behave exactly the same but for the current limitations, it is much closer and behaves more like one would expect particularly when it comes to non-flanking delimiters.

## [1.1.3] - 2023-09-24

### Fixed

- scene headings have more variation like `I./E.` is now valid where originally it wasn't.
- Lyrics work better in dialogue and do not create multiple paragraph tags if there is more than one line of singing in the character's speech.
- multiple spaces after a parenthetical no longer breaks the parenthetical and turns it into speech.
- hanging parentheticals (at the end of dialogue) no longer disappear or break dialogue.

### Changed

- regex cleanup and removal of unnecessary capturing groups.
- centered text is now stripped of all whitespace.
- parentheticals now work with emphasis outside of the parenthesis e.g. `*(ah, wonderful)*` as well as inside.
- all forms of emphasis around the parenthetical are now accepted.

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

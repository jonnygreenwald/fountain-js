export type FountainTypes = 'title_page' | 'scene_heading'
                | 'scene_number' | 'transition'
                | 'dialogue' | 'parenthetical'
                | 'action' | 'centered'
                | 'lyrics' | 'synopsis'
                | 'section' | 'note'
                | 'note_inline' | 'boneyard'
                | 'page_break' | 'line_break'
                | 'bold_italic_underline' | 'bold_underline' 
                | 'italic_underline' | 'bold_italic'
                | 'bold' | 'italic'
                | 'underline' | 'escape'
                | 'blank_lines';

export const rules: Record<FountainTypes, RegExp> = {
    title_page: /^\s*((?:title|credit|authors?|source|notes|draft ?date|date|contact|copyright|revisions?)\:)(?=[^\S\n]*(?:\n(?: {3,}|\t))?\S.*)/i,

    scene_heading: /^\s*((?:\*{0,3}_?)?(?:(?:int|i)\.?\/(?:ext|e)|int|ext|est)[. ].+$)|^\s*\.(?!\.+)(\S.*)$/i,
    scene_number: /\s*#([\w.-]+?)#\s*$/,

    transition: /^\s*((?:FADE (?:TO BLACK|OUT)|CUT TO BLACK)\.|.+ TO\:)[^\S\n]*$|^\s*> *(.+)$/,

    dialogue: /(?!^\s*\\@|^\s*[!.>~=#])(?!^\s*[0-9 _*]+(?:\(.*\))?[*_]*(?:\^?)?\s*\n)(^\s*(?:@[^^()\n]+|[^^()\na-z]+(?<!(?:BLACK|OUT)\.|TO:\s*))(?:\(.*\))?[ *_]*)(\^?)?\s*\n(?!\n+)([\s\S]+)/,
    parenthetical: /^ *(?:(?<u1>_{0,1})(?<s1>\*{0,3})(?=.+\k<s1>\k<u1>)|(?<s2>\*{0,3})(?<u2>_{0,1})(?=.+\k<u2>\k<s2>))(\(.+?\))(\k<s1>\k<u1>|\k<u2>\k<s2>) *$/,

    action: /^(.+)/g,
    centered: /^\s*>.+<[^\S\r\n]*(?:\s*>.+<[^\S\r\n]*)*$/,

    lyrics: /^\s*~(?! ).+(?:\n\s*~(?! ).+)*$/,

    section: /^\s*(#+) *(.*)$/,
    synopsis: /^\s*=(?!=+) *(.*)$/,

    note: /^\[{2}(?!\[+)(.+)]{2}(?!\[+)$/,
    note_inline: /\[{2}(?!\[+)([\s\S]+?)]{2}(?!\[+)/g,
    boneyard: /\/\*[\S\s]*?\*\//g,

    page_break: /^={3,}$/,
    line_break: /^ {2}$/,

    bold_italic_underline: /(?<!\\)(?:(?=\w)(?<![^\W_]_*)_\*{3}(?=.+?(?<=\S)(?<!\*)\*{3}_(?!\*))|\*{3}_(?=.+?(?<=\S)(?<!_)_\*{3}(?!_)))(?=\S)(.+?(?<=\S))(?<!\\)(?:(?<!\*)\*{3}_(?!\*)|(?<!_)_\*{3}(?!_))/g,
    bold_underline: /(?<!\\)(?:(?=\w)(?<![^\W_]_*)_\*{2}(?=.+?(?<=\S)(?<!\*)\*{2}_(?!\*))|\*{2}_(?=.+?(?<=\S)(?<!_)_\*{2}(?!_)))(?=\S)(.+?(?<=\S))(?<!\\)(?:(?<!\*)\*{2}_(?!\*)|(?<!_)_\*{2}(?!_))/g,
    italic_underline: /(?<!\\)(?:(?=\w)(?<![^\W_]_*)_\*(?=.+?(?<=\S)(?<!\*)\*_(?!\*))|\*_(?=.+?(?<=\S)(?<!_)_\*(?!_)))(?=\S)(.+?(?<=\S))(?<!\\)(?:(?<!\*)\*_(?!\*)|(?<!_)_\*(?!_))/g,
    bold_italic: /(?<!\\)\*{3}(?!\*)(?=\S)(.+?(?<=[^\s*]))(?<!\\)\*{3}/g,

    bold: /(?<!\\)\*{2}(?!\*)(?=\S)(.+?(?<=[^\s*]))(?<!\\)\*{2}/g,
    italic: /(?<!\\)\*(?!\*)(?=\S)(.+?(?<=[^\s*]))(?<!\\)\*/g,
    underline: /(?=\w)(?<![^\W_]_*)(?<!\\)_(?!_)(?<![^_])(?=\S)(?!<[^>]*>)(.+?(?<=\S)(?=_(?<=\w)(?![^\W_])))(?<!\\)(?<!<[^>]*>)_/g,

    escape: /\\([@#!*_$~`+=.><\\\/])/g,

    blank_lines: /\n(?:(?! {2}\n)(?:[^\S\n]*| {3,}[^\S\n]*)(?:\n|$))+|^[^\S\n]*(?:\n|$)/g
};
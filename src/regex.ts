export const regex = {
    title_page: /^((?:title|credit|authors?|source|notes|draft date|date|contact|copyright)\:)/gim,

    scene_heading: /^((?:\*{0,3}_?)?(?:(?:int|i)\.?\/(?:ext|e)|int|ext|est)[. ].+)|^\.(?!\.+)(\S.*)/i,
    scene_number: /( *#(.+)# *)/,

    transition: /^((?:FADE (?:TO BLACK|OUT)|CUT TO BLACK)\.|.+ TO\:)|^> *(.+)/,

    dialogue: /(?!^[0-9 _*]+(?:\(.*\))?[ *_]*(?:\^?)?\s*\n)(^(?:(?!\\?@|!)[^^()\na-z]+|@[^^()\n]+)(?: *\(.*\))?[ *_]*)(\^?)?\s*\n(?!\n+)([\s\S]+)/,
    parenthetical: /^ *(?:(?<u1>_{0,1})(?<s1>\*{0,3})(?=.+\k<s1>\k<u1>)|(?<s2>\*{0,3})(?<u2>_{0,1})(?=.+\k<u2>\k<s2>))(\(.+?\))(\k<s1>\k<u1>|\k<u2>\k<s2>) *$/,

    action: /^(.+)/g,
    centered: /^> *(.+) *<(\n.+)*/g,

    lyrics: /^~(?! ).+(?:\n~(?! ).+)*/,

    section: /^(#+) *(.*)/,
    synopsis: /^(?:\=(?!\=+) *)(.*)/,

    note: /^\[{2}(?!\[+)(.+)]{2}(?!\[+)$/,
    note_inline: /\[{2}(?!\[+)([\s\S]+?)]{2}(?!\[+)/g,
    boneyard: /(^\/\*|^\*\/)$/g,

    page_break: /^={3,}$/,
    line_break: /^ {2}$/,

    bold_italic_underline: /(_\*{3}(?=.+\*{3}_)|\*{3}_(?=.+_\*{3}))(.+?)(\*{3}_|_\*{3})/g,
    bold_underline: /(_\*{2}(?=.+\*{2}_)|\*{2}_(?=.+_\*{2}))(.+?)(\*{2}_|_\*{2})/g,
    italic_underline: /(_\*(?=.+\*_)|\*_(?=.+_\*))(.+?)(\*_|_\*)/g,
    bold_italic: /(\*{3}(?=.+\*{3}))(.+?)(\*{3})/g,

    bold: /(\*{2}(?=.+\*{2}))(.+?)(\*{2})/g,
    italic: /(\*(?=.+\*))(.+?)(\*)/g,
    underline: /(_(?=.+_))(.+?)(_)/g,

    splitter: /\n{2,}/g,
    cleaner: /^\n+|\n+$/,
    standardizer: /\r\n|\r/g,
    whitespacer: /^\t+|^ {3,}/gm
  };
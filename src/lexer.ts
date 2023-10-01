import { regex } from './regex';

export type InlineTypes = 'note' | 'line_break'
                | 'bold_italic_underline' | 'bold_underline' 
                | 'italic_underline' | 'bold_italic'
                | 'bold' | 'italic'
                | 'underline';

export class Lexer {
    reconstruct(script: string) {
        return script.replace(regex.boneyard, '\n$1\n')
            .replace(regex.standardizer, '\n')
            .replace(regex.cleaner, '')
            .replace(regex.whitespacer, '');
    }
}

export class InlineLexer extends Lexer {
    inline: Record<InlineTypes, string> = {
        note: '<!-- $1 -->',

        line_break: '<br />',

        bold_italic_underline: '<span class="bold italic underline">$1</span>',
        bold_underline: '<span class="bold underline">$1</span>',
        italic_underline: '<span class="italic underline">$1</span>',
        bold_italic: '<span class="bold italic">$1</span>',
        bold: '<span class="bold">$1</span>',
        italic: '<span class="italic">$1</span>',
        underline: '<span class="underline">$1</span>'
    };

    reconstruct(line: string) {
        if (!line) 
            return;

        let match: RegExp;
        const styles = ['bold_italic_underline', 'bold_underline', 'italic_underline', 'bold_italic', 'bold', 'italic', 'underline'];

        line = line.replace(regex.note_inline, this.inline.note)
            .replace(/\\\*/g, '[{{{star}}}]')                       // perserve escaped astersisks
            .replace(/\\_/g, '[{{{underline}}}]');                  // perserve escaped underscores

        for (let style of styles) {
            match = regex[style];

            if (match.test(line)) {
                line = line.replace(match, this.inline[style]);
            }
        }

        return line.replace(/\n/g, this.inline.line_break)
            .replace(/\[{{{star}}}]/g, '*')                         // replace escaped with asterisk
            .replace(/\[{{{underline}}}]/g, '_')                    // replaec escaped with underscore
            .trim();
    }
}
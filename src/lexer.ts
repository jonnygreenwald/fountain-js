import { rules } from './rules';
import { escapeHTML } from './utilities';

export type InlineTypes = 'note' | 'line_break'
                | 'bold_italic_underline' | 'bold_underline' 
                | 'italic_underline' | 'bold_italic'
                | 'bold' | 'italic'
                | 'underline' | 'escape';

export class Lexer {
    reconstruct(script: string) {
        return script.replace(rules.boneyard, '\n$1\n')
            .replace(rules.standardizer, '\n')
            .replace(rules.cleaner, '')
            .replace(rules.whitespacer, '');
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
        underline: '<span class="underline">$1</span>',

        escape: '$1'
    };

    reconstruct(line: string) {
        if (!line) 
            return;

        let match: RegExp;
        const styles = ['bold_italic_underline', 'bold_underline', 'italic_underline', 'bold_italic', 'bold', 'italic', 'underline'];

        line = escapeHTML(
                line
                    .replace(rules.note_inline, this.inline.note)
                    .replace(rules.escape, '[{{{$&}}}]')                    // perserve escaped characters
        );

        for (let style of styles) {
            match = rules[style];

            if (match.test(line)) {
                line = line.replace(match, this.inline[style]);
            }
        }

        return line
                .replace(/\n/g, this.inline.line_break)
                .replace(/\[{{{\\(&.+?;|.)}}}]/g, this.inline.escape)         // restore escaped chars to intended sequence
                .trim();
    }
}
import { rules } from './rules';
import { escapeHTML } from './utilities';

export type InlineTypes = 'note' | 'line_break'
                | 'bold_italic_underline' | 'bold_underline' 
                | 'italic_underline' | 'bold_italic'
                | 'bold' | 'italic'
                | 'underline' | 'escape';

export class InlineLexer {
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

    reconstruct(line: string, escapeSpaces = false) {
        const styles = [
            'bold_italic_underline',
            'bold_underline',
            'italic_underline',
            'bold_italic',
            'bold',
            'italic',
            'underline'
        ];

        line = escapeHTML(
                line
                    .replace(rules.note_inline, this.inline.note)
                    .replace(rules.escape, '[{{{$&}}}]')                    // perserve escaped characters
        );

        if (escapeSpaces) {
            line = line.replace(/^( +)/gm, (_, spaces) => {
                return '&nbsp;'.repeat(spaces.length);
            });
        }

        for (let style of styles) {
            const rule: RegExp = rules[style];

            if (rule.test(line)) {
                line = line.replace(rule, this.inline[style]);
            }
        }

        return line
                .replace(/\n/g, this.inline.line_break)
                .replace(/\[{{{\\(&.+?;|.)}}}]/g, this.inline.escape)       // restore escaped chars to intended sequence
                .trimEnd();
    }
}
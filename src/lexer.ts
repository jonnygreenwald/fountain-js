import { regex } from './regex';

export class Lexer {
    public reconstruct(script: string): string {
        return script.replace(regex.boneyard, '\n$1\n')
            .replace(regex.standardizer, '\n')
            .replace(regex.cleaner, '')
            .replace(regex.whitespacer, '');
    }
}

export class InlineLexer extends Lexer {
    private inline = {
        note: '<!-- $1 -->',
    
        line_break: '<br />',
    
        bold_italic_underline: '<span class=\"bold italic underline\">$2</span>',
        bold_underline: '<span class=\"bold underline\">$2</span>',
        italic_underline: '<span class=\"italic underline\">$2</span>',
        bold_italic: '<span class=\"bold italic\">$2</span>',
        bold: '<span class=\"bold\">$2</span>',
        italic: '<span class=\"italic\">$2</span>',
        underline: '<span class=\"underline\">$2</span>'
    };

    public reconstruct(text: string): string {
        if (!text) {
            return;
        }  

        const styles = [ 'underline', 'italic', 'bold', 'bold_italic', 'italic_underline', 'bold_underline', 'bold_italic_underline' ];
        let i: number = styles.length;

        let style, match;
        
        text = text.replace(regex.note_inline, this.inline.note).replace(/\\\*/g, '[star]').replace(/\\_/g, '[underline]').replace(/\n/g, this.inline.line_break);

        while (i--) {
            style = styles[i];
            match = regex[style];

            if (match.test(text)) {
                text = text.replace(match, this.inline[style]);
            }
        }

        return text.replace(/\[star\]/g, '*').replace(/\[underline\]/g, '_').trim();
    }
}
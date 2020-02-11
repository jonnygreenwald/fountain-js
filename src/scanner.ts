import { regex } from './regex';
import { Token } from './token';

import { Lexer } from './lexer';

export class Scanner {
    private tokens: Token[];

    constructor() {
        this.tokens = [];
    }

    public tokenize(script: string) {
        let src = new Lexer().reconstruct(script).split(regex.splitter), 
            line: string, 
            match: string[], 
            parts: string[], 
            text: string, 
            meta: any, 
            x: number, 
            xlen: number, 
            dual: boolean;

        let i = src.length;

        while (i--) {
            line = src[i];

            /** title page */
            if (regex.title_page.test(line)) {
                match = line.replace(regex.title_page, '\n$1').split(regex.splitter).reverse();

                for (x = 0, xlen = match.length; x < xlen; x++) {
                    parts = match[x].replace(regex.cleaner, '').split(/\:\n*/);
                    this.tokens.push({ type: parts[0].trim().toLowerCase().replace(' ', '_'), text: parts[1].trim() });
                }
                continue;
            }

            /** scene headings */
            if (match = line.match(regex.scene_heading)) {
                text = match[1] || match[2];

                if (text.indexOf('  ') !== text.length - 2) {
                    if (meta = text.match(regex.scene_number)) {
                        meta = meta[2];
                        text = text.replace(regex.scene_number, '');
                    }

                    this.tokens.push({ type: 'scene_heading', text: text, scene_number: meta || undefined });
                }
                continue;
            }

            /** centered */
            if (match = line.match(regex.centered)) {
                this.tokens.push({ type: 'centered', text: match[0].replace(/>|</g, '') });
                continue;
            }

            /** transitions */
            if (match = line.match(regex.transition)) {
                this.tokens.push({ type: 'transition', text: match[1] || match[2] });
                continue;
            }

            /** dialogue blocks - characters, parentheticals and dialogue */
            if (match = line.match(regex.dialogue)) {
                if (match[1].indexOf('  ') !== match[1].length - 2) {
                    // we're iterating from the bottom up, so we need to push these backwards
                    if (match[2]) {
                        this.tokens.push({ type: 'dual_dialogue_end' });
                    }

                    this.tokens.push({ type: 'dialogue_end' });

                    parts = match[3].split(/(\(.+\))(?:\n+)/).reverse();

                    for (x = 0, xlen = parts.length; x < xlen; x++) {	
                        text = parts[x];

                        if (text.length > 0) {
                            this.tokens.push({ type: regex.parenthetical.test(text) ? 'parenthetical' : 'dialogue', text: text });
                        }
                    }

                    this.tokens.push({ type: 'character', text: match[1].trim() });
                    this.tokens.push({ type: 'dialogue_begin', dual: match[2] ? 'right' : dual ? 'left' : undefined });

                    if (dual) {
                        this.tokens.push({ type: 'dual_dialogue_begin' });
                    }

                    dual = match[2] ? true : false;

                    continue;
                }
            }

            /** section */
            if (match = line.match(regex.section)) {
                this.tokens.push({ type: 'section', text: match[2], depth: match[1].length });
                continue;
            }

            /** synopsis */
            if (match = line.match(regex.synopsis)) {
                this.tokens.push({ type: 'synopsis', text: match[1] });
                continue;
            }

            /** notes */
            if (match = line.match(regex.note)) {
                this.tokens.push({ type: 'note', text: match[1]});
                continue;
            }      

            /** boneyard */ 
            if (match = line.match(regex.boneyard)) {
                this.tokens.push({ type: match[0][0] === '/' ? 'boneyard_begin' : 'boneyard_end' });
                continue;
            }      

            /** page breaks */
            if (regex.page_break.test(line)) {
                this.tokens.push({ type: 'page_break' });
                continue;
            }

            /** line breaks */
            if (regex.line_break.test(line)) {
                this.tokens.push({ type: 'line_break' });
                continue;
            }

            this.tokens.push({ type: 'action', text: line });
        }

        return this.tokens;
    }
}
import { regex } from './regex';
import { Token } from './token';

import { Lexer } from './lexer';

export class Scanner {
    private tokens: Token[] = [];

    tokenize(script: string): Token[] {
        // reverse the array so that dual dialog can be constructed bottom up
        const source: string[] = new Lexer().reconstruct(script).split(regex.splitter).reverse();

        let line: string;
        let match: string[];
        let dual: boolean;

        for (line of source) {
            /** title page */
            if (regex.title_page.test(line)) {
                match = line.replace(regex.title_page, '\n$1').split(regex.splitter).reverse();

                for (let item of match) {
                    let pair = item.replace(regex.cleaner, '').split(/\:\n*/);

                    this.tokens.push({ type: pair[0].trim().toLowerCase().replace(' ', '_'), is_title: true, text: pair[1].trim() });
                }
                continue;
            }

            /** scene headings */
            if (match = line.match(regex.scene_heading)) {
                let text = match[1] || match[2];
                let meta: RegExpMatchArray;
                let num: string;

                if (text.indexOf('  ') !== text.length - 2) {
                    if (meta = text.match(regex.scene_number)) {
                        num = meta[2];
                        text = text.replace(regex.scene_number, '');
                    }

                    this.tokens.push({ type: 'scene_heading', text: text, scene_number: num || undefined });
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
                let name = match[1] || match[2];

                if (name.indexOf('  ') !== name.length - 2 || line.startsWith('@')) {
                    // iterating from the bottom up, so push dialogue blocks in reverse order
                    if (match[3]) {
                        this.tokens.push({ type: 'dual_dialogue_end' });
                    }

                    this.tokens.push({ type: 'dialogue_end' });

                    let parts: string[] = match[4].split(/(\(.+\))(?:\n+)/).reverse();

                    for (let part of parts) {
                        if (part.length > 0) {
                            this.tokens.push({ type: regex.parenthetical.test(part) ? 'parenthetical' : 'dialogue', text: part });
                        }
                    }

                    this.tokens.push({ type: 'character', text: name.trim() });
                    this.tokens.push({ type: 'dialogue_begin', dual: match[3] ? 'right' : dual ? 'left' : undefined });

                    if (dual) {
                        this.tokens.push({ type: 'dual_dialogue_begin' });
                    }

                    dual = match[3] ? true : false;
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
                this.tokens.push({ type: 'note', text: match[1] });
                continue;
            }

            /** boneyard */
            if (match = line.match(regex.boneyard)) {
                this.tokens.push({ type: match[0][0] === '/' ? 'boneyard_begin' : 'boneyard_end' });
                continue;
            }

            /** lyrics */
            if (match = line.match(regex.lyrics)) {
                this.tokens.push({ type: 'lyrics', text: match[0].replace(/^~(?![ ])/gm, '') });
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

            // everything else is action -- remove `!` for forced action
            this.tokens.push({ type: 'action', text: line.replace(/^!(?![ ])/gm, '') });
        }

        return this.tokens.reverse();
    }
}
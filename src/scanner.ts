import { regex } from './regex';
import { Token } from './token';

import { Lexer } from './lexer';

export class Scanner {
    private lastLineWasDualDialogue: boolean;

    tokenize(script: string): Token[] {
        // reverse the array so that dual dialog can be constructed bottom up
        const source: string[] = new Lexer().reconstruct(script).split(regex.splitter).reverse();

        const tokens: Token[] = source.reduce((previous: Token[], line: string) => {
            /** title page */
            if (regex.title_page.test(line)) {
                return this.tokenizeTitlePage(line, previous);
            }
            /** scene headings */
            if (regex.scene_heading.test(line)) {
                return this.tokenizeSceneHeading(line, previous);
            }
            /** centered */
            if (regex.centered.test(line)) {
                return this.tokenizeCentered(line, previous);
            }
            /** transitions */
            if (regex.transition.test(line)) {
                return this.tokenizeTransition(line, previous);
            }
            /** dialogue blocks - characters, parentheticals and dialogue */
            if (regex.dialogue.test(line)) {
                return this.tokenizeDialogue(line, previous);
            }
            /** section */
            if (regex.section.test(line)) {
                return this.tokenizeSection(line, previous);
            }
            /** synopsis */
            if (regex.synopsis.test(line)) {
                return this.tokenizeSynopsis(line, previous);
            }
            /** notes */
            if (regex.note.test(line)) {
                return this.tokenizeNote(line, previous);
            }
            /** boneyard */
            if (regex.boneyard.test(line)) {
                return this.tokenizeBoneyard(line, previous);
            }
            /** lyrics */
            if (regex.lyrics.test(line)) {
                return this.tokenizeLyrics(line, previous);
            }
            /** page breaks */
            if (regex.page_break.test(line)) {
                return this.tokenizePageBreak(line, previous);
            }
            /** line breaks */
            if (regex.line_break.test(line)) {
                return this.tokenizeLineBreak(line, previous);
            }
            // everything else is action -- remove `!` for forced action
            return this.tokenizeAction(line, previous);
        }, [])
        
        return tokens.reverse();
    }

    private tokenizeTitlePage(line: string, previous: Token[]): Token[] {
        const match = line.replace(regex.title_page, '\n$1').split(regex.splitter).reverse();
        const titlePageTokens = match.map(item => {
            const pair = item.replace(regex.cleaner, '').split(/\:\n*/);
            return { type: pair[0].trim().toLowerCase().replace(' ', '_'), is_title: true, text: pair[1].trim() }
        })
        return [...previous, ...titlePageTokens]
    }

    private tokenizeSceneHeading(line: string, previous: Token[]): Token[] {
        const match = line.match(regex.scene_heading)
        let text = match[1] || match[2];

        if (this.isTooShort(text)) {
            return previous;
        }

        const meta: RegExpMatchArray = text.match(regex.scene_number);
        let num: string;
        if (meta) {
            num = meta[2];
            text = text.replace(regex.scene_number, '');
        }

        const sceneHeadingToken = { type: 'scene_heading', text: text, scene_number: num || undefined };
        return [...previous, sceneHeadingToken];
    }

    private tokenizeCentered(line: string, previous: Token[]): Token[] {
        const match = line.match(regex.centered)
        const centeredToken = { type: 'centered', text: match[0].replace(/>|</g, '') };
        return [...previous, centeredToken];
    }

    private tokenizeTransition(line: string, previous: Token[]): Token[] {
        const match = line.match(regex.transition)
        const transitionToken = { type: 'transition', text: match[1] || match[2] };
        return [...previous, transitionToken]
    }

    private tokenizeDialogue(line: string, previous: Token[]): Token[] {
        const match = line.match(regex.dialogue);

        let name = match[1] || match[2];
        if (this.isTooShort(name) && !line.startsWith('@')) {
            return previous;
        }

        const dialogueTokens = []

        // iterating from the bottom up, so push dialogue blocks in reverse order
        const isDualDialogue = !!(match[3]);
        if (isDualDialogue) {
            dialogueTokens.push({ type: 'dual_dialogue_end' });
        }

        dialogueTokens.push({ type: 'dialogue_end' });

        let parts: string[] = match[4].split(/(\(.+\))(?:\n+)/).reverse();

        for (let part of parts) {
            if (part.length > 0) {
                dialogueTokens.push({ type: regex.parenthetical.test(part) ? 'parenthetical' : 'dialogue', text: part });
            }
        }

        dialogueTokens.push({ type: 'character', text: name.trim() });
        dialogueTokens.push({ type: 'dialogue_begin', dual: isDualDialogue ? 'right' : this.lastLineWasDualDialogue ? 'left' : undefined });

        if (this.lastLineWasDualDialogue) {
            dialogueTokens.push({ type: 'dual_dialogue_begin' });
        }

        this.lastLineWasDualDialogue = isDualDialogue;

        return [...previous, ...dialogueTokens];
    }

    private tokenizeSection(line: string, previous: Token[]): Token[] {
        const match = line.match(regex.section);
        const sectionToken = { type: 'section', text: match[2], depth: match[1].length };
        return [...previous, sectionToken];
    }

    private tokenizeSynopsis(line: string, previous: Token[]): Token[] {
        const match = line.match(regex.synopsis);
        const synopsisToken = { type: 'synopsis', text: match[1] };
        return [...previous, synopsisToken];
    }

    private tokenizeNote(line: string, previous: Token[]): Token[] {
        const match = line.match(regex.note);
        const noteToken = { type: 'note', text: match[1] };
        return [...previous, noteToken];
    }

    private tokenizeBoneyard(line: string, previous: Token[]): Token[] {
        const match = line.match(regex.boneyard);
        const boneyardToken = { type: match[0][0] === '/' ? 'boneyard_begin' : 'boneyard_end' };
        return [...previous, boneyardToken];
    }

    private tokenizeLyrics(line: string, previous: Token[]): Token[] {
        const match = line.match(regex.lyrics);
        const lyricToken = { type: 'lyrics', text: match[0].replace(/^~(?![ ])/gm, '') };
        return [...previous, lyricToken];
    }

    private tokenizePageBreak(line: string, previous: Token[]): Token[] {
        const match = line.match(regex.page_break);
        const pageBreakToken = { type: 'page_break' };
        return [...previous, pageBreakToken];
    }

    private tokenizeLineBreak(line: string, previous: Token[]): Token[] {
        const match = line.match(regex.line_break);
        const lineBreakToken = { type: 'line_break' };
        return [...previous, lineBreakToken];
    }

    private tokenizeAction(line: string, previous: Token[]): Token[] {        
        const actionToken = { type: 'action', text: line.replace(/^!(?![ ])/gm, '') };
        return [...previous, actionToken];
    }

    private isTooShort(str: string) {
        return str.indexOf('  ') === str.length - 2
    }
}
import { regex } from './regex';
import { ActionToken, BoneyardToken, CenteredToken, DialogueBlock, LineBreakToken, LyricsToken, NoteToken, PageBreakToken, SceneHeadingToken, SectionToken, SynopsisToken, TitlePageBlock, Token, TransitionToken } from './token';

import { Lexer } from './lexer';

export class Scanner {
    private lastLineWasDualDialogue: boolean

    tokenize(script: string): Token[] {
        // reverse the array so that dual dialog can be constructed bottom up
        const source: string[] = new Lexer().reconstruct(script).split(regex.splitter).reverse();

        const tokens: Token[] = source.reduce((previous: Token[], line: string) => {
            /** title page */
            if (regex.title_page.test(line)) {
                return new TitlePageBlock(line).addTo(previous)
            }
            /** scene headings */
            if (regex.scene_heading.test(line)) {
                return new SceneHeadingToken(line).addTo(previous);
            }
            /** centered */
            if (regex.centered.test(line)) {
                return new CenteredToken(line).addTo(previous);
            }
            /** transitions */
            if (regex.transition.test(line)) {
                return new TransitionToken(line).addTo(previous);
            }
            /** dialogue blocks - characters, parentheticals and dialogue */
            if (regex.dialogue.test(line)) {
                const dialogueBlock = new DialogueBlock(line, this.lastLineWasDualDialogue)
                this.lastLineWasDualDialogue = dialogueBlock.dual
                return dialogueBlock.addTo(previous);
            }
            /** section */
            if (regex.section.test(line)) {
                return new SectionToken(line).addTo(previous);
            }
            /** synopsis */
            if (regex.synopsis.test(line)) {
                return new SynopsisToken(line).addTo(previous);
            }
            /** notes */
            if (regex.note.test(line)) {
                return new NoteToken(line).addTo(previous);
            }
            /** boneyard */
            if (regex.boneyard.test(line)) {
                return new BoneyardToken(line).addTo(previous);
            }
            /** lyrics */
            if (regex.lyrics.test(line)) {
                return new LyricsToken(line).addTo(previous);
            }
            /** page breaks */
            if (regex.page_break.test(line)) {
                return new PageBreakToken().addTo(previous);
            }
            /** line breaks */
            if (regex.line_break.test(line)) {
                return new LineBreakToken().addTo(previous);
            }
            // everything else is action -- remove `!` for forced action
            return new ActionToken(line).addTo(previous);
        }, [])
        
        return tokens.reverse();
    }
}
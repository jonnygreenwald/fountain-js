import { rules } from './rules';
import { escapeHTML } from './utilities';
import { 
    ActionToken,
    CenteredToken,
    DialogueBlock,
    LyricsToken,
    NoteToken,
    PageBreakToken,
    SceneHeadingToken,
    SectionToken,
    SpacesToken,
    SynopsisToken,
    TitlePageBlock,
    Token,
    TransitionToken
} from './token';

export type InlineTypes = 'note' | 'line_break'
                | 'bold_italic_underline' | 'bold_underline' 
                | 'italic_underline' | 'bold_italic'
                | 'bold' | 'italic'
                | 'underline' | 'escape';

export class Lexer {
    private static lastLineWasDualDialogue: boolean;
    private static scanIndex: number;

    /**
     * Replaces boneyard with an empty string. If a boneyard token exists
     * at the start of a line, it preserves token continuity by adding blank lines
     * for the lexer to parse.
     * @param match
     * @returns {string} empty string or blank lines
     */
    static boneyardStripper(match: string) {
        const endAtStrStart = /^[^\S\n]*\*\//m;
        let boneyardEnd = '';

        if (endAtStrStart.test(match)) {
            boneyardEnd = '\n\n';
        }
        return boneyardEnd;
    }

    /**
     * Tokenizes the script.
     * @param {string} script 
     * @returns {[Token<Array>, Token<Array>]} tuple of title page and script token arrays
     */
    static tokenize(script: string): [Token[], Token[]] {
        let source = script
                        .replace(rules.boneyard, this.boneyardStripper)
                        .replace(/\r\n|\r/g, '\n');                      // convert carriage return / returns to newline
        this.scanIndex = 0;

        const titlePageTokens = this.tokenizeTitlePage(source);
        source = source.substring(this.scanIndex);
        const scriptTokens = Lexer.tokenizeScript(source);

        return [titlePageTokens, scriptTokens];
    }

    /**
     * Tokenizes the title page. Tests for title page keywords then lexes going forward.
     * If no keywords are found and empty array is returned.
     * @param {string} source 
     * @returns {Token<Array>}
     */
    static tokenizeTitlePage(source: string): Token[] {
        let titlePageTokens: Token[] = [];

        if (TitlePageBlock.matchedBy(source)) {
            const titlePageBlock = new TitlePageBlock(source);
            this.scanIndex = titlePageBlock.scanIndex;
            titlePageTokens = titlePageBlock.addTo(titlePageTokens);
        }

        return titlePageTokens;
    }

    /**
     * Tokenizes all Fountain tokens except Title Page. Splits the script based on
     * blank lines then lexes in reverse to account for dual dialogue tokens.
     * @param {string} source
     * @returns {Token<Array>}
     */
    static tokenizeScript(source: string): Token[] {
        const lines: string[] = source
                            .split(rules.blank_lines)
                            .reverse();

        const scriptTokens: Token[] = lines.reduce((previous: Token[], line: string) => {
            if (!line) {
                return previous;
            }
            /** spaces */
            if (SpacesToken.matchedBy(line)) {
                return new SpacesToken().addTo(previous);
            }
            /** scene headings */
            if (SceneHeadingToken.matchedBy(line)) {
                return new SceneHeadingToken(line).addTo(previous);
            }
            /** centered */
            if (CenteredToken.matchedBy(line)) {
                return new CenteredToken(line).addTo(previous);
            }
            /** transitions */
            if (TransitionToken.matchedBy(line)) {
                return new TransitionToken(line).addTo(previous);
            }
            /** dialogue blocks - characters, parentheticals and dialogue */
            if (DialogueBlock.matchedBy(line)) {
                const dialogueBlock = new DialogueBlock(line, this.lastLineWasDualDialogue);
                this.lastLineWasDualDialogue = dialogueBlock.dual;
                return dialogueBlock.addTo(previous);
            }
            /** section */
            if (SectionToken.matchedBy(line)) {
                return new SectionToken(line).addTo(previous);
            }
            /** synopsis */
            if (SynopsisToken.matchedBy(line)) {
                return new SynopsisToken(line).addTo(previous);
            }
            /** notes */
            if (NoteToken.matchedBy(line)) {
                return new NoteToken(line).addTo(previous);
            }
            /** lyrics */
            if (LyricsToken.matchedBy(line)) {
                return new LyricsToken(line).addTo(previous);
            }
            /** page breaks */
            if (PageBreakToken.matchedBy(line)) {
                return new PageBreakToken().addTo(previous);
            }
            /** action */
            return new ActionToken(line).addTo(previous);
        }, []);

        return scriptTokens.reverse();
    }
}

export class InlineLexer {
    static inline: Record<InlineTypes, string> = {
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

    static reconstruct(line: string, escapeSpaces = false) {
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
                line.replace(rules.escape, '[{{{$&}}}]')                    // perserve escaped characters
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
                .replace(rules.note_inline, this.inline.note)
                .replace(/\n/g, this.inline.line_break)
                .replace(/\[{{{\\(&.+?;|.)}}}]/g, this.inline.escape)       // restore escaped chars to intended sequence
                .trimEnd();
    }
}

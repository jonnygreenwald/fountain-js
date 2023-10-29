import { rules } from './rules';

export interface Token {
    type: string,
    is_title?: boolean,
    text?: string,
    scene_number?: string,
    dual?: string,
    depth?: number

    addTo(tokens: Token[]): Token[]
}

export interface Block {
    tokens: Token[],

    addTo(tokens: Token[]): Token[]
}

export class TitlePageBlock implements Block {
    readonly tokens: Token[] = [];

    constructor(line: string) {
        const match = line
                    .replace(/^([^\n]+:)/gm, '\n$1')
                    .split(rules.end_of_lines)
                    .reverse();
        this.tokens = match.reduce(
            (previous, item) => new TitlePageToken(item).addTo(previous)
        , []);
    }

    addTo(tokens: Token[]) {
        return [...tokens, ...this.tokens];
    }

    static matchedBy(line: string) {
        return rules.title_page.test(line);
    }
}

export class TitlePageToken implements Token {
    readonly type: string;
    readonly is_title = true;
    readonly text: string;

    constructor(item: string) {
        const [key, value] = item.split(/\:\n*/, 2);
        this.type = key.trim().toLowerCase().replace(/ /g, '_');
        this.text = value.replace(/^\s*/gm, '');
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }
}

export class SceneHeadingToken implements Token {
    readonly type = 'scene_heading';
    readonly text: string;
    readonly scene_number: string;

    constructor(line: string) {
        const match = line.match(rules.scene_heading);
        if (match) {
            this.text = match[1] || match[2];
        }

        const meta = this.text.match(rules.scene_number);
        if (meta) {
            this.scene_number = meta[2];
            this.text = this.text.replace(rules.scene_number, '');
        }
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }

    static matchedBy(line: string) {
        return rules.scene_heading.test(line);
    }
}

export class CenteredToken implements Token {
    readonly type = 'centered';
    readonly text: string;

    constructor(line: string) {
        const match = line.match(rules.centered);
        if (match) {
            this.text = match[0].replace(/[^\S\n]*[><][^\S\n]*/g, '');
        }
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }

    static matchedBy(line: string) {
        return rules.centered.test(line);
    }
}

export class TransitionToken implements Token {
    readonly type = 'transition';
    readonly text: string;

    constructor(line: string) {
        const match = line.match(rules.transition);
        if (match) {
            this.text = match[1] || match[2];
        }
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }

    static matchedBy(line: string) {
        return rules.transition.test(line);
    }
}

export class DialogueBlock implements Block {
    readonly tokens: Token[] = [];
    readonly dual: boolean;
    readonly too_short: boolean;

    constructor(line: string, dual: boolean) {
        const match = line.match(rules.dialogue);

        if (match) {
            let name = match[1].trim();

            // iterating from the bottom up, so push dialogue blocks in reverse order
            const isDualDialogue = !!match[2];
            if (isDualDialogue) {
                this.tokens.push(new DualDialogueEndToken());
            }

            this.tokens.push(new DialogueEndToken());

            const parts: string[] = match[3].split(/\n/);
            let dialogue: Token[] = parts.reduce((p: Token[], text = '') => {
                const lastIndex = p.length - 1;
                const previousToken = p[lastIndex];

                if (!text.length) {
                    return p;
                }
                if (rules.line_break.test(text)) {
                    text = '';
                }
                text = text.trim();

                if (rules.parenthetical.test(text)) {
                    return [...p, new ParentheticalToken(text)];
                }
                if (rules.lyrics.test(text)) {
                    if (previousToken.type === 'lyrics') {
                        p[lastIndex].text = 
                                    `${previousToken.text}\n${text.replace(/^~/, '')}`;
                        return p;
                    } else {
                        return [...p, new LyricsToken(text)];
                    }
                }
                if (previousToken?.type === 'dialogue') {
                    p[lastIndex].text = `${previousToken.text}\n${text}`;
                    return p;
                }
                return [...p, new DialogueToken(text)];
            }, [] as Token[]).reverse();
            this.tokens.push(...dialogue);

            this.tokens.push(
                new CharacterToken(
                    name.startsWith('@') 
                    ? name.replace(/^@/, '').trim() 
                    : name.trim()),
                new DialogueBeginToken(
                    isDualDialogue ? 'right' : dual ? 'left' : undefined
                )
            );

            if (dual) {
                this.tokens.push(new DualDialogueBeginToken());
            }

            this.dual = isDualDialogue;
        }
    }

    addTo(tokens: Token[]) {
        return [...tokens, ...this.tokens];
    }

    static matchedBy(line: string) {
        return rules.dialogue.test(line);
    }
}

export class DialogueBeginToken implements Token {
    readonly type = 'dialogue_begin';
    readonly dual: 'left' | 'right' | undefined;

    constructor(dual?: 'left' | 'right') {
        this.dual = dual;
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }
}

export class CharacterToken implements Token {
    readonly type = 'character';
    readonly text: string;

    constructor(text: string) {
        this.text = text;
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }
}

export class DialogueToken implements Token {
    readonly type = 'dialogue';
    readonly text: string;

    constructor(text: string) {
        this.text = text;
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }
}

export class DialogueEndToken implements Token {
    readonly type = 'dialogue_end';

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }
}

export class ParentheticalToken implements Token {
    readonly type = 'parenthetical';
    readonly text: string;

    constructor(text: string) {
        this.text = text;
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }
}

export class DualDialogueBeginToken implements Token {
    readonly type = 'dual_dialogue_begin';

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }
}

export class DualDialogueEndToken implements Token {
    readonly type ='dual_dialogue_end';

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }
}

export class LyricsToken implements Token {
    readonly type = 'lyrics';
    readonly text: string;

    constructor(line: string) {
        this.text = line.replace(/^\s*~(?! )/gm, '');
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }

    static matchedBy(line: string) {
        return rules.lyrics.test(line);
    }
}

export class SectionToken implements Token {
    readonly type = 'section';
    readonly text: string;
    readonly depth: number;

    constructor(line: string) {
        const match = line.match(rules.section);
        if (match) {
            this.text = match[2];
            this.depth = match[1].length;
        }
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }

    static matchedBy(line: string) {
        return rules.section.test(line);
    }
}

export class SynopsisToken implements Token {
    readonly type = 'synopsis';
    readonly text: string;

    constructor(line: string) {
        const match = line.match(rules.synopsis);
        if (match) {
            this.text = match[1];
        }
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }

    static matchedBy(line: string) {
        return rules.synopsis.test(line);
    }
}

export class NoteToken implements Token {
    readonly type = 'note';
    readonly text: string;

    constructor(line: string) {
        const match = line.match(rules.note);
        if (match) {
            this.text = match[1];
        }
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }

    static matchedBy(line: string) {
        return rules.note.test(line);
    }
}

export class PageBreakToken implements Token {
    readonly type = 'page_break';

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }

    static matchedBy(line: string) {
        return rules.page_break.test(line);
    }
}

export class SpacesToken implements Token {
    readonly type = 'spaces';

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }

    static matchedBy(line: string) {
        return rules.blank_line.test(line);
    }
}

export class ActionToken implements Token {
    readonly type = 'action';
    readonly text: string;

    constructor(line: string) {
        this.text = line.replace(/^(\s*)!(?! )/gm, '$1')
                .replace(/^( *)(\t+)/gm, (_, leading, tabs) => {
                    return leading + '    '.repeat(tabs.length);
                });
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this];
    }

    /** Currently unused, but here for posterity: */
    // static matchedBy(line: string) {
    //     return regex.action.test(line);
    // }
}

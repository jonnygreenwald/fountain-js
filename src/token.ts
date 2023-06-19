import { regex } from './regex';

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
    readonly tokens: TitlePageToken[] = []

    constructor(line: string) {
        const match = line.replace(regex.title_page, '\n$1').split(regex.splitter).reverse();
        this.tokens = match.reduce(
            (previous, item) => new TitlePageToken(item).addTo(previous)
        , [])
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, ...this.tokens]
    }

    static matchedBy(line: string): boolean {
        return regex.title_page.test(line)
    }
}

export class TitlePageToken implements Token {
    readonly type: string
    readonly is_title = true
    readonly text: string

    constructor(item: string) {
        const pair = item.replace(regex.cleaner, '').split(/\:\n*/);
        this.type = pair[0].trim().toLowerCase().replace(' ', '_')
        this.text = pair[1].trim()
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }
}

export class SceneHeadingToken implements Token {
    readonly type = 'scene_heading'
    readonly text: string
    readonly scene_number: string
    readonly too_short: boolean

    constructor(line: string) {
        const match = line.match(regex.scene_heading)
        this.text = match[1] || match[2];
        this.too_short = isTooShort(this.text)

        const meta: RegExpMatchArray = this.text.match(regex.scene_number);
        if (meta) {
            this.scene_number = meta[2];
            this.text = this.text.replace(regex.scene_number, '');
        }
    }

    addTo(tokens: Token[]): Token[] {
        if (this.too_short) {
            return tokens;
        }

        return [...tokens, this]
    }

    static matchedBy(line: string): boolean {
        return regex.scene_heading.test(line)
    }
}

export class CenteredToken implements Token {
    readonly type = 'centered'
    readonly text: string

    constructor(line: string) {
        const match = line.match(regex.centered)
        this.text = match[0].replace(/>|</g, '')
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }

    static matchedBy(line: string): boolean {
        return regex.centered.test(line)
    }
}

export class TransitionToken implements Token {
    readonly type = 'transition'
    readonly text: string

    constructor(line: string) {
        const match = line.match(regex.transition)
        this.text = match[1] || match[2]
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }

    static matchedBy(line: string): boolean {
        return regex.transition.test(line)
    }
}

export class DialogueBlock implements Block {
    readonly tokens: Token[] = []
    readonly dual: boolean
    readonly too_short: boolean
    
    constructor(line: string, dual: boolean) {
        const match = line.match(regex.dialogue);

        let name = match[1] || match[2];
        this.too_short = isTooShort(name) && !line.startsWith('@')

        // iterating from the bottom up, so push dialogue blocks in reverse order
        const isDualDialogue = !!(match[3]);
        if (isDualDialogue) {
            this.tokens.push(new DualDialogueEndToken());
        }

        this.tokens.push(new DialogueEndToken());

        const parts: string[] = match[4].split(/(\(.+\))(?:\n+)/).reverse();
        this.tokens.push(...parts.reduce((p, text = '') => {
            if (!text.length) {
                return p
            }
            if (regex.parenthetical.test(text)) {
                return [...p, new ParentheticalToken(text)]
            }
            if (regex.lyrics.test(text)) {
                return [...p, new LyricsToken(text)]
            }
            return [...p, new DialogueToken(text)]
        }, []))

        this.tokens.push(
            new CharacterToken(name.trim()),
            new DialogueBeginToken(
                isDualDialogue ? 'right' : dual ? 'left' : undefined
            )
        );

        if (dual) {
            this.tokens.push(new DualDialogueBeginToken());
        }

        this.dual = isDualDialogue;
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, ...this.tokens]
    }

    static matchedBy(line: string): boolean {
        return regex.dialogue.test(line)
    }
}

export class DialogueBeginToken implements Token {
    readonly type = 'dialogue_begin'
    readonly dual: 'left' | 'right' | undefined

    constructor(dual?: 'left' | 'right') {
        this.dual = dual
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }
}

export class CharacterToken implements Token {
    readonly type = 'character'
    readonly text: string

    constructor(text: string) {
        this.text = text
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }
}

export class DialogueToken implements Token {
    readonly type = 'dialogue'
    readonly text: string
    readonly scene_number: string

    constructor(text: string, scene_number?: string) {
        this.text = text
        this.scene_number = scene_number
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }
}

export class DialogueEndToken implements Token {
    readonly type = 'dialogue_end'

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }
}

export class ParentheticalToken implements Token {
    readonly type = 'parenthetical'
    readonly text: string

    constructor(text: string) {
        this.text = text
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }
}

export class DualDialogueBeginToken implements Token {
    readonly type = 'dual_dialogue_begin'

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }
}

export class DualDialogueEndToken implements Token {
    readonly type ='dual_dialogue_end'

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }
}

export class LyricsToken implements Token {
    readonly type = 'lyrics'
    readonly text: string

    constructor(line: string) {
        this.text = line.replace(/^~(?![ ])/gm, '')
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }

    static matchedBy(line: string): boolean {
        return regex.lyrics.test(line)
    }
}

export class SectionToken implements Token {
    readonly type = 'section'
    readonly text: string
    readonly depth: number

    constructor(line: string) {
        const match = line.match(regex.section);
        this.text = match[2]
        this.depth = match[1].length
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }

    static matchedBy(line: string): boolean {
        return regex.section.test(line)
    }
}

export class SynopsisToken implements Token {
    readonly type = 'synopsis'
    readonly text: string

    constructor(line: string) {
        const match = line.match(regex.synopsis)
        this.text = match[1]
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }

    static matchedBy(line: string): boolean {
        return regex.synopsis.test(line)
    }
}

export class NoteToken implements Token {
    readonly type = 'note'
    readonly text: string

    constructor(line: string) {
        const match = line.match(regex.note)
        this.text = match[1]
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }

    static matchedBy(line: string): boolean {
        return regex.note.test(line)
    }
}

export class BoneyardToken implements Token {
    readonly type: 'boneyard_begin' | 'boneyard_end'
    readonly text: string

    constructor(line: string) {
        const match = line.match(regex.boneyard);
        this.type = match[0][0] === '/' ? 'boneyard_begin' : 'boneyard_end'
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }

    static matchedBy(line: string): boolean {
        return regex.boneyard.test(line)
    }
}

export class PageBreakToken implements Token {
    readonly type = 'page_break'

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }

    static matchedBy(line: string): boolean {
        return regex.page_break.test(line)
    }
}


export class LineBreakToken implements Token {
    readonly type = 'line_break'

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }

    static matchedBy(line: string): boolean {
        return regex.line_break.test(line)
    }
}


export class ActionToken implements Token {
    readonly type = 'action'
    readonly text: string

    constructor(line: string) {
        this.text = line.replace(/^!(?![ ])/gm, '')
    }

    addTo(tokens: Token[]): Token[] {
        return [...tokens, this]
    }

    /** Currently unused, but here for posterity: */
    // static matchedBy(line: string): boolean {
    //     return regex.action.test(line)
    // }
}

function isTooShort(str: string) {
    return str.indexOf('  ') === str.length - 2
}
import { Token } from './token';

import { Scanner } from './scanner';
import { InlineLexer } from './lexer';
import { unEscapeHTML } from './utilities';

export interface Script {
    title: string,
    html: {
        title_page: string,
        script: string
    },
    tokens: Token[]
}

export class Fountain {
    tokens: Token[];
    private scanner: Scanner;
    private inlineLex: InlineLexer;

    constructor() {
        this.scanner = new Scanner;
        this.inlineLex = new InlineLexer;
    }

    parse(script: string, getTokens?: boolean): Script {
        // throw an error if given script source isn't a string
        if (typeof script === 'undefined' || script === null)
            throw new Error("Script is undefined or null.");
        if (typeof script !== 'string')
            throw new Error(
                `Script should be \`string\`, input was \`${Object.prototype.toString.call(script)}\`.`
            );

        try {
            let title: string = '';

            this.tokens = this.scanner.tokenize(script);

            const titleToken = this.tokens.find(token => token.type === 'title');
            if (titleToken?.text) {
                // lexes any inlines on the title then removes any HTML / line breaks
                title = unEscapeHTML(
                            this.inlineLex.reconstruct(titleToken.text)
                                .replace('<br />', ' ')
                                .replace(/<(?:.|\n)*?>/g, '')
                );
            }

            return {
                title,
                html: {
                    title_page: this.tokens.filter(token => token.is_title)
                                    .map(token => this.to_html(token)).join(''),
                    script: this.tokens.filter(token => !token.is_title)
                                    .map(token => this.to_html(token)).join('')
                },
                tokens: getTokens ? this.tokens : []
            }
        } catch (error) {
            error.message +=
                '\nPlease submit an issue to https://github.com/jonnygreenwald/fountain-js/issues';
            throw error;
        }
    }

    to_html(token: Token) {
        let lexedText: string | undefined;

        if (token?.text) {
            lexedText = this.inlineLex.reconstruct(token.text);
        }

        switch (token.type) {
            case 'title': return `<h1>${lexedText}</h1>`;
            case 'credit': return `<p class="credit">${lexedText}</p>`;
            case 'author': return `<p class="authors">${lexedText}</p>`;
            case 'authors': return `<p class="authors">${lexedText}</p>`;
            case 'source': return `<p class="source">${lexedText}</p>`;
            case 'notes': return `<p class="notes">${lexedText}</p>`;
            case 'draft_date': return `<p class="draft-date">${lexedText}</p>`;
            case 'date': return `<p class="date">${lexedText}</p>`;
            case 'contact': return `<p class="contact">${lexedText}</p>`;
            case 'copyright': return `<p class="copyright">${lexedText}</p>`;

            case 'scene_heading': return `<h3${(token.scene_number ? ` id="${token.scene_number}">` : `>`) + lexedText}</h3>`;
            case 'transition': return `<h2>${lexedText}</h2>`;

            case 'dual_dialogue_begin': return `<div class="dual-dialogue">`;
            case 'dialogue_begin': return `<div class="dialogue${token.dual ? ' ' + token.dual : ''}">`;
            case 'character': return `<h4>${lexedText}</h4>`;
            case 'parenthetical': return `<p class="parenthetical">${lexedText}</p>`;
            case 'dialogue': return `<p>${lexedText}</p>`;
            case 'dialogue_end': return `</div>`;
            case 'dual_dialogue_end': return `</div>`;

            case 'section': return;
            case 'synopsis': return;

            case 'note': return `<!-- ${lexedText} -->`;
            case 'boneyard_begin': return `<!-- `;
            case 'boneyard_end': return ` -->`;

            case 'action': return `<p>${lexedText}</p>`;
            case 'centered': return `<p class="centered">${lexedText}</p>`;

            case 'lyrics': return `<p class="lyrics">${lexedText}</p>`;

            case 'page_break': return `<hr />`;
            case 'line_break': return `<br />`;
        }
    }
}

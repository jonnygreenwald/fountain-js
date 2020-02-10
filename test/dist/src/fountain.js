"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var scanner_1 = require("./scanner");
var lexer_1 = require("./lexer");
var Fountain = /** @class */ (function () {
    function Fountain() {
        this.title_page = [];
        this.html = [];
    }
    Fountain.prototype.parser = function (script, getTokens) {
        this.tokens = new scanner_1.Scanner().tokenize(script);
        var token, i = this.tokens.length;
        while (i--) {
            token = this.tokens[i];
            token.text = new lexer_1.InlineLexer().reconstruct(token.text);
            switch (token.type) {
                case 'title':
                    this.title_page.push('<h1>' + token.text + '</h1>');
                    this.title = token.text.replace('<br />', ' ').replace(/<(?:.|\n)*?>/g, '');
                    break;
                case 'credit':
                    this.title_page.push('<p class=\"credit\">' + token.text + '</p>');
                    break;
                case 'author':
                    this.title_page.push('<p class=\"authors\">' + token.text + '</p>');
                    break;
                case 'authors':
                    this.title_page.push('<p class=\"authors\">' + token.text + '</p>');
                    break;
                case 'source':
                    this.title_page.push('<p class=\"source\">' + token.text + '</p>');
                    break;
                case 'notes':
                    this.title_page.push('<p class=\"notes\">' + token.text + '</p>');
                    break;
                case 'draft_date':
                    this.title_page.push('<p class=\"draft-date\">' + token.text + '</p>');
                    break;
                case 'date':
                    this.title_page.push('<p class=\"date\">' + token.text + '</p>');
                    break;
                case 'contact':
                    this.title_page.push('<p class=\"contact\">' + token.text + '</p>');
                    break;
                case 'copyright':
                    this.title_page.push('<p class=\"copyright\">' + token.text + '</p>');
                    break;
                case 'scene_heading':
                    this.html.push('<h3' + (token.scene_number ? ' id=\"' + token.scene_number + '\">' : '>') + token.text + '</h3>');
                    break;
                case 'transition':
                    this.html.push('<h2>' + token.text + '</h2>');
                    break;
                case 'dual_dialogue_begin':
                    this.html.push('<div class=\"dual-dialogue\">');
                    break;
                case 'dialogue_begin':
                    this.html.push('<div class=\"dialogue' + (token.dual ? ' ' + token.dual : '') + '\">');
                    break;
                case 'character':
                    this.html.push('<h4>' + token.text + '</h4>');
                    break;
                case 'parenthetical':
                    this.html.push('<p class=\"parenthetical\">' + token.text + '</p>');
                    break;
                case 'dialogue':
                    this.html.push('<p>' + token.text + '</p>');
                    break;
                case 'dialogue_end':
                    this.html.push('</div> ');
                    break;
                case 'dual_dialogue_end':
                    this.html.push('</div> ');
                    break;
                case 'section':
                    this.html.push('<p class=\"section\" data-depth=\"' + token.depth + '\">' + token.text + '</p>');
                    break;
                case 'synopsis':
                    this.html.push('<p class=\"synopsis\">' + token.text + '</p>');
                    break;
                case 'note':
                    this.html.push('<!-- ' + token.text + '-->');
                    break;
                case 'boneyard_begin':
                    this.html.push('<!-- ');
                    break;
                case 'boneyard_end':
                    this.html.push(' -->');
                    break;
                case 'action':
                    this.html.push('<p>' + token.text + '</p>');
                    break;
                case 'centered':
                    this.html.push('<p class=\"centered\">' + token.text + '</p>');
                    break;
                case 'page_break':
                    this.html.push('<hr />');
                    break;
                case 'line_break':
                    this.html.push('<br />');
                    break;
            }
        }
        return {
            title: this.title,
            html: {
                title_page: this.title_page.join(''),
                script: this.html.join('')
            },
            tokens: getTokens ? this.tokens.reverse() : undefined
        };
    };
    return Fountain;
}());
exports.Fountain = Fountain;

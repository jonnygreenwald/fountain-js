"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var regex_1 = require("./regex");
var Lexer = /** @class */ (function () {
    function Lexer() {
    }
    Lexer.prototype.reconstruct = function (script) {
        return script.replace(regex_1.regex.boneyard, '\n$1\n')
            .replace(regex_1.regex.standardizer, '\n')
            .replace(regex_1.regex.cleaner, '')
            .replace(regex_1.regex.whitespacer, '');
    };
    return Lexer;
}());
exports.Lexer = Lexer;
var InlineLexer = /** @class */ (function (_super) {
    __extends(InlineLexer, _super);
    function InlineLexer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.inline = {
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
        return _this;
    }
    InlineLexer.prototype.reconstruct = function (text) {
        if (!text) {
            return;
        }
        var styles = ['underline', 'italic', 'bold', 'bold_italic', 'italic_underline', 'bold_underline', 'bold_italic_underline'];
        var i = styles.length;
        var style, match;
        text = text.replace(regex_1.regex.note_inline, this.inline.note).replace(/\\\*/g, '[star]').replace(/\\_/g, '[underline]').replace(/\n/g, this.inline.line_break);
        while (i--) {
            style = styles[i];
            match = regex_1.regex[style];
            if (match.test(text)) {
                text = text.replace(match, this.inline[style]);
            }
        }
        return text.replace(/\[star\]/g, '*').replace(/\[underline\]/g, '_').trim();
    };
    return InlineLexer;
}(Lexer));
exports.InlineLexer = InlineLexer;

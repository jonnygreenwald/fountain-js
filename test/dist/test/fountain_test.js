"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var fountain_1 = require("../src/fountain");
describe('Fountain Markup Parser', function () {
    it('should exist', function () {
        assert.notEqual(fountain_1.Fountain, undefined);
    });
    it('should return tokens when true', function () {
        var action = "It was a cold and clear morning.";
        var actual = new fountain_1.Fountain().parser(action, true);
        var expected = {
            title: undefined,
            html: {
                title_page: "",
                script: "<p>It was a cold and clear morning.</p>"
            },
            tokens: [{
                    type: 'action',
                    text: 'It was a cold and clear morning.'
                }]
        };
        assert.deepEqual(actual, expected);
    });
    it('should parse a scene heading', function () {
        var sceneHeading = "EXT. BRICK'S PATIO - DAY";
        var actual = new fountain_1.Fountain().parser(sceneHeading);
        var expected = {
            title: undefined,
            html: {
                title_page: '',
                script: "<h3>EXT. BRICK'S PATIO - DAY</h3>"
            },
            tokens: undefined
        };
        assert.deepEqual(actual, expected);
    });
});
describe('Inline markdown lexer', function () {
    it('should parse bold italics underline', function () {
        var inlineText = '_***bold italics underline***_', output = new fountain_1.Fountain().parser(inlineText);
        var actual = output.html.script, expected = '<p><span class=\"bold italic underline\">bold italics underline</span></p>';
        assert.equal(actual, expected);
    });
    it('should parse bold underline', function () {
        var inlineText = '_**bold underline**_', output = new fountain_1.Fountain().parser(inlineText);
        var actual = output.html.script, expected = '<p><span class=\"bold underline\">bold underline</span></p>';
        assert.equal(actual, expected);
    });
    it('should parse italic underline', function () {
        var inlineText = '_*italic underline*_', output = new fountain_1.Fountain().parser(inlineText);
        var actual = output.html.script, expected = '<p><span class=\"italic underline\">italic underline</span></p>';
        assert.equal(actual, expected);
    });
    it('should parse bold italics', function () {
        var inlineText = '***bold italics***', output = new fountain_1.Fountain().parser(inlineText);
        var actual = output.html.script, expected = '<p><span class=\"bold italic\">bold italics</span></p>';
        assert.equal(actual, expected);
    });
    it('should parse bold', function () {
        var inlineText = '**bold**', output = new fountain_1.Fountain().parser(inlineText);
        var actual = output.html.script, expected = '<p><span class=\"bold\">bold</span></p>';
        assert.equal(actual, expected);
    });
    it('should parse italic', function () {
        var inlineText = '*italics*', output = new fountain_1.Fountain().parser(inlineText);
        var actual = output.html.script, expected = '<p><span class=\"italic\">italics</span></p>';
        assert.equal(actual, expected);
    });
    it('should parse underline', function () {
        var inlineText = '_underline_', output = new fountain_1.Fountain().parser(inlineText);
        var actual = output.html.script, expected = '<p><span class=\"underline\">underline</span></p>';
        assert.equal(actual, expected);
    });
    it('should parse inline markdown', function () {
        var inlineText = '_***bold italics underline***_ _**bold underline**_ _*italic underline*_ ***bold italics*** **bold** *italics* _underline_', output = new fountain_1.Fountain().parser(inlineText);
        var actual = output.html.script, expected = '<p><span class=\"bold italic underline\">bold italics underline</span> <span class=\"bold underline\">bold underline</span> <span class=\"italic underline\">italic underline</span> <span class=\"bold italic\">bold italics</span> <span class=\"bold\">bold</span> <span class=\"italic\">italics</span> <span class=\"underline\">underline</span></p>';
        assert.equal(actual, expected);
    });
});

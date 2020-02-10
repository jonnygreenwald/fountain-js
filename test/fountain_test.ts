import * as assert from 'assert';
import { Fountain, Script } from '../src/fountain';

describe('Fountain Markup Parser', function () {
    it('should exist', function () {
        assert.notEqual(Fountain, undefined);
    });

    it('should return tokens when true', function () {
        let action = "It was a cold and clear morning.";

        let actual: Script = new Fountain().parser(action, true);
        let expected: Script = {
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
        let sceneHeading = "EXT. BRICK'S PATIO - DAY";
        
        let actual: Script = new Fountain().parser(sceneHeading);
        let expected: Script = { 
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
        let inlineText = '_***bold italics underline***_',
            output: Script = new Fountain().parser(inlineText);
        
        let actual: string = output.html.script,
            expected = '<p><span class=\"bold italic underline\">bold italics underline</span></p>';
        
        assert.equal(actual, expected);
    });

    it('should parse bold underline', function () {
        let inlineText = '_**bold underline**_',
            output: Script = new Fountain().parser(inlineText);
        
        let actual: string = output.html.script,
            expected = '<p><span class=\"bold underline\">bold underline</span></p>';
        
        assert.equal(actual, expected);
    });

    it('should parse italic underline', function () {
        let inlineText = '_*italic underline*_',
            output: Script = new Fountain().parser(inlineText);
        
        let actual: string = output.html.script,
            expected = '<p><span class=\"italic underline\">italic underline</span></p>';
        
        assert.equal(actual, expected);
    });

    it('should parse bold italics', function () {
        let inlineText = '***bold italics***',
            output: Script = new Fountain().parser(inlineText);
        
        let actual: string = output.html.script,
            expected = '<p><span class=\"bold italic\">bold italics</span></p>';
        
        assert.equal(actual, expected);
    });

    it('should parse bold', function () {
        let inlineText = '**bold**',
            output: Script = new Fountain().parser(inlineText);
        
        let actual: string = output.html.script,
            expected = '<p><span class=\"bold\">bold</span></p>';
        
        assert.equal(actual, expected);
    });

    it('should parse italic', function () {
        let inlineText = '*italics*',
            output: Script = new Fountain().parser(inlineText);
        
        let actual: string = output.html.script,
            expected = '<p><span class=\"italic\">italics</span></p>';
        
        assert.equal(actual, expected);
    });

    it('should parse underline', function () {
        let inlineText = '_underline_',
            output: Script = new Fountain().parser(inlineText);
        
        let actual: string = output.html.script,
            expected = '<p><span class=\"underline\">underline</span></p>';
        
        assert.equal(actual, expected);
    });

    it('should parse inline markdown', function () {
        let inlineText = '_***bold italics underline***_ _**bold underline**_ _*italic underline*_ ***bold italics*** **bold** *italics* _underline_',
            output: Script = new Fountain().parser(inlineText);

        let actual: string = output.html.script,
            expected = '<p><span class=\"bold italic underline\">bold italics underline</span> <span class=\"bold underline\">bold underline</span> <span class=\"italic underline\">italic underline</span> <span class=\"bold italic\">bold italics</span> <span class=\"bold\">bold</span> <span class=\"italic\">italics</span> <span class=\"underline\">underline</span></p>';
        
        assert.equal(actual, expected);
    });
});
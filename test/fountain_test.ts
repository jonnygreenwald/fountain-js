import * as assert from 'assert';
import { Fountain, Script } from '../src/fountain';

describe('Fountain Markup Parser', function () {
    it('should exist', function () {
        assert.notEqual(Fountain, undefined);
    });

    it('should return tokens when true', function () {
        let action = "It was a cold and clear morning.";

        let actual: Script = new Fountain().parse(action, true);
        let expected: Script = {
            title: undefined,
            html: {
                title_page: '',
                script: "<p>It was a cold and clear morning.</p>"
            },
            tokens: [{
                type: 'action',
                text: 'It was a cold and clear morning.'
            }]
        };

        assert.deepEqual(actual, expected);
    });

    it('should parse a title page', function () {
        let title_page = `Title:
                            _**BRICK & STEEL**_
                            _**FULL RETIRED**_
                        Credit: Written by
                        Author: Stu Maschwitz
                        Source: Story by KTM
                        Draft date: 1/27/2012
                        Contact:
                            Next Level Productions
                            1588 Mission Dr.
                            Solvang, CA 93463`;
        
        let actual: Script = new Fountain().parse(title_page);
        let expected: Script = {
            title: 'BRICK & STEEL FULL RETIRED',
            html: {
                title_page: '<h1><span class="bold underline">BRICK & STEEL</span><br /><span class="bold underline">FULL RETIRED</span></h1><p class="credit">Written by</p><p class="authors">Stu Maschwitz</p><p class="source">Story by KTM</p><p class="draft-date">1/27/2012</p><p class="contact">Next Level Productions<br />1588 Mission Dr.<br />Solvang, CA 93463</p>',
                script: ''
            },
            tokens: undefined
        };

        assert.deepEqual(actual, expected);
    });

    it('should parse a scene heading', function () {
        let sceneHeading = "EXT. BRICK'S PATIO - DAY";
        
        let actual: Script = new Fountain().parse(sceneHeading);
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

    it('should parse some transitions, forced headings and centered text', function () {
        let text = `.OPENING TITLES

                    > BRICK & STEEL <
                    > FULL RETIRED <

                    SMASH CUT TO:`;
        
        let output: Script = new Fountain().parse(text),
            actual: string = output.html.script;

        let expected = '<h3>OPENING TITLES</h3><p class="centered">BRICK & STEEL <br /> FULL RETIRED</p><h2>SMASH CUT TO:</h2>';
        
        assert.equal(actual, expected);
    });

    it('should parse dialog', function () {
        let dialog = `STEEL (O.S.)
                    Beer's ready!

                    BRICK
                    (skeptical)
                    Are they cold?`;
        
        let output: Script = new Fountain().parse(dialog),
            actual: string = output.html.script;

        let expected = '<div class="dialogue"><h4>STEEL (O.S.)</h4><p>Beer\'s ready!</p></div><div class="dialogue"><h4>BRICK</h4><p class="parenthetical">(skeptical)</p><p>Are they cold?</p></div>';
        
        assert.equal(actual, expected);
    });

    it('should parse dual dialog', function () {
        let dualDialog = `STEEL
                        Screw retirement.

                        BRICK ^
                        Screw retirement.`;
        
        let output: Script = new Fountain().parse(dualDialog),
            actual: string = output.html.script;

        let expected = '<div class="dual-dialogue"><div class="dialogue left"><h4>STEEL</h4><p>Screw retirement.</p></div><div class="dialogue right"><h4>BRICK</h4><p>Screw retirement.</p></div></div>';
        
        assert.equal(actual, expected);
    });
});

describe('Inline markdown lexer', function () {
    it('should parse bold italics underline', function () {
        let inlineText = '_***bold italics underline***_',
            output: Script = new Fountain().parse(inlineText);
        
        let actual: string = output.html.script,
            expected = '<p><span class=\"bold italic underline\">bold italics underline</span></p>';
        
        assert.equal(actual, expected);
    });

    it('should parse bold underline', function () {
        let inlineText = '_**bold underline**_',
            output: Script = new Fountain().parse(inlineText);
        
        let actual: string = output.html.script,
            expected = '<p><span class=\"bold underline\">bold underline</span></p>';
        
        assert.equal(actual, expected);
    });

    it('should parse italic underline', function () {
        let inlineTextAlt1 = '_*italic underline*_',
            output: Script = new Fountain().parse(inlineTextAlt1);
        
        let actual: string = output.html.script,
            expected = '<p><span class=\"italic underline\">italic underline</span></p>';
        
        assert.equal(actual, expected);
    });

    it('should parse an alternative italic underline', function () {
        let inlineTextAlt2 = '*_italic underline_*',
            output: Script = new Fountain().parse(inlineTextAlt2);
        
        let actual: string = output.html.script,
            expected = '<p><span class=\"italic underline\">italic underline</span></p>';
        
        assert.equal(actual, expected);
    });

    it('should parse bold italics', function () {
        let inlineText = '***bold italics***',
            output: Script = new Fountain().parse(inlineText);
        
        let actual: string = output.html.script,
            expected = '<p><span class=\"bold italic\">bold italics</span></p>';
        
        assert.equal(actual, expected);
    });

    it('should parse bold', function () {
        let inlineText = '**bold**',
            output: Script = new Fountain().parse(inlineText);
        
        let actual: string = output.html.script,
            expected = '<p><span class=\"bold\">bold</span></p>';
        
        assert.equal(actual, expected);
    });

    it('should parse italic', function () {
        let inlineText = '*italics*',
            output: Script = new Fountain().parse(inlineText);
        
        let actual: string = output.html.script,
            expected = '<p><span class=\"italic\">italics</span></p>';
        
        assert.equal(actual, expected);
    });

    it('should parse underline', function () {
        let inlineText = '_underline_',
            output: Script = new Fountain().parse(inlineText);
        
        let actual: string = output.html.script,
            expected = '<p><span class=\"underline\">underline</span></p>';
        
        assert.equal(actual, expected);
    });

    it('should parse inline markdown', function () {
        let inlineText = '_***bold italics underline***_ _**bold underline**_ _*italic underline*_ ***bold italics*** **bold** *italics* _underline_',
            output: Script = new Fountain().parse(inlineText);

        let actual: string = output.html.script,
            expected = '<p><span class=\"bold italic underline\">bold italics underline</span> <span class=\"bold underline\">bold underline</span> <span class=\"italic underline\">italic underline</span> <span class=\"bold italic\">bold italics</span> <span class=\"bold\">bold</span> <span class=\"italic\">italics</span> <span class=\"underline\">underline</span></p>';
        
        assert.equal(actual, expected);
    });
});
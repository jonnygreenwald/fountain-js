import { Fountain, Script } from '../src/fountain';
import { Token } from '../src/token';

describe('Fountain Markup Parser', () => {
    it('should exist', () => {
        expect(Fountain).toBeDefined();
    });

    let fountain: Fountain;

    beforeEach(() => {
        fountain = new Fountain();
    });

    it('should return tokens when true', () => {
        const action = "It was a cold and clear morning.";

        let actual: Script = fountain.parse(action, true);
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

        expect(expected).toEqual(actual);
    });

    it('should parse forced action', () => {
        const action = '!William enters -- and there stands Anna.';

        let actual: Token[] = fountain.parse(action, true).tokens;
        let expected: Token[] = [{
                type: 'action',
                text: 'William enters -- and there stands Anna.'
        }];

        expect(expected).toEqual(actual);
    });

    it('should parse multiple lines of forced action', () => {
        const action = `!TIRES SCREECHING...
                    Joe is looking at his phone for the direction.`;

        let actual: Token[] = fountain.parse(action, true).tokens;
        let expected: Token[] = [{
                type: 'action',
                text: 'TIRES SCREECHING...<br />Joe is looking at his phone for the direction.'
        }];

        expect(expected).toEqual(actual);
    });

    it('should parse a title page', () => {
        const title_page = `Title:
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
        
        let actual: Script = fountain.parse(title_page);
        let expected: Script = {
            title: 'BRICK & STEEL FULL RETIRED',
            html: {
                title_page: '<h1><span class="bold underline">BRICK & STEEL</span><br /><span class="bold underline">FULL RETIRED</span></h1><p class="credit">Written by</p><p class="authors">Stu Maschwitz</p><p class="source">Story by KTM</p><p class="draft-date">1/27/2012</p><p class="contact">Next Level Productions<br />1588 Mission Dr.<br />Solvang, CA 93463</p>',
                script: ''
            },
            tokens: undefined
        };

        expect(expected).toEqual(actual);
    });

    it('should parse a scene heading', () => {
        const sceneHeading = "EXT. BRICK'S PATIO - DAY";

        let actual: Script = fountain.parse(sceneHeading);
        let expected: Script = { 
            title: undefined, 
            html: { 
                title_page: '', 
                script: "<h3>EXT. BRICK'S PATIO - DAY</h3>" 
            },
            tokens: undefined  
        };
        
        expect(expected).toEqual(actual);
    });

    it('should parse some transitions, forced headings and centered text', () => {
        const text = `.OPENING TITLES

                    > BRICK & STEEL <
                    > FULL RETIRED <

                    SMASH CUT TO:`;

        let output: Script = fountain.parse(text);
        let actual = output.html.script;

        let expected = '<h3>OPENING TITLES</h3><p class="centered">BRICK & STEEL <br /> FULL RETIRED</p><h2>SMASH CUT TO:</h2>';

        expect(expected).toBe(actual);
    });

    it('should parse dialog', () => {
        const dialog = `STEEL (O.S.)
                    Beer's ready!

                    BRICK
                    (skeptical)
                    Are they cold?`;

        let output: Script = fountain.parse(dialog);
        let actual = output.html.script;

        let expected = '<div class="dialogue"><h4>STEEL (O.S.)</h4><p>Beer\'s ready!</p></div><div class="dialogue"><h4>BRICK</h4><p class="parenthetical">(skeptical)</p><p>Are they cold?</p></div>';

        expect(expected).toBe(actual);
    });

    it('should parse forced dialog', () => {
        const dialog = `@McCLANE
                    Yippie ki-yay! I got my lower-case C back!`;

        let output: Script = fountain.parse(dialog);
        let actual = output.html.script;

        let expected = '<div class="dialogue"><h4>McCLANE</h4><p>Yippie ki-yay! I got my lower-case C back!</p></div>'

        expect(expected).toBe(actual);
    });

    it('should parse dual dialog', () => {
        const dualDialog = `STEEL
                        Screw retirement.

                        BRICK ^
                        Screw retirement.`;

        let output: Script = fountain.parse(dualDialog);
        let actual = output.html.script;

        let expected = '<div class="dual-dialogue"><div class="dialogue left"><h4>STEEL</h4><p>Screw retirement.</p></div><div class="dialogue right"><h4>BRICK</h4><p>Screw retirement.</p></div></div>';

        expect(expected).toBe(actual);
    });

    it('should parse character extensions regardless of case', () => {
        const dialog = `MOM (O. S.)
                    Luke! Come down for supper!

                        HANS (on the radio)
                    What was it you said?`;

        let output: Script = fountain.parse(dialog);
        let actual = output.html.script;

        let expected = '<div class="dialogue"><h4>MOM (O. S.)</h4><p>Luke! Come down for supper!</p></div><div class="dialogue"><h4>HANS (on the radio)</h4><p>What was it you said?</p></div>';

        expect(expected).toBe(actual);
    });

    it('should parse notes', () => {
        const notes = '[[Add an additional beat here]]';

        let output: Script = fountain.parse(notes);
        let actual = output.html.script;

        const expected = '<!-- Add an additional beat here -->';

        expect(expected).toBe(actual);
    });

    it('should parse lyrics', () => {
        const lyrics = `~Willy Wonka! Willy Wonka! The amazing chocolatier!
                        ~Willy Wonka! Willy Wonka! Everybody give a cheer!`;

        let output: Script = fountain.parse(lyrics);
        let actual = output.html.script;

        const expected = '<p class="lyrics">Willy Wonka! Willy Wonka! The amazing chocolatier!<br />Willy Wonka! Willy Wonka! Everybody give a cheer!</p>';

        expect(expected).toBe(actual);
    });
});

describe('Inline markdown lexer', () => {
    let fountain: Fountain;

    beforeEach(() => {
        fountain = new Fountain();
    });

    it('should parse bold italics underline', () => {
        const inlineText = '_***bold italics underline***_';
        let output: Script = fountain.parse(inlineText);
        
        let actual = output.html.script;
        let expected = '<p><span class=\"bold italic underline\">bold italics underline</span></p>';

        expect(expected).toBe(actual);
    });

    it('should parse bold underline', () => {
        const inlineText = '_**bold underline**_';
        let output: Script = fountain.parse(inlineText);

        let actual = output.html.script;
        let expected = '<p><span class=\"bold underline\">bold underline</span></p>';

        expect(expected).toBe(actual);
    });

    it('should parse italic underline', () => {
        const inlineText = '_*italic underline*_';
        let output: Script = fountain.parse(inlineText);

        let actual = output.html.script;
        let expected = '<p><span class=\"italic underline\">italic underline</span></p>';

        expect(expected).toBe(actual);
    });

    it('should parse an alternative italic underline', () => {
        const inlineText = '*_italic underline_*';
        let output: Script = fountain.parse(inlineText);

        let actual = output.html.script;
        let expected = '<p><span class=\"italic underline\">italic underline</span></p>';

        expect(expected).toBe(actual);
    });

    it('should parse bold italics', () => {
        const inlineText = '***bold italics***';
        let output: Script = fountain.parse(inlineText);

        let actual = output.html.script;
        let expected = '<p><span class=\"bold italic\">bold italics</span></p>';

        expect(expected).toBe(actual);
    });

    it('should parse bold', () => {
        const inlineText = '**bold**';
        let output: Script = fountain.parse(inlineText);

        let actual = output.html.script;
        let expected = '<p><span class=\"bold\">bold</span></p>';

        expect(expected).toBe(actual);
    });

    it('should parse italic', () => {
        const inlineText = '*italics*';
        let output: Script = fountain.parse(inlineText);

        let actual = output.html.script;
        let expected = '<p><span class=\"italic\">italics</span></p>';

        expect(expected).toBe(actual);
    });

    it('should parse underline', () => {
        const inlineText = '_underline_';
        let output: Script = fountain.parse(inlineText);

        let actual = output.html.script;
        let expected = '<p><span class=\"underline\">underline</span></p>';

        expect(expected).toBe(actual);
    });

    it('should parse inline markdown', () => {
        const inlineText = '_***bold italics underline***_ _**bold underline**_ _*italic underline*_ ***bold italics*** **bold** *italics* _underline_';
        let output: Script = fountain.parse(inlineText);

        let actual = output.html.script;
        let expected = '<p><span class=\"bold italic underline\">bold italics underline</span> <span class=\"bold underline\">bold underline</span> <span class=\"italic underline\">italic underline</span> <span class=\"bold italic\">bold italics</span> <span class=\"bold\">bold</span> <span class=\"italic\">italics</span> <span class=\"underline\">underline</span></p>';

        expect(expected).toBe(actual);
    });
});
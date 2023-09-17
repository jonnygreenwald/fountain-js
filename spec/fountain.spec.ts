import { Fountain, Script } from '../src/fountain';
import { ActionToken, SceneHeadingToken, Token } from '../src/token';

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
            tokens: [
                new ActionToken('It was a cold and clear morning.')
            ]
        };

        expect(actual).toEqual(expected);
    });

    it('should parse forced action', () => {
        const action = '!William enters -- and there stands Anna.';

        let actual: Token[] = fountain.parse(action, true).tokens || [];
        let expected: Token[] = [
            new ActionToken('William enters -- and there stands Anna.')
        ];

        expect(actual).toEqual(expected);
    });

    it('should parse multiple lines of forced action', () => {
        const action = `!TIRES SCREECHING...
                    Joe is looking at his phone for the direction.`;

        let actual: Token[] = fountain.parse(action, true).tokens || [];
        let expected: Token[] = [
            new ActionToken('TIRES SCREECHING...\nJoe is looking at his phone for the direction.')
        ];

        expect(actual).toEqual(expected);
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

        expect(actual).toEqual(expected);
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
        
        expect(actual).toEqual(expected);
    });

    it('should consider these variations scene headings', () => {
        const intHeading = 'INT HOUSE - NOON';
        const extHeading = "EXT. BRICK'S PATIO - DAY";
        const estHeading = 'EST. FRONT LAWN - CONTINUOUS';
        const lowerIntExtHeading = 'int/ext olympia circus - night'
        const upperIntExtHeading = 'INT./EXT OLYMPIA CIRCUS - NIGHT'
        const ieHeading = 'I/E ANOTHER CIRCUS - DAY'

        let intActual = fountain.parse(intHeading).html.script;
        let extActual = fountain.parse(extHeading).html.script;
        let estActual = fountain.parse(estHeading).html.script;
        let lowerActual = fountain.parse(lowerIntExtHeading).html.script;
        let upperActual = fountain.parse(upperIntExtHeading).html.script;
        let ieActual = fountain.parse(ieHeading).html.script;

        expect(intActual).toBe('<h3>INT HOUSE - NOON</h3>');
        expect(extActual).toBe("<h3>EXT. BRICK'S PATIO - DAY</h3>");
        expect(estActual).toBe('<h3>EST. FRONT LAWN - CONTINUOUS</h3>');
        expect(lowerActual).toBe('<h3>int/ext olympia circus - night</h3>');
        expect(upperActual).toBe('<h3>INT./EXT OLYMPIA CIRCUS - NIGHT</h3>');
        expect(ieActual).toBe('<h3>I/E ANOTHER CIRCUS - DAY</h3>');
    });

    it('should parse a scene number', () => {
        const numHeaindg = 'INT. HOUSE - DAY #1#';
        const alphaHeading = 'I/E HOUSE - DAY #A#';
        const alphaNumHeading = 'INT/EXT. HOUSE - DAY - FLASHBACK (1944) #110.A#';

        let numToken: Token[] = fountain.parse(numHeaindg, true).tokens || [];
        let alphaToken: Token[] = fountain.parse(alphaHeading, true).tokens || [];
        let alphaNumToken: Token[] = fountain.parse(alphaNumHeading, true).tokens || [];

        expect(numToken).toEqual([ new SceneHeadingToken('INT. HOUSE - DAY #1#') ]);
        expect(alphaToken).toEqual([ new SceneHeadingToken('I/E HOUSE - DAY #A#') ]);
        expect(alphaNumToken).toEqual([ 
            new SceneHeadingToken('INT/EXT. HOUSE - DAY - FLASHBACK (1944) #110.A#')
        ]);
    });

    it('should parse forced, single-aplhanumeric scene headings', () => {
        const heading = '.1';

        let actual: Token[] = fountain.parse(heading, true).tokens || [];
        let expected: Token[] = [ new SceneHeadingToken('.1') ];

        expect(actual).toEqual(expected);
    });

    it('should treat a period only at start of a line as action', () => {
        const notHeading = '.  ';

        let actual: Token[] = fountain.parse(notHeading, true).tokens || [];
        let expected: Token[] = [ new ActionToken('.  ') ];

        expect(actual).toEqual(expected);
    });

    it('should parse some transitions, forced headings and centered text', () => {
        const text = `.OPENING TITLES

                    > BRICK & STEEL <
                    > FULL RETIRED <

                    SMASH CUT TO:`;

        let output: Script = fountain.parse(text);
        let actual = output.html.script;

        let expected = '<h3>OPENING TITLES</h3><p class="centered">BRICK & STEEL <br /> FULL RETIRED</p><h2>SMASH CUT TO:</h2>';

        expect(actual).toBe(expected);
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

        expect(actual).toBe(expected);
    });

    it('should should respect a "two spaces" line break in dialogue', () => {
        const dialog = `DEALER
                    Ten.
                    Four.
                    Dealer gets a seven.
  
                    Hit or stand sir?

                        MONKEY
                    Dude, I'm a monkey.`;

        let output: Script = fountain.parse(dialog);
        let actual = output.html.script;

        let expected = `<div class="dialogue"><h4>DEALER</h4><p>Ten.<br />Four.<br />Dealer gets a seven.<br />  <br />Hit or stand sir?</p></div><div class="dialogue"><h4>MONKEY</h4><p>Dude, I'm a monkey.</p></div>`;
        expect(actual).toBe(expected);
    });

    it('should parse forced dialog', () => {
        const dialog = `@McCLANE
                    Yippie ki-yay! I got my lower-case C back!`;

        let output: Script = fountain.parse(dialog);
        let actual = output.html.script;

        let expected = '<div class="dialogue"><h4>McCLANE</h4><p>Yippie ki-yay! I got my lower-case C back!</p></div>'

        expect(actual).toBe(expected);
    });

    it('should parse dual dialog', () => {
        const dualDialog = `STEEL
                        Screw retirement.

                        BRICK ^
                        Screw retirement.`;

        let output: Script = fountain.parse(dualDialog);
        let actual = output.html.script;

        let expected = '<div class="dual-dialogue"><div class="dialogue left"><h4>STEEL</h4><p>Screw retirement.</p></div><div class="dialogue right"><h4>BRICK</h4><p>Screw retirement.</p></div></div>';

        expect(actual).toBe(expected);
    });

    it('should parse character extensions regardless of case', () => {
        const dialog = `MOM (O. S.)
                    Luke! Come down for supper!

                        HANS (on the radio)
                    What was it you said?`;

        let output: Script = fountain.parse(dialog);
        let actual = output.html.script;

        let expected = '<div class="dialogue"><h4>MOM (O. S.)</h4><p>Luke! Come down for supper!</p></div><div class="dialogue"><h4>HANS (on the radio)</h4><p>What was it you said?</p></div>';

        expect(actual).toBe(expected);
    });

    it('should parse single-letter character names', () => {
        const dialog = `A
                    Pieces were stolen from me.`

        let output: Script = fountain.parse(dialog);
        let actual = output.html.script;

        let expected = '<div class="dialogue"><h4>A</h4><p>Pieces were stolen from me.</p></div>';

        expect(actual).toBe(expected);
    });

    it('should parse forced, single-letter character names', () => {
        const dialog = `    @B
                    They never gave mine back.`

        let output: Script = fountain.parse(dialog);
        let actual = output.html.script;

        let expected = '<div class="dialogue"><h4>B</h4><p>They never gave mine back.</p></div>';

        expect(actual).toBe(expected);
    });

    it('should allow special characters and numbers in the character names', () => {
        const dialog = `DISGRUNTLED CITIZEN #1
                    (standing)
                    Excuse me. How much did it cost?`

        let output: Script = fountain.parse(dialog);
        let actual = output.html.script;

        let expected = '<div class="dialogue"><h4>DISGRUNTLED CITIZEN #1</h4><p class="parenthetical">(standing)</p><p>Excuse me. How much did it cost?</p></div>';

        expect(actual).toBe(expected);
    });

    it('should not allow character names that are all numbers per spec', () => {
        const dialog = `11 (O.S.)
                    I'm the monster.`

        let output: Script = fountain.parse(dialog);
        let actual = output.html.script;

        let expected = "<p>11 (O.S.)<br />I'm the monster.</p>";

        expect(actual).toBe(expected);
    });

    it('should allow character names that are all numbers if forced', () => {
        const dialog = `@11
                    I'm the monster.`

        let output: Script = fountain.parse(dialog);
        let actual = output.html.script;

        let expected = '<div class="dialogue"><h4>11</h4><p>I\'m the monster.</p></div>';

        expect(actual).toBe(expected);
    });

    it('should parse notes', () => {
        const notes = '[[Add an additional beat here]]';

        let output: Script = fountain.parse(notes);
        let actual = output.html.script;

        const expected = '<!-- Add an additional beat here -->';

        expect(actual).toBe(expected);
    });

    it('should parse lyrics', () => {
        const lyrics = `~Willy Wonka! Willy Wonka! The amazing chocolatier!
                        ~Willy Wonka! Willy Wonka! Everybody give a cheer!`;

        let output: Script = fountain.parse(lyrics);
        let actual = output.html.script;

        const expected = '<p class="lyrics">Willy Wonka! Willy Wonka! The amazing chocolatier!<br />Willy Wonka! Willy Wonka! Everybody give a cheer!</p>';

        expect(actual).toBe(expected);
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
        let expected = '<p><span class="bold italic underline">bold italics underline</span></p>';

        expect(actual).toBe(expected);
    });

    it('should parse bold underline', () => {
        const inlineText = '_**bold underline**_';
        let output: Script = fountain.parse(inlineText);

        let actual = output.html.script;
        let expected = '<p><span class="bold underline">bold underline</span></p>';

        expect(actual).toBe(expected);
    });

    it('should parse italic underline', () => {
        const inlineText = '_*italic underline*_';
        let output: Script = fountain.parse(inlineText);

        let actual = output.html.script;
        let expected = '<p><span class="italic underline">italic underline</span></p>';

        expect(actual).toBe(expected);
    });

    it('should parse an alternative italic underline', () => {
        const inlineText = '*_italic underline_*';
        let output: Script = fountain.parse(inlineText);

        let actual = output.html.script;
        let expected = '<p><span class="italic underline">italic underline</span></p>';

        expect(actual).toBe(expected);
    });

    it('should parse bold italics', () => {
        const inlineText = '***bold italics***';
        let output: Script = fountain.parse(inlineText);

        let actual = output.html.script;
        let expected = '<p><span class="bold italic">bold italics</span></p>';

        expect(actual).toBe(expected);
    });

    it('should parse bold', () => {
        const inlineText = '**bold**';
        let output: Script = fountain.parse(inlineText);

        let actual = output.html.script;
        let expected = '<p><span class="bold">bold</span></p>';

        expect(actual).toBe(expected);
    });

    it('should parse italic', () => {
        const inlineText = '*italics*';
        let output: Script = fountain.parse(inlineText);

        let actual = output.html.script;
        let expected = '<p><span class="italic">italics</span></p>';

        expect(actual).toBe(expected);
    });

    it('should parse underline', () => {
        const inlineText = '_underline_';
        let output: Script = fountain.parse(inlineText);

        let actual = output.html.script;
        let expected = '<p><span class="underline">underline</span></p>';

        expect(actual).toBe(expected);
    });

    it('should parse inline markdown', () => {
        const inlineText = '_***bold italics underline***_ _**bold underline**_ _*italic underline*_ ***bold italics*** **bold** *italics* _underline_';
        let output: Script = fountain.parse(inlineText);

        let actual = output.html.script;
        let expected = '<p><span class="bold italic underline">bold italics underline</span> <span class="bold underline">bold underline</span> <span class="italic underline">italic underline</span> <span class="bold italic">bold italics</span> <span class="bold">bold</span> <span class="italic">italics</span> <span class="underline">underline</span></p>';

        expect(actual).toBe(expected);
    });

    it('should parse inlines in character names', () => {
        const bold = `**MR. SELF DESTRUCT**
                    I am the voice inside your head.`

        let actual = fountain.parse(bold).html.script;
        let expected = '<div class="dialogue"><h4><span class="bold">MR. SELF DESTRUCT</span></h4><p>I am the voice inside your head.</p></div>';
        expect(actual).toBe(expected);

        const italic = `*MR. SELF DESTRUCT*
                    I am the lover in your bed.`

        actual = fountain.parse(italic).html.script;
        expected = '<div class="dialogue"><h4><span class="italic">MR. SELF DESTRUCT</span></h4><p>I am the lover in your bed.</p></div>';
        expect(actual).toBe(expected);

        const underline = `_MR. SELF DESTRUCT_
                    I am the hate you try to hide.`

        actual = fountain.parse(underline).html.script;
        expected = '<div class="dialogue"><h4><span class="underline">MR. SELF DESTRUCT</span></h4><p>I am the hate you try to hide.</p></div>';
        expect(actual).toBe(expected);

        const boldItalic = `***MR. SELF DESTRUCT***
                    And I control you...`

        actual = fountain.parse(boldItalic).html.script;
        expected = '<div class="dialogue"><h4><span class="bold italic">MR. SELF DESTRUCT</span></h4><p>And I control you...</p></div>';
        expect(actual).toBe(expected);
    });
});

describe('Additional compatibility tests', () => {
    it('should use OOP token objects that are backwards-compatible with old versions', () => {
        const text = 'The SCREEN DOOR slides ...es with two cold beers.';
        const legacyToken = { type: 'action', text };
        const oopToken = new ActionToken(text);

        expect(oopToken).toBeInstanceOf(Object);
        expect(JSON.stringify(oopToken)).toEqual(JSON.stringify(legacyToken));
        expect(oopToken.text).toEqual(legacyToken.text);
        expect(oopToken.type).toEqual(legacyToken.type);
    });

    let fountain: Fountain;

    beforeEach(() => {
        fountain = new Fountain();
    });

    it('should not mutate token text when converting to HTML', () => {
        const action = `Murtaugh, springing hell bent for leather -- and folks,
                        grab your hats … because just then, a _BELL COBRA
                        HELICOPTER_ crests the edge of the bluff.`;

        let output: Script = fountain.parse(action, true);

        let expectedTokens = [
            new ActionToken(
                'Murtaugh, springing hell bent for leather -- and folks,\n'
                + 'grab your hats … because just then, a _BELL COBRA\n'
                + 'HELICOPTER_ crests the edge of the bluff.'
            )
        ] as Token[];

        let expectedHTML = '<p>Murtaugh, springing hell bent for leather -- and folks,<br />grab your hats … because just then, a <span class="underline">BELL COBRA<br />HELICOPTER</span> crests the edge of the bluff.</p>'

        expect(output.tokens).toEqual(expectedTokens);
        expect(output.html.script).toBe(expectedHTML);
    });

    it('should return tokens via `getTokens` and its property', () => {
        let output: Script = fountain.parse(
            'They drink long and well from the beers.',
            true
        );
        expect(output.tokens).toEqual(fountain.tokens);

        let scene = `EXT. OLYMPIA CIRCUS - NIGHT

        ...where the second-rate carnival is parked for the moment in an Alabama field.`;

        output = fountain.parse(scene, true);
        expect(output.tokens).toEqual(fountain.tokens);
    });
});
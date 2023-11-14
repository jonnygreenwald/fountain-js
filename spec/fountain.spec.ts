import { Fountain, Script } from '../src/fountain';
import { ActionToken, SceneHeadingToken, TitlePageToken, Token } from '../src/token';

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

        let actual = fountain.parse(action, true);
        let expected: Script = {
            title: '',
            html: {
                title_page: '',
                script: '<p>It was a cold and clear morning.</p>'
            },
            tokens: [
                new ActionToken('It was a cold and clear morning.')
            ]
        };

        expect(actual).toEqual(expected);
    });

    it('should parse forced action', () => {
        const action = '!William enters -- and there stands Anna.';

        let actual = fountain.parse(action, true).tokens;
        let expected = [
            new ActionToken('William enters -- and there stands Anna.')
        ];

        expect(actual).toEqual(expected);
    });

    it('should parse multiple lines of forced action', () => {
        const action = `    !TIRES SCREECHING...
                    Joe is looking at his phone for the direction.`;

        let actual = fountain.parse(action, true).tokens;
        let expected = [
            new ActionToken('    TIRES SCREECHING...\n                    Joe is looking at his phone for the direction.')
        ];

        expect(actual).toEqual(expected);
    });

    it('should retain spaces in action elements per spec', () => {
        const spaces = '    I need a little space.';

        let actual = fountain.parse(spaces).html.script;
        let expected = '<p>&nbsp;&nbsp;&nbsp;&nbsp;I need a little space.</p>';

        expect(actual).toBe(expected);
    });

    it('should convert tabs in action to four spaces per spec', () => {
        const tabs = "  \tHow 'bout a tab?   ";

        let actual = fountain.parse(tabs).html.script;
        let expected = "<p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;How 'bout a tab?</p>";

        expect(actual).toEqual(expected);
    });

    it('should parse a script with a title page', () => {
        const source = `Title:
                            _**BRICK & STEEL**_
                            _**FULL RETIRED**_
                        Credit: Written by
                        Author: Stu Maschwitz
                        Source: Story by KTM
                        Draft date: 1/27/2012
                        Contact:
                            Next Level Productions
                            1588 Mission Dr.
                            Solvang, CA 93463\n\n`
                        + "EXT. BRICK'S PATIO - DAY\n\n"
                        + "A gorgeous day.  The sun is shining.  But BRICK BRADDOCK, retired police detective, is sitting quietly, contemplating -- something.";

        let actual = fountain.parse(source);
        const title_page = '<h1><span class="bold underline">BRICK &amp; STEEL</span><br /><span class="bold underline">FULL RETIRED</span></h1>'
                        + '<p class="credit">Written by</p><p class="authors">Stu Maschwitz</p>'
                        + '<p class="source">Story by KTM</p>'
                        + '<p class="draft-date">1/27/2012</p>'
                        + '<p class="contact">Next Level Productions<br />1588 Mission Dr.<br />Solvang, CA 93463</p>';
        const script = "<h3>EXT. BRICK'S PATIO - DAY</h3>"
                        + "<p>A gorgeous day.  The sun is shining.  But BRICK BRADDOCK, retired police detective, is sitting quietly, contemplating -- something.</p>";

        let expected: Script = {
            title: 'BRICK & STEEL FULL RETIRED',
            html: { title_page, script },
            tokens: []
        };

        expect(actual).toEqual(expected);
    });

    it('should ignore unrecognized title fields', () => {
        const title_page = `Title: _**BRICK & STEEL**_\nRevision: Blue\nType: Pilot`;

        let output = fountain.parse(title_page, true);

        let actual = output.html.title_page;
        let expected = '<h1><span class="bold underline">BRICK &amp; STEEL</span></h1><p class="revision">Blue</p>'

        const expectedTitleTokens: TitlePageToken[] = [
            new TitlePageToken('Title: _**BRICK & STEEL**_'),
            new TitlePageToken('Revision: Blue'),
            new TitlePageToken('Type: Pilot')
        ];

        expect(actual).toBe(expected);
        expect(output.tokens).toEqual(expectedTitleTokens);
    });

    it('should allow additional colons in title page key-value pair', () => {
        const colonValue = `Title: Big Fish
                            Credit: written by
                            Author: John August
                            Copyright: (c) 2003: Columbia Pictures`;

        let actual = fountain.parse(colonValue).html.title_page;
        let expected = '<h1>Big Fish</h1><p class="credit">written by</p>'
                    + '<p class="authors">John August</p>'
                    + '<p class="copyright">(c) 2003: Columbia Pictures</p>';

        expect(actual).toBe(expected);
    });

    it('should fall to action if title page key-value pairs are invalid', () => {
        const invalidKeyPairs = 'Title: Big Fish\nCredit:\nAuthor: John August';

        let output = fountain.parse(invalidKeyPairs);
        let actual = output.html.title_page;
        let expected = '<h1>Big Fish</h1>';
        expect(actual).toBe(expected);

        actual = output.html.script;
        expected = '<p>Credit:<br />Author: John August</p>';
        expect(actual).toBe(expected);
    });

    it('should parse a scene heading', () => {
        const sceneHeading = "EXT. BRICK'S PATIO - DAY";

        let actual = fountain.parse(sceneHeading);
        let expected: Script = {
            title: '', 
            html: { 
                title_page: '', 
                script: "<h3>EXT. BRICK'S PATIO - DAY</h3>" 
            },
            tokens: []
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
        const iePeriodHeading = 'I./E. A DIFFERENT CIRCUS - MOMENTS LATER'

        let intActual = fountain.parse(intHeading).html.script;
        let extActual = fountain.parse(extHeading).html.script;
        let estActual = fountain.parse(estHeading).html.script;
        let lowerActual = fountain.parse(lowerIntExtHeading).html.script;
        let upperActual = fountain.parse(upperIntExtHeading).html.script;
        let ieActual = fountain.parse(ieHeading).html.script;
        let iePeriodActual = fountain.parse(iePeriodHeading).html.script;

        expect(intActual).toBe('<h3>INT HOUSE - NOON</h3>');
        expect(extActual).toBe("<h3>EXT. BRICK'S PATIO - DAY</h3>");
        expect(estActual).toBe('<h3>EST. FRONT LAWN - CONTINUOUS</h3>');
        expect(lowerActual).toBe('<h3>int/ext olympia circus - night</h3>');
        expect(upperActual).toBe('<h3>INT./EXT OLYMPIA CIRCUS - NIGHT</h3>');
        expect(ieActual).toBe('<h3>I/E ANOTHER CIRCUS - DAY</h3>');
        expect(iePeriodActual).toBe('<h3>I./E. A DIFFERENT CIRCUS - MOMENTS LATER</h3>');
    });

    it('should parse a scene number', () => {
        const numHeaindg = 'INT. HOUSE - DAY #1#';
        const alphaHeading = 'I/E HOUSE - DAY #A#';
        const dashHeading = 'INT. HOUSE - DAY #I-1-A#';
        const periodHeading = 'I./E HOUSE - DAY #1.#';
        const alphaNumHeading = 'INT/EXT. HOUSE - DAY - FLASHBACK (1944) #110.A#';

        let actual = fountain.parse(numHeaindg).html.script;
        let expected = '<h3 id="1">INT. HOUSE - DAY</h3>';
        expect(actual).toBe(expected);

        actual = fountain.parse(alphaHeading).html.script;
        expected = '<h3 id="A">I/E HOUSE - DAY</h3>';
        expect(actual).toBe(expected);

        actual = fountain.parse(dashHeading).html.script;
        expected = '<h3 id="I-1-A">INT. HOUSE - DAY</h3>';
        expect(actual).toBe(expected);

        actual = fountain.parse(periodHeading).html.script;
        expected = '<h3 id="1.">I./E HOUSE - DAY</h3>';
        expect(actual).toBe(expected);

        actual = fountain.parse(alphaNumHeading).html.script;
        expected = '<h3 id="110.A">INT/EXT. HOUSE - DAY - FLASHBACK (1944)</h3>';
        expect(actual).toBe(expected);
    });

    it('should parse forced, single-aplhanumeric scene headings', () => {
        const heading = '.1';

        let actual = fountain.parse(heading, true).tokens;
        let expected = [ new SceneHeadingToken('.1') ];

        expect(actual).toEqual(expected);
    });

    it('should treat a period only at start of a line as action', () => {
        const notHeading = '.  ';

        let actual= fountain.parse(notHeading, true).tokens;
        let expected = [ new ActionToken('.  ') ];

        expect(actual).toEqual(expected);
    });

    it('should parse some transitions, forced headings and centered text', () => {
        const text = `\t.OPENING TITLES

            \t\t> BRICK & STEEL <
            \t\t> FULL RETIRED <

                    SMASH CUT TO:`;

        let actual = fountain.parse(text).html.script;
        let expected = '<h3>OPENING TITLES</h3><p class="centered">BRICK &amp; STEEL<br />FULL RETIRED</p><h2>SMASH CUT TO:</h2>';

        expect(actual).toBe(expected);
    });

    it('should parse forced transitions', () => {
        const transition = '> Burn to Pink.';
        const leadingSpacesTrans = '           > Burn to Pink.';
        const leadingTabsTrans = '\t\t> Burn to Pink.';

        let actual = fountain.parse(transition).html.script;
        let expected = '<h2>Burn to Pink.</h2>';

        expect(actual).toBe(expected);

        actual = fountain.parse(leadingSpacesTrans).html.script;
        expect(actual).toBe(expected);

        actual = fountain.parse(leadingTabsTrans).html.script;
        expect(actual).toBe(expected);
    });

    it('should strip  leading/trailing spaces from centered text', () => {
        const text = `>\tcenter line 1\t<
                      >     center line 2     <`;

        let actual = fountain.parse(text).html.script;
        let expected = '<p class="centered">center line 1<br />center line 2</p>';

        expect(actual).toBe(expected);
    });

    it('should parse dialog', () => {
        const dialog = `STEEL (O.S.)
                    Beer's ready!

                    BRICK
                    (skeptical)
                    Are they cold?`;

        let actual = fountain.parse(dialog).html.script;
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

        let actual = fountain.parse(dialog).html.script;
        let expected = `<div class="dialogue"><h4>DEALER</h4><p>Ten.<br />Four.<br />Dealer gets a seven.<br /><br />Hit or stand sir?</p></div><div class="dialogue"><h4>MONKEY</h4><p>Dude, I'm a monkey.</p></div>`;

        expect(actual).toBe(expected);
    });

    it('should parse forced dialog', () => {
        const dialog = `    @McCLANE
                    Yippie ki-yay! I got my lower-case C back!`;

        let actual = fountain.parse(dialog).html.script;
        let expected = '<div class="dialogue"><h4>McCLANE</h4><p>Yippie ki-yay! I got my lower-case C back!</p></div>'

        expect(actual).toBe(expected);
    });

    it('should parse dual dialog', () => {
        const dualDialog = `STEEL
                        Screw retirement.

                        BRICK ^
                        Screw retirement.`;

        let actual = fountain.parse(dualDialog).html.script;
        let expected = '<div class="dual-dialogue"><div class="dialogue left"><h4>STEEL</h4><p>Screw retirement.</p></div><div class="dialogue right"><h4>BRICK</h4><p>Screw retirement.</p></div></div>';

        expect(actual).toBe(expected);
    });

    it('should parse character extensions regardless of case', () => {
        const dialog = `MOM (O. S.)
                    Luke! Come down for supper!

                        HANS (on the radio)
                    What was it you said?`;

        let actual = fountain.parse(dialog).html.script;
        let expected = '<div class="dialogue"><h4>MOM (O. S.)</h4><p>Luke! Come down for supper!</p></div><div class="dialogue"><h4>HANS (on the radio)</h4><p>What was it you said?</p></div>';

        expect(actual).toBe(expected);
    });

    it('should parse single-letter character names', () => {
        const dialog = `A
                    Pieces were stolen from me.`

        let actual = fountain.parse(dialog).html.script;
        let expected = '<div class="dialogue"><h4>A</h4><p>Pieces were stolen from me.</p></div>';

        expect(actual).toBe(expected);
    });

    it('should parse forced, single-letter character names', () => {
        const dialog = `    @B
                    They never gave mine back.`

        let actual = fountain.parse(dialog).html.script;
        let expected = '<div class="dialogue"><h4>B</h4><p>They never gave mine back.</p></div>';

        expect(actual).toBe(expected);
    });

    it('should allow special characters and numbers in the character names', () => {
        const dialog = `DISGRUNTLED CITIZEN #1
                    (standing)
                    Excuse me. How much did it cost?`

        let actual = fountain.parse(dialog).html.script;
        let expected = '<div class="dialogue"><h4>DISGRUNTLED CITIZEN #1</h4><p class="parenthetical">(standing)</p><p>Excuse me. How much did it cost?</p></div>';

        expect(actual).toBe(expected);
    });

    it('should not allow character names that are all numbers per spec', () => {
        const notDialog = "11 (O.S.)\nI'm the monster.";

        let actual = fountain.parse(notDialog).html.script;
        let expected = "<p>11 (O.S.)<br />I'm the monster.</p>";

        expect(actual).toBe(expected);
    });

    it('should allow character names that are all numbers if forced', () => {
        const dialog = `@11
                    I'm the monster.`

        let actual = fountain.parse(dialog).html.script;
        let expected = '<div class="dialogue"><h4>11</h4><p>I\'m the monster.</p></div>';

        expect(actual).toBe(expected);
    });

    it('should accept emphasis inside parentheticals', () => {
        const emphasisInside = `STEEL
                    (**starting the engine**)
                    So much for retirement!`;

        let actual = fountain.parse(emphasisInside).html.script;
        let expected = '<div class="dialogue"><h4>STEEL</h4><p class="parenthetical">(<span class="bold">starting the engine</span>)</p><p>So much for retirement!</p></div>';

        expect(actual).toBe(expected);
    });

    it('should accept emphasis around parentheticals', () => {
        const emphasisOutside = `WALT
                    *(ah, wonderful)*
                    Oh, you've been "crunching numbers."`;

        let actual = fountain.parse(emphasisOutside).html.script;
        let expected = `<div class="dialogue"><h4>WALT</h4><p class="parenthetical"><span class="italic">(ah, wonderful)</span></p><p>Oh, you've been &quot;crunching numbers.&quot;</p></div>`;

        expect(actual).toBe(expected);
    });

    it('should reject parentheticals with incomplete emphasis', () => {
        const wrongEmphasis = `TREVA
                        _**(sing-song)*_
                        Oh my --
                        La~de~da!`;

        let actual = fountain.parse(wrongEmphasis).html.script;
        let expected = '<div class="dialogue"><h4>TREVA</h4><p><span class="italic underline">*(sing-song)</span><br />Oh my --<br />La~de~da!</p></div>';

        expect(actual).toBe(expected);
    });

    it('should be resiliant against parenthetical oddities', () => {
        const hangingParenthetical = `BRICK
                                (confused)`;

        const tooManySpaces = `DAN
                        Then let's retire them.
                        (grinning maniacally)                 
                        _Permanently_.`;
        
        let hangingActual = fountain.parse(hangingParenthetical).html.script;
        let tooManySpacesActual = fountain.parse(tooManySpaces).html.script;

        let hangingExpected = '<div class="dialogue"><h4>BRICK</h4><p class="parenthetical">(confused)</p></div>';
        let tooManyExpected = `<div class="dialogue"><h4>DAN</h4><p>Then let's retire them.</p><p class="parenthetical">(grinning maniacally)</p><p><span class="underline">Permanently</span>.</p></div>`;

        expect(hangingActual).toBe(hangingExpected);
        expect(tooManySpacesActual).toBe(tooManyExpected);
    });

    it('it should respect all empahsis in parentheticals', () => {
        const extremeEmphasis = `TOPHER
                            *(griping)*
                            **(complaining)**
                            _(grousing)_
                            ***(howling)***
                            _*(screaming)*_
                            **_(clangorously)_**
                            ***_(ear-splitting noises)_***
                            I'm upset.`;

        let actual = fountain.parse(extremeEmphasis).html.script;
        let expected = `<div class="dialogue"><h4>TOPHER</h4><p class="parenthetical"><span class="italic">(griping)</span></p><p class="parenthetical"><span class="bold">(complaining)</span></p><p class="parenthetical"><span class="underline">(grousing)</span></p><p class="parenthetical"><span class="bold italic">(howling)</span></p><p class="parenthetical"><span class="italic underline">(screaming)</span></p><p class="parenthetical"><span class="bold underline">(clangorously)</span></p><p class="parenthetical"><span class="bold italic underline">(ear-splitting noises)</span></p><p>I'm upset.</p></div>`;

        expect(actual).toBe(expected);
    });

    it('should parse lyrics in dialogue', () => {
        const singing = `TREVA
                        (sing-song)
                        ~Oh my --
                        ~La~de~da!`;

        let actual = fountain.parse(singing).html.script;
        let expected = '<div class="dialogue"><h4>TREVA</h4><p class="parenthetical">(sing-song)</p><p class="lyrics">Oh my --<br />La~de~da!</p></div>';

        expect(actual).toBe(expected);
    });

    it('should parse notes', () => {
        const notes = 'INT. TRAILER HOME - DAY\n\n'
                    + 'This is the home of THE BOY BAND, AKA DAN and JACK[[Or did we think of actual names for these guys?]].'
                    + ' They too are drinking beer, and counting the take from their last smash-and-grab.'
                    + ' Money, drugs, and ridiculous props are strewn about the table.\n\n'
                    + '[[It was supposed to be Vietnamese, right?]]\n\n'
                    + 'JACK\n'
                    + '(in Vietnamese, subtitled)\n'
                    + '*Did you know Brick and Steel are retired?*';

        let actual = fountain.parse(notes).html.script;
        let expected = '<h3>INT. TRAILER HOME - DAY</h3>'
                    + '<p>This is the home of THE BOY BAND, AKA DAN and JACK<!-- Or did we think of actual names for these guys? -->.'
                    + ' They too are drinking beer, and counting the take from their last smash-and-grab.'
                    + ' Money, drugs, and ridiculous props are strewn about the table.</p>'
                    + '<!-- It was supposed to be Vietnamese, right? -->'
                    + '<div class="dialogue"><h4>JACK</h4>'
                    + '<p class="parenthetical">(in Vietnamese, subtitled)</p>'
                    + '<p><span class="italic">Did you know Brick and Steel are retired?</span></p></div>';

        expect(actual).toBe(expected);
    });

    it('should parse multiline notes', () => {
        const notes = `His hand is an inch from the receiver when the phone RINGS. Scott pauses for a moment, suspicious for some reason.[[This section needs work.
Either that, or I need coffee.
  
Definitely coffee.]] He looks around. Phone ringing.`

        let actual = fountain.parse(notes).html.script;
        let expected = '<p>His hand is an inch from the receiver when the phone RINGS. Scott pauses for a moment, suspicious for some reason.'
                    + '<!-- This section needs work.<br />'
                    + 'Either that, or I need coffee.<br />'
                    + '&nbsp;&nbsp;<br />'
                    + 'Definitely coffee. --> He looks around. Phone ringing.</p>';

        expect(actual).toBe(expected);
    });

    it('should strip the boneyard from the input before parsing', () => {
        const boneyard = `      COGNITO
    Everyone's coming after you mate! Scorpio, The Boy Band, Sparrow, Point Blank Sniper...

As he rattles off the long list, Brick and Steel share a look. This is going to be BAD.

        CUT TO:
/*
INT. GARAGE - DAY

BRICK and STEEL get into Mom's PORSCHE, Steel at the wheel. They speed off. To destiny!

CUT TO:
*/
EXT. PALATIAL MANSION - DAY

An EXTREMELY HANDSOME MAN drinks a beer. Shirtless, unfortunately.`;

        let actual = fountain.parse(boneyard).html.script;
        let expected = '<div class="dialogue"><h4>COGNITO</h4>'
                    + "<p>Everyone's coming after you mate! Scorpio, The Boy Band, Sparrow, Point Blank Sniper...</p></div>"
                    + '<p>As he rattles off the long list, Brick and Steel share a look. This is going to be BAD.</p>'
                    + '<h2>CUT TO:</h2>'
                    + '<h3>EXT. PALATIAL MANSION - DAY</h3>'
                    + '<p>An EXTREMELY HANDSOME MAN drinks a beer. Shirtless, unfortunately.</p>';

        expect(actual).toBe(expected);
    });

    it('should preserve continuity of tokens if boneyard crosses mutliple lines', () => {
        const boneyardAcrossParag = 'An explosion of sound.../*\n'
                        + 'As it rises like an avenging angel...\n'
                        + 'Hovers, shattering the air with turbo-throb, sandblasting the hillside with a roto-wash of loose dirt,'
                        + " tables, chairs, everything that's not nailed down...\n\n"
                        + 'Screaming, chaos, frenzy.*/\n'
                        + 'Three words that apply to this scene.';
        const boneyardAcrossTokens = `      COGNITO
    Everyone's coming after you mate! Scorpio, The Boy Band, Sparrow, Point Blank Sniper...

As he rattles off the long list, Brick and Steel share a look. This is going to be BAD.

        CUT TO:\t/*
INT. GARAGE - DAY

BRICK and STEEL get into Mom's PORSCHE, Steel at the wheel. They speed off. To destiny!

CUT TO:
*/      EXT. PALATIAL MANSION - DAY

An EXTREMELY HANDSOME MAN drinks a beer. Shirtless, unfortunately.`

        let actual = fountain.parse(boneyardAcrossParag).html.script;
        let expected = '<p>An explosion of sound...<br />'
                    + 'Three words that apply to this scene.</p>';
        expect(actual).toBe(expected);

        actual = fountain.parse(boneyardAcrossTokens).html.script;
        expected = '<div class="dialogue"><h4>COGNITO</h4>'
                    + "<p>Everyone's coming after you mate! Scorpio, The Boy Band, Sparrow, Point Blank Sniper...</p></div>"
                    + '<p>As he rattles off the long list, Brick and Steel share a look. This is going to be BAD.</p>'
                    + '<h2>CUT TO:</h2>'
                    + '<h3>EXT. PALATIAL MANSION - DAY</h3>'
                    + '<p>An EXTREMELY HANDSOME MAN drinks a beer. Shirtless, unfortunately.</p>';
        expect(actual).toBe(expected);
    });

    it('should parse lyrics', () => {
        const lyrics = `~Willy Wonka! Willy Wonka! The amazing chocolatier!
                        ~Willy Wonka! Willy Wonka! Everybody give a cheer!`;

        let actual = fountain.parse(lyrics).html.script;
        let expected = '<p class="lyrics">Willy Wonka! Willy Wonka! The amazing chocolatier!<br />Willy Wonka! Willy Wonka! Everybody give a cheer!</p>';

        expect(actual).toBe(expected);
    });

    it('should parse sections by removing them from the output', () => {
        const section = `CUT TO:

        # This is a Section

        INT. PALACE HALLWAY - NIGHT`;

        const manySections = `# Act

        ## Sequence

        ### Scene

        ## Another Sequence

        # Another Act`;

        let actual = fountain.parse(section).html.script;
        let expected = '<h2>CUT TO:</h2><h3>INT. PALACE HALLWAY - NIGHT</h3>';
        expect(actual).toBe(expected);

        actual = fountain.parse(manySections).html.script;
        expected = '';
        expect(actual).toBe(expected);
    });

    it('should parse synopses by removing them from the output', () => {
        const synopses = `.BROADCAST STUDIO - AFTERNOON

                    =The Inciting Incident -- Jacorey and Arthur must save the studio during a power outage.`;

        const sectionAndSynopses = `    # ACT I

    = Set up the characters and the story.

EXT. BRICK'S PATIO - DAY

    = This scene sets up Brick & Steel's new life as retirees. Warm sun, cold beer, and absolutely nothing to do.

A gorgeous day. The sun is shining. But BRICK BRADDOCK, retired police detective, is sitting quietly, contemplating -- something.`;

        let actual = fountain.parse(synopses).html.script;
        let expected = '<h3>BROADCAST STUDIO - AFTERNOON</h3>';
        expect(actual).toBe(expected);

        actual = fountain.parse(sectionAndSynopses).html.script;
        expected = "<h3>EXT. BRICK'S PATIO - DAY</h3><p>A gorgeous day. The sun is shining. But BRICK BRADDOCK, retired police detective, is sitting quietly, contemplating -- something.</p>";
        expect(actual).toBe(expected);
    });
});

describe('Inline markdown lexer', () => {
    let fountain: Fountain;

    beforeEach(() => {
        fountain = new Fountain();
    });

    it('should parse bold italic underline and variations', () => {
        const inlineText = '_***bold italic underline***_';

        let actual = fountain.parse(inlineText).html.script;
        let expected = '<p><span class="bold italic underline">bold italic underline</span></p>';
        expect(actual).toBe(expected);

        const variations = '&________***bold italic underline___***________\n'
                            + '_***_***_ _*******_\n'
                            + '_***hello_world***_ e___***bold italic underline***_';

        actual = fountain.parse(variations).html.script;
        expected = '<p>&amp;_______<span class="bold italic underline">bold italic underline___</span>_______<br />'
                    + '<span class="bold italic underline">_</span> <span class="underline">*******</span><br />'
                    + '<span class="bold italic underline">hello_world</span> e___<span class="bold italic">bold italic underline</span>_</p>';
        expect(actual).toBe(expected);
    });

    it('should parse alternative bold italic underline and variations', () => {
        const inlineText = '***_bold italic underline_***';

        let actual = fountain.parse(inlineText).html.script;
        let expected = '<p><span class="bold italic underline">bold italic underline</span></p>';
        expect(actual).toBe(expected);

        const variations = 'e********_bold italic underline?_***\n'
                            + '***_*_***\n'
                            + '***_hello * world_***!';

        actual = fountain.parse(variations).html.script;
        expected = '<p>e*****<span class="bold italic underline">bold italic underline?</span><br />'
                    + '<span class="bold italic underline">*</span><br />'
                    + '<span class="bold italic underline">hello * world</span>!</p>';

        expect(actual).toBe(expected);
    });

    it('should parse bold underline and variations', () => {
        const inlineText = '_**bold underline**_';

        let actual = fountain.parse(inlineText).html.script;
        let expected = '<p><span class="bold underline">bold underline</span></p>';
        expect(actual).toBe(expected);

        const variations = '&________**bold underline___**________\n'
                            + '_**_**_ _*****_\n'
                            + '_**hello_world**_ e___**bold underline**_';

        actual = fountain.parse(variations).html.script;
        expected = '<p>&amp;_______<span class="bold underline">bold underline___</span>_______<br />'
                    + '<span class="bold underline">_</span> <span class="underline">*****</span><br />'
                    + '<span class="bold underline">hello_world</span> e___<span class="bold">bold underline</span>_</p>';
        expect(actual).toBe(expected);
    });

    it('should parse alternative bold underline and variations', () => {
        const inlineText = '**_bold underline_**';

        let actual = fountain.parse(inlineText).html.script;
        let expected = '<p><span class="bold underline">bold underline</span></p>';
        expect(actual).toBe(expected);

        const variations = 'e*******_bold underline?_**\n'
                            + '**_*_**\n'
                            + '**_hello * world_**!';

        actual = fountain.parse(variations).html.script;
        expected = '<p>e*****<span class="bold underline">bold underline?</span><br />'
                    + '<span class="bold underline">*</span><br />'
                    + '<span class="bold underline">hello * world</span>!</p>';

        expect(actual).toBe(expected);
    });

    it('should parse italic underline and variations', () => {
        const inlineText = '_*italic underline*_';

        let actual = fountain.parse(inlineText).html.script;
        let expected = '<p><span class="italic underline">italic underline</span></p>';
        expect(actual).toBe(expected);

        const variations = '&________*italic underline___*________\n'
                            + '_*_*_ _***_\n'
                            + '_*hello_world*_ e___*italic underline*_';

        actual = fountain.parse(variations).html.script;
        expected = '<p>&amp;_______<span class="italic underline">italic underline___</span>_______<br />'
                    + '<span class="italic underline">_</span> <span class="underline">***</span><br />'
                    + '<span class="italic underline">hello_world</span> e___<span class="italic">italic underline</span>_</p>';
        expect(actual).toBe(expected);
    });

    it('should parse alternative italic underline and variations', () => {
        const inlineText = '*_italic underline_*';

        let actual = fountain.parse(inlineText).html.script;
        let expected = '<p><span class="italic underline">italic underline</span></p>';
        expect(actual).toBe(expected);

        const variations = 'e******_italic underline?_*\n'
                            + '*_*_*\n'
                            + '*_hello * world_*!';

        actual = fountain.parse(variations).html.script;
        expected = '<p>e*****<span class="italic underline">italic underline?</span><br />'
                    + '<span class="italic underline">*</span><br />'
                    + '<span class="italic underline">hello * world</span>!</p>';

        expect(actual).toBe(expected);
    });

    it('should parse bold italic and variations', () => {
        const inlineText = '***bold italic***';

        let actual = fountain.parse(inlineText).html.script;
        let expected = '<p><span class="bold italic">bold italic</span></p>';
        expect(actual).toBe(expected);

        const variations = 'e*********bold italic?***\n'
                            + '***_*** ******\n'
                            + '***hello * world*** ***bold_italic***';

        actual = fountain.parse(variations).html.script;
        expected = '<p>e******<span class="bold italic">bold italic?</span><br />'
                    + '<span class="bold italic">_</span> ******<br />'
                    + '<span class="bold italic">hello * world</span> <span class="bold italic">bold_italic</span></p>';
        expect(actual).toBe(expected);
    });

    it('should parse bold and variations', () => {
        const inlineText = '**bold**';

        let actual = fountain.parse(inlineText).html.script;
        let expected = '<p><span class="bold">bold</span></p>';
        expect(actual).toBe(expected);

        const variations = 'e********bold**.\n'
                            + '**_** *****\n'
                            + '**hello * world** **$bold_***';

        actual = fountain.parse(variations).html.script;
        expected = '<p>e******<span class="bold">bold</span>.<br />'
                    + '<span class="bold">_</span> *****<br />'
                    + '<span class="bold">hello * world</span> <span class="bold">$bold_</span>*</p>';
        expect(actual).toBe(expected);
    });

    it('should parse italic and variations', () => {
        const inlineText = '*italics*';

        let actual = fountain.parse(inlineText).html.script;
        let expected = '<p><span class="italic">italics</span></p>';
        expect(actual).toBe(expected);

        const variations = 'e******italic*?\n'
                            + '*_* ***\n'
                            + '*hello * world* %*_italic*';

        actual = fountain.parse(variations).html.script;
        expected = '<p>e*****<span class="italic">italic</span>?<br />'
                    + '<span class="italic">_</span> ***<br />'
                    + '<span class="italic">hello * world</span> %<span class="italic">_italic</span></p>';
        expect(actual).toBe(expected);
    });

    it('should parse underline and variations', () => {
        const inlineText = '_underline_';

        let actual = fountain.parse(inlineText).html.script;
        let expected = '<p><span class="underline">underline</span></p>';
        expect(actual).toBe(expected);

        const variations = '&____underline______ _hello_world_! e_nothing_\n'
                            + '_*_ ___\n'
                            + '_underline *_ _* underline_';

        actual = fountain.parse(variations).html.script;
        expected = '<p>&amp;___<span class="underline">underline</span>_____ <span class="underline">hello_world</span>!'
                    + ' e_nothing_<br />'
                    + '<span class="underline">*</span> ___<br />'
                    + '<span class="underline">underline <span class="italic">_ _</span> underline</span></p>';
        expect(actual).toBe(expected);
    });

    it('should parse inline markdown', () => {
        const inlineText = '_***bold italics underline***_ _**bold underline**_ _*italic underline*_ ***bold italics*** **bold** *italics* _underline_';

        let actual = fountain.parse(inlineText).html.script;
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

    it('should preserve inline HTML', () => {
        const underlineItalic = '_underline *italic* underline_';
        const boldItalic = '*italic **bold** italic*';
        const underlineBoldItalic = '_underline *italic **bold** italic* underline_';
        const italicBoldItalic = '****bold italic and italic****';
        const boldBoldItalic = '*****bold italic and bold*****';
        const boldItalicBoldItalic = '******bold italic, italic and bold******';

        let actual = fountain.parse(underlineItalic).html.script;
        let expected = '<p><span class="underline">underline <span class="italic">italic</span> underline</span></p>';
        expect(actual).toBe(expected);

        actual = fountain.parse(boldItalic).html.script;
        expected = '<p><span class="italic">italic <span class="bold">bold</span> italic</span></p>';
        expect(actual).toBe(expected);

        actual = fountain.parse(underlineBoldItalic).html.script;
        expected = '<p><span class="underline">underline <span class="italic">italic <span class="bold">bold</span> italic</span> underline</span></p>';
        expect(actual).toBe(expected);

        actual = fountain.parse(italicBoldItalic).html.script;
        expected = '<p><span class="italic"><span class="bold italic">bold italic and italic</span></span></p>';
        expect(actual).toBe(expected);

        actual = fountain.parse(boldBoldItalic).html.script;
        expected = '<p><span class="bold"><span class="bold italic">bold italic and bold</span></span></p>';
        expect(actual).toBe(expected);

        actual = fountain.parse(boldItalicBoldItalic).html.script;
        expected = '<p><span class="italic"><span class="bold"><span class="bold italic">bold italic, italic and bold</span></span></span></p>';
        expect(actual).toBe(expected);
    });

    it('should ignore non-flanking inline markdown', () => {
        const inlineText = '_ underline_ _underline _ * italic* *italic *\n'
                            + '** bold** **bold **\n'
                            + '*** bold italics*** ***bold italics ***\n'
                            + '_*** bold italics underline***_ _***bold italics underline ***_\n'
                            + '_** bold underline**_ _**bold underline **_\n'
                            + '_* italic underline*_ _*italic underline *_';

        let actual = fountain.parse(inlineText).html.script;
        let expected = '<p>_ underline_ _underline _ * italic* *italic *<br />'
                       + '** bold** **bold **<br />'
                       + '*** bold italics*** ***bold italics ***<br />'
                       + '<span class="underline">*** bold italics underline<span class="bold italic">_ _</span>bold italics underline ***</span><br />'
                       + '<span class="underline">** bold underline<span class="bold">_ _</span>bold underline **</span><br />'
                       + '<span class="underline">* italic underline<span class="italic">_ _</span>italic underline *</span></p>';

        expect(actual).toBe(expected);
    });

    it('should escape asterisks', () => {
        const escapedBold = 'Steel enters the code on the keypad: **\\*9765\\***';
        const escaped = 'He dialed \\*69 and then *23, and then hung up.';

        let actual = fountain.parse(escapedBold).html.script;
        let expected = '<p>Steel enters the code on the keypad: <span class="bold">*9765*</span></p>';
        expect(actual).toBe(expected);

        actual = fountain.parse(escaped).html.script;
        expected = '<p>He dialed *69 and then *23, and then hung up.</p>';
        expect(actual).toBe(expected);
    });

    it('should escape underscores', () => {
        const escapedItalic = 'Steel hit complile, the screen said: "*\\_hello_world_*"';
        const escaped = 'He typed \\_A and then B_, and closed the terminal.';

        let actual = fountain.parse(escapedItalic).html.script;
        let expected = '<p>Steel hit complile, the screen said: &quot;<span class="italic">_hello_world_</span>&quot;</p>';
        expect(actual).toBe(expected);

        actual = fountain.parse(escaped).html.script;
        expected = '<p>He typed _A and then B_, and closed the terminal.</p>';
        expect(actual).toBe(expected);
    });

    it('should escape all other Fountain tokens', () => {
        const escapes = '\\@ \\# \\! \\* \\_ \\$ \\\\ \\/ \\~ \\` \\+ \\= \\. \\> \\<';

        let actual = fountain.parse(escapes).html.script;
        let expected = '<p>@ # ! * _ $ \\ / ~ ` + = . &gt; &lt;</p>'
        expect(actual).toBe(expected);

        // Some select escapes of blocks to ensure the regexes are working

        const escapedDialog = '\t\\@McCLANE\nYippie ki-yay! Action!';
        actual = fountain.parse(escapedDialog).html.script;
        expected = '<p>&nbsp;&nbsp;&nbsp;&nbsp;@McCLANE<br />Yippie ki-yay! Action!</p>';
        expect(actual).toBe(expected);

        const escapedHeading = '\\.OPENING TITLES';
        actual = fountain.parse(escapedHeading).html.script;
        expected = '<p>.OPENING TITLES</p>';
        expect(actual).toBe(expected);

        const escapedLyrics = '\\~Willy Wonka! Willy Wonka! The amazing chocolatier!';
        actual = fountain.parse(escapedLyrics).html.script;
        expected = '<p>~Willy Wonka! Willy Wonka! The amazing chocolatier!</p>';
        expect(actual).toBe(expected);

        const escapedAction = `\\!TIRES SCREECHING...
                            Joe is looking at his phone for the direction.`;
        actual = fountain.parse(escapedAction).html.script;
        expected = '<div class="dialogue"><h4>!TIRES SCREECHING...</h4><p>Joe is looking at his phone for the direction.</p></div>';
        expect(actual).toBe(expected);

        const escapedTransition = '\\>Burn to Pink.';
        actual = fountain.parse(escapedTransition).html.script;
        expected = '<p>&gt;Burn to Pink.</p>';
        expect(actual).toBe(expected);
    });

    it('should escape unsafe HTML characters', () => {
        const unsafe = '\\> \\< & "';

        let actual = fountain.parse(unsafe).html.script;
        let expected = '<p>&gt; &lt; &amp; &quot;</p>'

        expect(actual).toBe(expected);
    });

    it('should not carry emphasis over line breaks per spec', () => {
        const action = 'Murtaugh, springing hell bent for leather -- and folks,\n'
                        + 'grab your hats... because just then, a _BELL COBRA\n'
                        + 'HELICOPTER_ crests the edge of the bluff.';

        let actual = fountain.parse(action).html.script;
        let expected = '<p>Murtaugh, springing hell bent for leather -- and folks,<br />grab your hats... because just then, a _BELL COBRA<br />HELICOPTER_ crests the edge of the bluff.</p>'

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

    it('should handle empty strings gracefully', () => {
        const empty = '';
        const one_empty_line = '    ';
        const empty_lines = '    \n    ';
        const many_empty_lines = `
    
    
        `;

        let actual = fountain.parse(empty).html.script;
        let expected = '';

        expect(actual).toBe(expected);

        actual = fountain.parse(one_empty_line).html.script;
        expect(actual).toBe(expected);

        actual = fountain.parse(empty_lines).html.script;
        expect(actual).toBe(expected);

        actual = fountain.parse(many_empty_lines).html.script;
        expect(actual).toBe(expected);
    });

    it('should turn hanging non-tokenized lines off of token lines into action', () => {
        const trailingHeading = '.OPENING TITLES\ntrailing action';
        const trailingTransition = 'CUT TO:\ntrailing action';
        const trailingCentered = '> BRICK & STEEL <\n> FULL RETIRED <\ntrailing action';
        const trailingLyrics = '~Willy Wonka!\ntrailing action';
        const trialingSection = '# ACT I\ntrailing action';
        const trailingSynopsis = '= Set up the characters and the story.\ntrailing action';

        let actual = fountain.parse(trailingHeading).html.script;
        let expected = '<p>.OPENING TITLES<br />trailing action</p>';
        expect(actual).toBe(expected);

        actual = fountain.parse(trailingTransition).html.script;
        expected = '<p>CUT TO:<br />trailing action</p>';
        expect(actual).toBe(expected);

        actual = fountain.parse(trailingCentered).html.script;
        expected = '<p>&gt; BRICK &amp; STEEL &lt;<br />&gt; FULL RETIRED &lt;<br />trailing action</p>';
        expect(actual).toBe(expected);

        actual = fountain.parse(trailingLyrics).html.script;
        expected = '<p>~Willy Wonka!<br />trailing action</p>';
        expect(actual).toBe(expected);

        actual = fountain.parse(trialingSection).html.script;
        expected = '<p># ACT I<br />trailing action</p>';
        expect(actual).toBe(expected);

        actual = fountain.parse(trailingSynopsis).html.script;
        expected = '<p>= Set up the characters and the story.<br />trailing action</p>';
        expect(actual).toBe(expected);
    });

    it('should not mutate token text when converting to HTML', () => {
        const action = 'Murtaugh, *springing*, hell bent for leather -- and folks,\n'
                        + 'grab your hats... because just then, a BELL COBRA\n'
                        + 'HELICOPTER crests the edge of the bluff.';

        let output = fountain.parse(action, true);
        let expectedTokens = [
            new ActionToken(
                'Murtaugh, *springing*, hell bent for leather -- and folks,\n'
                + 'grab your hats... because just then, a BELL COBRA\n'
                + 'HELICOPTER crests the edge of the bluff.'
            )
        ] as Token[];

        let expectedHTML = '<p>Murtaugh, <span class="italic">springing</span>, hell bent for leather -- and folks,<br />grab your hats... because just then, a BELL COBRA<br />HELICOPTER crests the edge of the bluff.</p>'

        expect(output.tokens).toEqual(expectedTokens);
        expect(output.html.script).toBe(expectedHTML);
    });

    it('should return tokens via `getTokens` and its property', () => {
        let output = fountain.parse(
            'They drink long and well from the beers.',
            true
        );
        expect(output.tokens).toEqual(fountain.tokens);

        let scene = `EXT. OLYMPIA CIRCUS - NIGHT

        ...where the second-rate carnival is parked for the moment in an Alabama field.`;

        output = fountain.parse(scene, true);
        expect(output.tokens).toEqual(fountain.tokens);

        // return tokens even if `getTokens` is false
        output = fountain.parse('They drink long and well from the beers.');
        expect(fountain.tokens).toBeDefined();
    });
});
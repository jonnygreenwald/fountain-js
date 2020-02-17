import { Fountain, Script } from '../src/fountain';
import { Scanner } from '../src/scanner';
import { InlineLexer } from '../src/lexer';

let text = `Title:
            _**BRICK & STEEL**_
            _**FULL RETIRED**_
            Credit: Written by
            Author: Stu Maschwitz
            Source: Story by KTM
            Draft date: 1/27/2012
            Contact:
            Next Level Productions
            1588 Mission Dr.
            Solvang, CA 93463

            EXT. BRICK'S PATIO - DAY

            A gorgeous day.  The sun is shining.

            STEEL (O.S.)
            Beer's ready!

            BRICK
            (skeptical)
            Are they cold?`;

let line = "_**BRICK & STEEL**_\n_*FULL RETIRED*_\n\\*123\\_\n[[a note]]"
//let tokens = new Scanner().tokenize(text);
let output = new Fountain().parse(text);
//let output = new InlineLexer().reconstruct(line);

console.log(output);


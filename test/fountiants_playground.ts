import { Fountain, Script } from '../src/fountain';
import { Scanner } from '../src/scanner';

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

//let tokens = new Scanner().tokenize(dialog);
let output = new Fountain().parse(text);

console.log(output);


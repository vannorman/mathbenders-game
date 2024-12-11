        /*
            // First, gen a perlin array P like this, using 
            let dim = 16
            let sampleResolution=0.025
            let seed = 0.5
            perlin.get2dPerlinArr({dim:dim,sampleResolution:sampleResolution,deterministicFloatSeed:seed}); 

            0 1 0 0 0 0 1 1 1 1 1 1 0 0 0 0
            1 1 1 1 0 0 1 1 1 1 1 1 1 0 0 0 
            1 1 0 0 0 0 0 1 1 1 0 0 1 1 0 0 
            1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 0 
            1 0 0 0 0 0 0 0 0 0 0 0 1 1 1 0 
            0 0 0 0 0 0 0 1 0 0 0 0 1 1 1 0 
            0 0 0 1 0 0 0 1 1 0 0 1 1 1 0 0 
            0 0 0 1 0 0 0 0 0 0 1 1 1 1 0 0 
            0 0 0 0 0 0 0 0 0 0 1 1 1 1 0 0 
            0 0 0 0 0 0 0 0 0 0 1 1 1 1 0 0 
            0 0 0 1 1 1 0 0 0 0 0 1 1 1 0 0 
            0 1 1 1 1 1 1 0 0 0 0 1 1 1 1 0 
            0 0 0 1 1 1 1 1 0 0 0 0 0 1 1 0 
            0 0 0 1 1 1 1 1 0 0 0 0 0 0 1 1 
            0 0 0 1 1 1 0 0 1 1 0 0 0 0 0 1 
            0 0 1 1 1 0 0 0 0 1 1 0 0 0 0 1 
            0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0

            Next, define a sine wave array S in terms of an array where the wave "starts" at row 1/2(len), col 0, and "propagates" thru each column
            For example, (replaced 0 with . for visiblity)
            // Note: X is some float representing lowest canyon point

            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . X . . . . . . . X . . . . . 
            . X . X . . . . . X . X . . . . 
            X . . . X . . . X . . . X . . . 
            . . . . . X . X . . . . . X . X 
            . . . . . . X . . . . . . . X . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 

            We achieve this by taking sin(x) and evaluate it starting from first col and row/height to get middle row, 
            then moving to next row, where we evaluate sine(colIndex * factor)
            Note Sine(π/2) = max point
            So if we wanted the above graph to hit max point at x = 2, then we could do sin(π/colIndex)*height where height=2

            // example:
            let h = 2;
            let dim = 16
            let sineArray = new Array(dim)
            let wavelength = dim/2
            for (let i=0;i<dim;i++){
                sineArray[i] = Math.round(Math.sin(((Math.PI*0.5)*i*0.5)*8/wavelength) * h)  + Math.round(dim/2)
            };

            // result: [8, 9, 10, 9, 8, 7, 6, 7, 8, 9, 10, 9, 8, 7, 6, 7]
            // projected result using the result as indices to place sine wave:

            // pre-fill 'p' with '.' // you won't need to do this if you already have a dim x dim array of floats via perlin
            let p = Array.from({ length: dim }, () => Array(dim).fill('.'));
            for(i=0;i<dim;i++){
                p[i][sineArray[i]] = 'X';
            }
            let output = ""
            p.forEach(row => output += row.join(' ')+"\n")
            console.log(output)
            // RESULT:
            . . . . . . . . X . . . . . . .
            . . . . . . . . . X . . . . . .
            . . . . . . . . . . X . . . . .
            . . . . . . . . . X . . . . . .
            . . . . . . . . X . . . . . . .
            . . . . . . . X . . . . . . . .
            . . . . . . X . . . . . . . . .
            . . . . . . . X . . . . . . . .
            . . . . . . . . X . . . . . . .
            . . . . . . . . . X . . . . . .
            . . . . . . . . . . X . . . . .
            . . . . . . . . . X . . . . . .
            . . . . . . . . X . . . . . . .
            . . . . . . . X . . . . . . . .
            . . . . . . X . . . . . . . . .
            . . . . . . . X . . . . . . . .

            // Um it's sideways but you get the idea ^_^
            
            Next, add an interpolation array I to have a smooth descent into the sine canyon.
            here we use a, b, c. When overlayed, a will be a small change and c will be the greatest change, arriving at the sine wave height (here it's "X"). 
            Note we can set c to X to widen the canyon at its lowest point.
            Note that a,b,c example values 0.1, 0.3, 0.6

            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . a . . . . . . . a . . . . . 
            . a b a . . . . . a b a . . . . 
            a b c b a . . . a b c b a . . . 
            b c X c b a . a b c X c b a . a 
            c X c X c b a b c X c X c b a b 
            X c b c X c b c X c b c X c b c 
            c b a b c X c X c b a b c X c X 
            b a . a b c X c b a . a b c X c
            a . . . a b c b a . . . a b c b 
            . . . . . a b a . . . . . a b a 
            . . . . . . a . . . . . . . a . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . .


            to do this we might take the array of X positions and simply add and subtract 1,2,3 to place constants a,b,c in those indexes (assuming they are not out of range.)
            So, let's take our index of "X"s below that looks like [8, 9, 10, 9, 8, 7, 6, 7, 8, 9, 10, 9, 8, 7, 6, 7] and go up by N and get a float value for each 0-N.
            Let's use 3 sliding values of [0.1,0.3,0.6]
            Let's define X as well.
            Note, you'll need float values in your dim x dim array, NOT "." or "X".
            // So let's SWITCH from  ". . . X " to " 0.1 0.2 0.1 0" style array, e.g. the one we'll actually use.

            ########################################################################################################################
            ///START WORKING EXAMPLE
            ########################################################################################################################
            // Step 1: create the perlin array of 16 x 16
            let dim = 16;
            let sampleResolution = 0.025;
            let seed = 0.5;
            let P = perlin.get2dPerlinArr({dim:dim,sampleResolution:sampleResolution,deterministicFloatSeed:seed});

            // Step 2: create the Sine array (index only)
            let h = 2;
            let sineArray = new Array(dim)
            let wavelength = dim/2
            for (let i=0;i<dim;i++){
                sineArray[i] = Math.round(Math.sin(((Math.PI*0.5)*i*0.5)*8/wavelength) * h)  + Math.round(dim/2)
            };

            // Step 3: modify P using slide 
            let X = 0;
            let slide = [0.99,0.6,0.3,0.1]
            for(let i=0;i<dim;i++){
                for(let j=0;j<dim;j++){
                    if (sineArray[i] == j) {
                        P[i][j] = X;
                        // go up and down by slide.length and modify.
                        console.log("ij;"+i+","+j);
                        for(let k = 1; k<slide.length+1;k++){
                            let delta = (X - P[i][j+k]) * slide[k-1];
                            let result = P[i][j+k] + delta;
                            P[i][j+k] = result;
                            console.log("o:"+P[i][j+k]+", result;"+result);
                        }
                        for(let k = -1; k>-slide.length-1;k--){
                            let delta = (X - P[i][j+k]) * slide[Math.abs(k)-1];
                            let result = P[i][j+k] + delta;
                            P[i][j+k] = result;
                            console.log("o:"+P[i][j+k]+", result;"+result);
                        }
                    }
                }                        
            }

            for(let i=0;i<dim;i++){for(let j=0;j<dim;j++){P[i][j]=parseFloat(P[i][j].toFixed(3))}}
            P

            */
 

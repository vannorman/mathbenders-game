const interview = {
    // Sat Oct 12 2024
    // LevelBuilder is coming along nicely. Figured out how I'm going to do the data model, I think. Anyway I'm getting closer
    // to simply being able to build levels.
    // The next piece tho will be terrain. I was considering using 3d posiitoned objects like blocks and sine curves
    // that would each impact the terrain according to their positions (and each vert). For example
    // Making a perlin hills terrain then dropping a sine wave shape into the 3d world to depress the noise only where
    // the snake is, creating a river.

    // Found this hilarious cube terrain optimization video https://www.youtube.com/watch?v=CJ94gOzKqsM and it gave me a great tip at
    // about 6:30 in the video to use math.pow(perlinVal,2) instead of a linear scaling of the perlin, which gives nice hills.
    // Also, "shallow water shows whats below, deeper water shows what's above" in shaders


    // Tues Aug 27 2024
    // deep work! I don't enjoy daily collaboration on things like social. My mind enjoys being deep into the creative iterative process
    // and of course, code architecture and performance.

    // Set Case - 

    // "How do you know you'll lead a world class gaming company? What makes you able, or possible to succeed?"
    // "Because I do. There's nothing else to it. Metrics, money, runway, users, etc is all the way it will be seen.
    // But there is no world in which I do not try, and I don't see my best efforts failing to a degree of never succeeding.
    // Never give up - it's obvious when it's obvious, I guess.

    // Tues Aug 13 2024
    // That annihilate effect shader is tasty
    // What if the world has some type of base power stability .. 
    //like a world might have 1024 stability.. so a -1 and 1 annihilating doesn’t affect it much and it recovers..
    //but the escape velocity is reached if you do 1024 - 1024 = 0 and it rips a hole in the world that you can travel into?


    // We think of space as discrete and time as continuous
    // but consider splash damage vs single target damage in starcraft
    // splash damage is spread out over space, continuously
    // target damage is spread out over time, in discrete steps (faster shooting)

   // "" The first rule of Super Math World is
    // "" You do not explain SuperMathWorld.com first time gameplay with any tutorial

    "blockers thoughts and shaders" : [
        {
            /* 
                Tues Aug 6 2024
                Decided to write a shader that makes the world feel like it's ripping apart in a cube pattern,
                which can reveal a hidden world beneath it. In reverse, this feels like building a new world on top of the world.
                This means you can now travel in an extra dimension in discrete chunks like "Stepping" into or out of a reality. 
                ( outlineToon.frag )

                This morning I had 90 minutes to work. My only goal was getting castle assets into the game, which I only
                half succeeded at. The first one I purchased was a giant fBX without separation of assets, so I obviously couldn't use it.
                the second one didn't have any uv unwrapping, so I could use it but the models were all monocolored (useless).
                Spent some time trying to automatically unwrap the uvs using online programs and blender, but failed. 
                Ultimately I now have a stand-in turret with no texture. 
                Perhaps I should just stick to the old assets which I know work. This small blocker cost me all morning, but it's small
                blockers like these you just have to keep pushing through.

                What's 90 minutes anyway? What's time? I have a finite amount of it to be sure. What can be accomplished in such a time,
                When I have infintely more than my peers of ages past who would have perished at 35.
                I must forage ahead and forge the creation under my hand, create this special and magical world.
                There is nothing else to do. Everything else is a distraction, although a necessary one for eating and sleeping and
                paying random bills.


    
            */
        }
   ],
   "took a break update" : [
        {
            /* 
                Took a break for a few months, got hired at HUE as director of business development.
                Can't get the project off my mind though. It's what I was built to do.
                Today it's Weds July 31 2024, and I started here Mar 1 2024. It's a great UK company and we're growing.
                The code base is half a wreck. The Networking / multiplayer has been unplugged but is still in critical path.
                I really want multiplayer
                But I recognize the complexity may be too much for me to handle AND release a good "first" product.
                So in my shoes I know going single player first will be a more straightforward way to build the company.
                I just don't want to. I want multiplayer.
                So I'm feeling a bit stuck. What do I want? Do I want to have fun and do things that feel fun? Or do I want a success?
                Both?
                Well then.

                Anyway, I decided to just work on stuff I could easily tackle. Fog shader with ground sensitivity, cel shading, outlines arenow all done. I've leveled up my undersatnding of GLSL shader stack including vert and frag, and understand a bit more about matrix math, view vs screen vs world, depth, per pixel effects, performance, etc. This is super useful and I look forward to continuing to make the game look great.
                Next I'd like to have some playable levels that feel fun. Breaking down walls and matching numbers, exploring and finding resources, are alwayas fun. Is this something I can do procedurally? Or will I require a manual level editing hand?

                I recently saw a Quanta Magazine article and accompanying video about Langlands. It really felt like a storyboard for our game! Check this out: https://www.quantamagazine.org/monumental-proof-settles-geometric-langlands-conjecture-20240719/

            */
        }
   ],
   "noteworthy blockers" : [

   {
        /*
            Inventory, a script I always struggled with. It always seems to break and be buggy.     
        */
   },{
        /*
            One thing that matters a lot in games is polish. In our previous title, my friend Brian Broderick wrote an absolutely amazing postFX shader that did outlines and fog, giving the whole game a smooth cartoony look. In PlayCanvas I was having trouble with shaders to achieve the same thing; but I spent considerable time working on it. Additionally, "Portals" were quite hard to get right; I faked it once using a render texture for the main camera's view and overwriting that with any portal camera that saw verts within the bounds of the portal. This had z-depth issues where the player and other objects were covered by the portal. I got lost in camera matrix projections trying to find out how to present the destination portal view to the origin portal using a render texture. Then I had an insight that this could be achieved simply by sampling the screen space of the portal destination camera then matching that pixel for pixel but only where the origin portal object existed; in other words the shader on the origin portal had to display to the main camera what the portal camera saw in that position. Anyway, I finally got it working after literally days of research, trial and error. THE WHOLE TIME I was thinking "Should I really be working on this? Shouldn't I hire someone? Shouldn't I just focus on raising money and building a team? This isn't a good use of my time." Etc. But I got it done and sometimes you have to do things that don't scale as Paul Graham famously said and I was very pleased to move past this important hurdle in the game progress. Here's the shader code I ended up with courtesy of al-ro from ShaderToy discord. https://pastebin.com/ecpFYJSQ
        

        */
   }],
   "data structures" : {
        /*
            Terrains have a ton of data associated with them. Where they position, size, resolution, seed, sine waves, colors, textures, height scale.. Trees, water, sounds, buildings. And Levels are distinctly different than Terrains - a Level is built on top of a Terrain to provide an experience. So I find myself "wrapping" different collections of data that describe a terrain then later I want another very similar terrain but I find that I didn't "wrap" the previous one in such a way to make this small change without needing to propagate data through 3 different functions or to re-initialize the same data in multiple places. Not to mention Portal creation which is tied to the data of at least two separate terrains.
            What solution did I come up with?
            I've also noticed that the PORTAL PAIR created to transfer between terrains actually ends up containing data about the terrain, for example the music that will be played and the skybox. This is wrong; instead, the portal should simply designate which terrain it is targeting, then that terrian should have a terrainInfo object on it containing Music, Fog, Skybox.

            TerrainData - should it live on the terrain itself as a script? This is an easy object oriented way to think about it; it has a "physica" attachment to the entity in the game world. Another way to do it would be to simply save the data at the time of the terrain's definition in Levels.data[x] or in Levels.GenerateTerrain(). 

            Important questions
                - Will we ever need to have levels.data[x] separated from createWorld(x)? For example do we want to create 5 worlds starting with seed data levels.data[x] and we don't want to replicate that data 5 times?
                - should we store terrain data on a terrainInfo object?
                - should we push all level / terrain detail out to terrainInfo object to separate it?
                - Are these questions important given my goal of getting *any* prototype working?
                - Which answers best support my overall path which is to get something released, and reduce complexity / onboarding time for new programmers to explain to them how terrain is generated and configured?
                - IT seems that I should keep all terrain data in ONE place, no matter where that is; terrainInfo seems to be an easy way to separte it from other scripts (the data model / where data is stored in-game) and would make it easier to serialize terrains later.
                - 

        */
    },
    "procedural vs hand built" : {
        /* 
            Procedural is slow progress. You spend hours and hours trying to make something that procedurally and randomly generates bits of a video game that are actually useful, and even more time tweaking the parameters to see if it will work well, and the whole system ends up being rickety because you're building and testing and iterating so quickly. But ultimately it is exponentially more returns on the back end, because it's so far up the tool chain that once the tool is mature and featured enough you can very, very quickly produce new unique content that is custom suited to a task or set of levels.
        */
    },
    "Networking" : {
        /*
            Getting all shared objects in the game to save, load, modify, and interact properly is a pain. Especially when two players with a lag between them (200ms) are interacting with the same set of objects; letting ownership of one object and its changing properties be controlled by one or another player and ensuring syncing between all parties has been a pain. I'm no network engineer. I have tabled this for the time being until I can hire a better engineer than I.

            One large concern is that some numbers are "static / built-in" such as numberWalls which are part of a puzzle, where other numebrs can be created during a session. I initially tried to have each number be created and destroyed via network calls so the basic logic of how numbers are created, destroyed, and interact with each other centers around objectRegistry.js and networkObjectInfo. However this conflicts often because numbers need to be created at startup if they don't exist for single-player experience. Thus I decided to move to single player version of the game for now, but the logic still has networkObjectInfo baked in -- I simply don't create objects from network at startup anymore. It's akin to a car that has an electric motor that has been disconnected and a gas motor has been affixed to a trailer behind the car that still pushes the electric motor's parts to move the car forwards. It's horrible but it does work for now; and my only goal now is to get to a demo that is playable.
        */
    },

    "Inventory" : {
        /* 
            A fun and challenging problem for a software developer; managing inventory objects, open/close, drag/drop, combine, weapon select, backpack vs belt, background of slots, Network syncing, and other features that go along with Inventory. I definitely seem to encounter more bugs here than in other places in my code; Probably it speaks to the complexity of this system or how I should really be thinking about it and designing it differently. Again, my solution here is to table it until I'm able to hire a better developer. I think of it as a stub; as long as it kind of works we can move forward with other aspects of the game, since my job is to paint the overall picture / game rather than making each piece work super well.
        */
    },
    
    "Data again" : {
        /*
            NumberInfo - fraction - when creating and storing these should the data structure be numberInfo : { fraction : { numerator:1,denominator:1}} or should i skip the "numberInfo" since that's implicit in the fact that it is a number? Is there ever a need to differentiate between data that is or is not a "numberInfo" when it has "fraction"? 
        */
    },
    "inspirational moments" : {
        /*
           - player.loadInventory(network.playerInventory, default={1,x});
           - all data models, game built around data fundamentally, where this data is stored and how it's consumed updated..
           - player data
           - levels data
           - state of game data (item.properties=somevalue)
           - state of game operation or scene (hello, load, playing)
           - (new thought) Where did that frisbee come from? Seems I have a lot of frisbees arriving moment to moment, ..
           - draw on map a series of potential states; user joined, user started, user loaded, user change state.
           - for each of those states, point to a module.
           - for each of those modules, point to a data store.

    
        */
    },
 
}

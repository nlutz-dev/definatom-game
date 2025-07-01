Here's a fun little game I've made with Vue, it should be available currently at https://dictionary-game-379f6.web.app/

Running Game Locally: "vue serve"

Game Guide
When you begin you will query a dictionary api for two random words and be shown up to three of their definitions.
You will have two "active words" at any given time, with the goal of connecting them so that both active words are the same.
Each definition is made up of "definatoms," a word I made up. It is the smallest component of a definition: a single word. The atoms of a definition.
When you click on a definatom in one of your active words that active word will be replaced by the definatom that was just clicked and new definitions will be retreived for the new active word.
When both active words are the same, you win! You've successfully linked the two randomly queried words. 

Addtional Rules and Notes
To prevent simple and repetitive gameplay only words that are four characters or longer can be selected. This prevents the player from winning by selecting common articles or prepositions like "the" or "in".
A more specific approach may be to simply blacklist the words I'd rather not have players win with, though the current solution is simple and functional.

Future Plans?
Professionalize the codebase a bit: add code comments and testing.
Improve mobile UI.
Add simple transitions as elements appear/leave.
Add a Congratulations animation when you win.


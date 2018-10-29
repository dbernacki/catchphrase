# catchphrase
Welcome to Catchphrase!
by David Bernacki

Catchphrase is a popular party game that has been brought to the web. This version contains upwards of 20,000 words across 8 categories.

How to play (from Wikipedia):
The game is played in two teams. The goal for each player is to get their team to say the word or word phrase displayed [on the screen].
One member of a team starts the timer and tries to get his or her team to guess the displayed word or phrase.
A clue-giver can NOT make any physical gesture, and can give almost any verbal clue, but may not say a word that rhymes with any of the words, give the first letter of a word, say the number of syllables, or say part of any word in the clue (e.g., "worry" for "worry wart").
When the team guesses correctly, the other team takes its turn.
Play continues until the timer runs out.
The team not holding the [device] when time runs out scores a point.
They also have one chance to guess the word or phrase, with team members allowed to confer; a correct answer earns a bonus point.
The first team to score 7 points wins.

A quick rundown of the interface:
- Click the team buttons to add points
- Click the timer button to start a round (hold the timer for 3 seconds to cancel the timer)
- Click the reset button to reset the scores
- Click the menu button to cycle through categories
- Click the next button at the bottom of the screen to change words
- Hold the title at the top of the screen for 5 seconds to force the game to clear localstorage (and subsequently update the word lists)

A quick rundown of the categories:
- "Are you not entertained?" - entertainment; movies, shows, actors, music, artists, books, etc.
- "How do you do, fellow gamers?" - video games, consoles, characters. This is the smallest category at ~800 words
- "When you wih upon a star" - Disney movies (all of them), characters
- "It's a musical!" - musicals, songs from musicals, famous performers, composers etc. (my friends and I like musicals)
- "Feeling lucky?" - seven letter words
- "You kiss your mother with that mouth?" - Google's list of banned words (very NSFW)
- "Turn of phrase" - common and not so common english phrases (this category is hard)
- "Is this easy mode?" - general category

How it works:
The game is written in HTML, CSS, and Javascript. Words.js contains alphabetized word lists for each category in javascript arrays.
When you open the webpage for the first time, the browser saves a randomized copy of each word array.
As you play the game and iterate through the word arrays, the browser keeps track of the index of each array and saves it in local storage.
If the user reaches the end of any of their personal word arrays, the browser will randomize and save a new copy of that array and reset the index.
The most common complaint about other mobile app versions of this game is the repetition of words which suggests small word lists or ineffective iteration through the word lists.
The highest priority for this version of the game was to mitigate that issue.

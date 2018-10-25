/*
* Catchphrase!
* by David Bernacki
* 2018-09-20
* 
* This game has been around for a while, clearly not my idea. But I thought I'd make a web app for it
* Spent a few hours compiling lists of words across these 7 categories:
* 
* musicals(1086) 	musicals, songs from musicals, composers, broadway stars
* sevens(1369) 		seven letter words
* NSFW(1325)		words from Google's ban list
* phrases(2108)   	english phrases/idioms
* easy(9412) 		general words
* entertain(2404)	movies, tv shows, actors, musicians, songs, books, comic book characters
* gaming(843) 		video games, characters, companies, consoles
*
* How THIS game works:
* words.js contains arrays for each of these categories. These word lists are alphabetized and don't change
* when the user loads this app up for the first time, the original arrays from words.js are shuffled and saved to the browser's storage
* the app pulls the user's shuffled arrays and stores them in variables
* when playing the game, the app iterates through the user's arrays that are stored here
* at the end of every round, or when the timer stops, the index of the currently played array is saved to the browser's storage
* when the user gets to the end of the currently played word list, they get a new shuffled array and the index is reset
*
* The idea behind all of this is that each user will have uniquely ordered word lists
* the browser stores the index in each word list so the user can play multiple sessions without repeating words
*
* Notes:
* Final Fantasy VII victory fanfare when the game ends
* Hold the title for 5 seconds to clear the localStorage and relaod the page
* Hold the timer for 3 seconds when active to cancel the round and stop the timer
*/

/* Get the documentElement (<html>) to display the page in fullscreen */
var elem = document.documentElement;

/* View in fullscreen */
function openFullscreen() {
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { /* Firefox */
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE/Edge */
    elem.msRequestFullscreen();
  }
}


var team1Score = 0;
var team2Score = 0;

var gameOver = false;

var timer; //the setInterval function for the timer
var countdown; //the remaining number of seconds for the timer
var timerActive = false; 
var timer2Active = false; //level 2 timer (faster)
var timer3Active = false; //level 3 timer (fastest)
var defaultTimer = 55; //base number of seconds per round
var variableTimer = 0; //additional seconds per round (randomized)

var cancel = false; //is timer/round cancel in progress
var cancelTimer; //setTimeout function for cancelling the timer/round
var cancelTimerDuration = 3000; //how long to hold timer down to cancel

var deleteLocalStorage; //setTimeout function for clearing the localStorage

//game sounds
var scoreSound = new Howl({
	src: ['sounds/tone-beep.wav']
});
var menuSound = new Howl({
	src: ["sounds/hint.wav"]
});
var timer1Sound = new Howl({
	src: ["sounds/timer1.mp3"]
});
var timer2Sound = new Howl({
	src: ["sounds/timer2.mp3"]
});
var timer3Sound = new Howl({
	src: ["sounds/timer3.mp3"]
});
var timerEndSound = new Howl({
	src: ["sounds/buzzer.wav"]
});
var winnerSound = new Howl({
	src: ["sounds/winner.mp3"]
});

var optionNames = ["Category", "Colour Scheme", "Winning Score", "Save Settings"];
var optionsActive = false;
var currentOption = 0;
var currentCategory = 4;
var currentColor = 0;
var userColor;
var colorClasses = ["theme1", "theme2", "theme3", "theme4", "theme5"];
var winningScore = 7;
var userWinningScore;
var options = [currentCategory, currentColor, winningScore];

init();

function init() {
	reset();
	resetButtonFunctionality();
	timerButtonFunctionality();
	optionsButtonFunctionality();
	team1ButtonFunctionality();
	team2ButtonFunctionality();
	nextButtonFunctionality();
	setupLocalStorage();
	applyColorTheme();
	deleteLocalStorageFunctionality();
}

function deleteLocalStorageFunctionality() {
	/*
	clear localstorage and reload page by holding down the title div for 5 seconds
	basically force a reshuffle of all the word lists
	*/
	$("#title").on("touchstart mousedown", function(e) {
		e.preventDefault();
		timer = setInterval(function() {
			$("#title span").fadeOut(500).fadeIn(500);
		}, 1000);
		deleteLocalStorage = setTimeout(function() {
			localStorage.clear();
			window.location.reload(true);
		}, 5000);
	});
	$("#title").on("touchend mouseup", function(e) {
		e.preventDefault();
		$("#title span").stop().fadeIn();
		clearInterval(timer);
		clearTimeout(deleteLocalStorage);
	});
}

function setupLocalStorage() {
	/*
	check if word lists and indexes are stored on the client localstorage 
	if not, save a randomized copy of every word list and corresponding index tracking variable to localstorage
	*/ 
	for (var i = 0; i < categoryNames.length; i++) {
		if (localStorage.getItem(categoryNames[i]) === null) {
			userCategories[i] = shuffleArray(defaultCategories[i]);
			localStorage.setItem(categoryNames[i], JSON.stringify(userCategories[i]));
		} else {
			userCategories[i] = JSON.parse(localStorage.getItem(categoryNames[i]));
		}
		if (localStorage.getItem(categoryNames[i] + "Index" === null)) {
			localStorage.setItem(categoryNames[i] + "Index", 0);
		} else {
			userIndexes[i] = localStorage.getItem(categoryNames[i]+"Index");
		}
	}
	if (localStorage.getItem("color") === null) {
		localStorage.setItem("color", 1);
	} else {
		userColor = Number(localStorage.getItem("color"));
		currentColor = userColor;
	}
	if (localStorage.getItem("winningScore") === null) {
		localStorage.setItem("winningScore", winningScore);
	} else {
		userWinningScore = Number(localStorage.getItem("winningScore"));
		winningScore = userWinningScore;
	}
}

function applyColorTheme() {
	for (var i = 0; i < colorClasses.length; i++) {
		if (currentColor === i) {
			$("body").addClass("theme" + currentColor);
		} else {
			$("body").removeClass("theme"+i);
		}
	}
}

function saveUserSettings() {
	if (currentColor != userColor) {
		localStorage.setItem("color", currentColor);
	}
	if (winningScore != userWinningScore) {
		localStorage.setItem("winningScore", winningScore);
	}
}

function reset() {
	/*
	reset the game
	*/
	winnerSound.stop();
	menuSound.play();
	team1Score = 0;
	team2Score = 0;
	gameOver = false;
	optionsActive = false;
	$("#next").removeClass("nextOptionActive");
	$("#team1").removeClass("winner");
	$("#team2").removeClass("winner");
	$("#team1Score").html(team1Score);
	$("#team2Score").html(team2Score);
}

function team1ButtonFunctionality() {
	$("#team1").on("touchstart mousedown", function(e) {
		//preventDefault to ensure the click and touch events don't both go off
		e.preventDefault();
		//can only add to score if the game isn't won or is not in the middle of a round
		if (!gameOver && !timerActive) {
			$(this).addClass("scoreButtonActive");
		}
	});	
	$("#team1").on("touchend mouseup", function(e) {
		e.preventDefault();
		if (!gameOver && !timerActive) {
			scoreSound.play();
			team1Score++;
			if (team1Score === winningScore) {
				winnerSound.play();
				gameOver = true;
				$("#team1").addClass("winner");
			}
			$("#team1Score").html(team1Score);
		}
		$(this).removeClass("scoreButtonActive");
	});
	$("#team1").hover(function(){
		if (!gameOver && !timerActive) {
			$(this).addClass("buttonHover");
		}
	}, function(){
		$(this).removeClass("buttonHover");
	});
}

function team2ButtonFunctionality() {
	$("#team2").on("touchstart mousedown", function(e) {
		e.preventDefault();
		if (!gameOver && !timerActive) {
			$(this).addClass("scoreButtonActive");
		}
	});	
	$("#team2").on("touchend mouseup", function(e) {
		e.preventDefault();
		if (!gameOver && !timerActive) {
			scoreSound.play();
			team2Score++;
			if (team2Score === winningScore) {
				winnerSound.play();
				gameOver = true;
				$("#team2").addClass("winner");
			}
			$("#team2Score").html(team2Score);
		}
		$(this).removeClass("scoreButtonActive");
	});
	$("#team2").hover(function(){
		if (!gameOver && !timerActive) {
			$(this).addClass("buttonHover");
		}
	}, function(){
		$(this).removeClass("buttonHover");
	});
}

function resetButtonFunctionality() {
	$("#reset").on("touchstart mousedown", function(e) {
		e.preventDefault();
		if (!timerActive) {
			$(this).addClass("menuButtonActive");
		}
	});
	$("#reset").on("touchend mouseup", function(e) {
		e.preventDefault();
		if (!timerActive) {
			$(this).removeClass("menuButtonActive");
			reset();
		}
	});
	$("#reset").hover(function() {
		if (!timerActive) {
			$(this).addClass("menuButtonActive");
		}
	}, function() {
		$(this).removeClass("menuButtonActive");
	});
}

function timerButtonFunctionality() {
	$("#timer").on("touchstart mousedown", function(e) {
		e.preventDefault();
		if (!timerActive && !gameOver) {
			$(this).addClass("menuButtonActive");
		} else if (timerActive) {
			//cancel timer by holding the timer button
			cancelTimer = setTimeout(function() {
				cancel = true;
				stopTimer();
				clearInterval(timer);
				$("#phrase").html("");
			}, cancelTimerDuration);
		}
	});
	$("#timer").on("touchend mouseup", function(e) {
		e.preventDefault();
		$(this).removeClass("menuButtonActive");
		if (!timerActive && !gameOver && !cancel) {
			$("#next").removeClass("nextOption");
			optionsActive = false;
			$("#phrase").html("");
			displayWord();
			displayWord();
			runTimer();
		} else { //cancel the timer cancel
			cancel = false;
			clearTimeout(cancelTimer);
		}
	});
	$("#timer").hover(function() {
		if (!timerActive && !gameOver) {
			$(this).addClass("menuButtonActive");
		}
	}, function() {
		$(this).removeClass("menuButtonActive");
	});
}

function optionsButtonFunctionality() {
	$("#options").on("touchstart mousedown", function(e) {
		e.preventDefault();
		if (!timerActive && !gameOver) {
			$(this).addClass("menuButtonActive");
		}
	});
	$("#options").on("touchend mouseup", function(e) {
		e.preventDefault();
		if (!timerActive && !gameOver) {
			optionsActive = true;
			$("#next").addClass("nextOption");
			$(this).removeClass("menuButtonActive");
			if (currentOption === optionNames.length - 1) {
				currentOption = 0;
			} else {
				currentOption++;
			}
			menuSound.play();
			$("#phrase").html(optionNames[currentOption]);
		}
	});
	$("#options").hover(function(){
		if (!timerActive && !gameOver) {
			$(this).addClass("menuButtonActive");
		}
	}, function() {
		$(this).removeClass("menuButtonActive");
	});
}

function nextButtonFunctionality() {
	$("#next").on("touchstart mousedown", function(e) {
		e.preventDefault();
		if (timerActive && !gameOver) {
			$(this).addClass("nextButtonActive");
		} else if (optionsActive) {
			$(this).addClass("nextOptionActive");
		}
	});
	$("#next").on("touchend mouseup", function(e) {
		e.preventDefault();
		if (timerActive && !gameOver) {
			scoreSound.play();
			$("#next").removeClass("nextButtonActive");
			displayWord();
		} else if (optionsActive) {
			switch (currentOption) {
				case 0:
					if (currentCategory === categoryNames.length - 1) {
						currentCategory = 0;
					} else {
						currentCategory++;
					}
					menuSound.play();
					$("#phrase").html(categoryDisplayNames[currentCategory]);
					break;
				case 1:
					if (currentColor === colorClasses.length - 1) {
						currentColor = 0;
					} else {
						currentColor++;
					}
					applyColorTheme();
					menuSound.play();
					break;
				case 2:
					if (winningScore === 10) {
						winningScore = 5;
					} else {
						winningScore++;
					}
					$("#phrase").html("Play to " + winningScore);
					break;
				case 3:
					saveUserSettings();
					$("#phrase").html("Saved!");
			}
			$("#next").removeClass("nextOptionActive");
		}
	});
	$("#next").hover(function() {
		if (timerActive && !gameOver || optionsActive) {
			$(this).addClass("menuButtonActive");
		}
	}, function() {
		$(this).removeClass("menuButtonActive");
	});
}

function displayWord() {
	/*
	display the next word in the current category
	check if the user is on the last index of the current word list
	if user is on the last index, randomize the current category's word list and save to localStorage; set index to 0
	*/
	$("#phrase").html(userCategories[currentCategory][userIndexes[currentCategory]]);
	if (userIndexes[currentCategory] < userCategories[currentCategory].length - 1) {
		userIndexes[currentCategory]++;
	} else {
		userCategories[currentCategory] = shuffleArray(defaultCategories[currentCategory]);
		localStorage.setItem(categoryNames[currentCategory], JSON.stringify(userCategories[currentCategory]));
		userIndexes[currentCategory] = 0;
	}
}

function runTimer() {
	timer1Sound.play();
	$("#timer").addClass("timerActive");
	$("#next").addClass("nextActive");
	timerActive = true;
	variableTimer = Math.floor(Math.random() * 20);
	countdown = defaultTimer + variableTimer;
	startTimer();
}

function startTimer() {
	timer = setInterval(function() {
		if (countdown === 0) { //timer reaches 0
			stopTimer();
			timerEndSound.play();
			clearInterval(timer);
		} else if (countdown <= (variableTimer / 2 + 10)) { //timer reaches level 3 (fastest)
			runTimer3();
		} else if (countdown <= (variableTimer / 2 + 30)) { //timer reaches level 2 (faster)
			runTimer2();
		} else {
			$("#timer i").stop(); //stop the fading animation before starting a new one so they don't stack on slower browsers
			$("#timer i").fadeOut(500).fadeIn(500);
		}
		countdown--;
	}, 1000);
}

function runTimer2() { //switch to faster timer sound and speed up fading animation
	if (!timer2Active) {
		timer1Sound.stop();
		timer2Sound.play();
		timer2Active = true;
	}
	$("#timer i").stop();
	$("#timer i").fadeOut(250).fadeIn(250).fadeOut(250).fadeIn(250);
}

function runTimer3() { //switch to fastest timer sound and speed up fading animation
	if (!timer3Active) {
		timer2Sound.stop();
		timer3Sound.play();
		timer3Active = true;
	}
	$("#timer i").stop();
	$("#timer i").fadeOut(125).fadeIn(125).fadeOut(125).fadeIn(125).fadeOut(125).fadeIn(125).fadeOut(125).fadeIn(125);
}

function stopTimer() {
	timer1Sound.stop();
	timer2Sound.stop();
	timer3Sound.stop();
	$("#timer i").stop().fadeIn();
	$("#timer").removeClass("timerActive");
	$("#next").removeClass("nextActive");
	$("#next").removeClass("nextButtonActive");
	timerActive = false;
	timer2Active = false;
	timer3Active = false;
	localStorage.setItem(categoryNames[currentCategory] + "Index", userIndexes[currentCategory] + 1); //save the index of the current category
}

function shuffleArray(wordList) { //modern version of the Fisher–Yates shuffle algorithm
    var j, x, i;
    for (i = wordList.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = wordList[i];
        wordList[i] = wordList[j];
        wordList[j] = x;
    }
    return wordList;
}
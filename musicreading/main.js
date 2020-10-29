document.getElementById('switchClef').addEventListener('click', switchClef);
document.getElementById('resetScore').addEventListener('click', resetScoreButton);
document.getElementById('timeModeToggle').addEventListener('click', timeModeToggle);

jQuery(document).ready(function(){
	jQuery("#planned-features-button").on("click", function(event) {        
		jQuery("#planned-features").toggle("show");
	});
	jQuery("#toggle-options").on("click", function(event) {        
		jQuery("#options").toggle("show");
	});
	jQuery("#showStats").on("click", function(event) {        
		jQuery("#info-box").toggle("show");
	});
});

var notes_amountAnswered = new Array(100);
var notes_amountIncorrect = new Array(100);
var notes_totalResponseTime = new Array(100);
for (var i = 0; i < 100; i++) {
	notes_amountAnswered[i] = 0;
	notes_amountIncorrect[i] = 0;
	notes_totalResponseTime[i] = 0;
}

var timeLastNewNote = 0;

/*
document.getElementById('instSine').addEventListener('click', instSine);
document.getElementById('instSaw').addEventListener('click', instSaw);
document.getElementById('instPiano').addEventListener('click', instPiano);

function instaSine() {
	currInstrument = inst_synth_sine.toMaster();
}
function instaSaw() {
	currInstrument = inst_synth_saw.toMaster();
}
function instaPiano() {
	currInstrument = inst_piano.toMaster();
}
*/

function getMostDifficultNotes(amount) {
	var actualAmount = amount;
	
	var count = 0;
	for (var j = 0; j < 100; j++) {
		if (notes_amountAnswered[j] > 0)
			count++;
	}
	
	console.log(count);
	
	if (count < actualAmount) actualAmount = count;
	
	var noteIDs = new Array(actualAmount);
	
	for (var i = 0; i < actualAmount; i++) {
		var highscore = -1;
		var highestNote = -1;
		
		for (var j = 0; j < 100; j++) {
			if (!noteIDs.includes(j)) {
				if (notes_amountAnswered[j] > 0) {
					var score = notes_totalResponseTime[j] / notes_amountAnswered[j];
					if (score > highscore) {
						highscore = score;
						highestNote = j;
					}
				}
			}
		}
		
		if (highestNote > -1)
			noteIDs[i] = highestNote;
	}
	
	return noteIDs;
}

function niceRound(num) {
	return Math.round(num * 100) / 100
}

function noteOn(midiNote, velocity) {
	//is this the correct note?
	totalAttempts += 1;
	if (midiNote == currentNoteMIDI) {
		var d = new Date();
		notes_totalResponseTime[midiNote] += d.getTime() - timeLastNewNote;
		notes_amountAnswered[midiNote] += 1;
		
		var amt = 5;
		var difficultNotes = getMostDifficultNotes(amt);
		var resultString = "<font size=2>" + getLangText("difficult-notes-title") + "<br/>";
		for (var i = 0; i < difficultNotes.length; i++)
			resultString += getNoteNameByID(difficultNotes[i]) + " - " + niceRound((notes_totalResponseTime[difficultNotes[i]] / notes_amountAnswered[difficultNotes[i]]) / 1000) + "s<br/>";
		
		resultString += "<br/>" + getLangText("overall") + ": " + niceRound(getAverageResponseTime()/1000) + "s";
		document.getElementById("info-box").innerHTML = resultString;
		
		newNote();
		score += 1;
		updateScore(1);
		//play the note
		//currInstrument.triggerAttack(Math.pow(2, (midiNote-69)/12)*440, 0, 0.5);
	} else {
		updateScore(-1);
		notes_amountIncorrect[currentNoteMIDI] += 1;
	}
}

function getAverageResponseTime() {
	var totalAnswered = 0;
	var totalResponseTime = 0;
	for (var i = 0; i < 100; i++) {
		totalAnswered += notes_amountAnswered[i];
		totalResponseTime += notes_totalResponseTime[i];
	}
	return (totalResponseTime / totalAnswered);
}

function timeModeToggle() {
	if (timeMode == 0) {
		timeMode = 1;
		resetTimeMode();
	} else {
		timeMode = 0;
		resetScore();
		newNote();
	}
	updateTime();
}

function updateTime() {	
	if (timeMode == 1) {
		var timeText = '';
		var d = new Date();
		var n = d.getTime();
		
		var timeLeft = 65 - Math.round((n - timeModeStartTime) / 1000);
		
		var readyText = '';
		var prepPhase = false;
		if (timeLeft > 60) {
			if (timeLeft <= 65)
				readyText = '<br/>';
			if (timeLeft <= 64)
				readyText = '3..';
			if (timeLeft <= 63)
				readyText = readyText + '2..';
			if (timeLeft <= 62)
				readyText = readyText + '1..';
			
			if (timeLeft <= 61)
				readyText = getLangText("go");
			
			prepPhase = true;
		} else {
			if (hasStarted == false) {
				hasStarted = true;
				newNote();
			}
			readyText='<br/>';
		}
			
		if (timeLeft >= 60)
			timeLeftText = '1:00';
		else if (timeLeft < 10)
			timeLeftText = '0:0' + timeLeft;
		else
			timeLeftText = '0:' + timeLeft;
		
		if (timeLeft <= 0) {
			isFinished = true;
			timeLeftText = '<a href="#" onclick="javascript:resetTimeMode();">Reset</a>';
		}
		
		var effectiveScore = score - (totalAttempts - score);
		if (effectiveScore > timeModeHighscore) {
			gotNewHighscore = true;
			timeModeHighscore = effectiveScore;
		}
			
		
		if (prepPhase) {
			timeLeftText = '<font color=lightgray>' + timeLeftText + '</font>';
		}
		
		var highscoreText = getLangText("highscore") + ': ' + timeModeHighscore;
		if (gotNewHighscore == true) {
			highscoreText = '<font color="green">' + highscoreText + '</font>';
		}
		
		timeText = readyText + '<h1>' + timeLeftText + '</h1>' + highscoreText;
		
		
		
		timeBox.innerHTML = timeText;
		
		if (timeLeft <= 0) {
			clearNote();
		} else
			setTimeout(function() { updateTime(); }, 100);
	} else {
		timeBox.innerHTML = '';
	}
}

function resetTimeMode() {
	var d = new Date();
	timeModeStartTime = d.getTime();
	clearNote();
	resetScore();
	updateTime();
	hasStarted = false;
	gotNewHighscore = false;
	isFinished = false;
}

function updateScore(correct) {
	var additionalText = '<br/><br/>';
	if (correct == 1) {
		additionalText = '<br/><font color=green>Correct!</font>';
	} else if (correct == -1) {
		additionalText = '<br/><font color=red>Incorrect...</font>';
	}
	var percent = Math.round((score/totalAttempts)*1000)/10;
	if (score == 0)
		percent = "?";
	
	if (timeMode == 0)
		scoreBox.innerHTML = '<b>' + getLangText("score") + ': ' + score + '/' + totalAttempts + ' (' + percent + '%)</b>' + additionalText;
	else {
		var effectiveScore = score - (totalAttempts - score);
		scoreBox.innerHTML = '<b>' + getLangText("score") + ': ' + effectiveScore + '</b>' + additionalText;
	}
	
	if (correct != 0) {
		setTimeout(function() { updateScore(0); }, 1000);
	}
}
function resetScoreButton() {
	if (timeMode == 0)
		resetScore();
	else
		resetTimeMode();
}

function resetScore() {
	score = 0;
	totalAttempts = 0;
	updateScore(0);
	
	for (var i = 0; i < 100; i++) {
		notes_amountAnswered[i] = 0;
		notes_amountIncorrect[i] = 0;
		notes_totalResponseTime[i] = 0;
	}
	
	document.getElementById("info-box").innerHTML = "<font size=2>" + getLangText("none") + "</font>";
}

function switchClef() {
	if (timeMode == 1) {
		if (hasStarted == true && isFinished == false)
			return;
	}
	
	if (clef == 0)
		clef = 1;
	else if (clef == 1)
		clef = 0;
	
	if (timeMode == 1) {
		clearNote();
	} else {
		newNote();
	}
}

function noteOff() {
	currInstrument.triggerRelease();
  //context.suspend();
}

var currentNote = "C3";
var currentNoteMIDI = 60;
var noteSize = 75;
var staffLineThickness = 5;
var clef = 0;

var timeMode = 0;
var timeModeStartTime = 0;
var timeModeHighscore = 0;
var hasStarted = false;
var gotNewHighscore = false;
var isFinished = false;

var score = 0;
var totalAttempts = 0;

function clearNote() {
	currentNote = "";
	currentNoteMIDI = -1;
	noteHeight = -5000;
	drawNote();
}

function newNote() {
	var d = new Date();
	timeLastNewNote = d.getTime();
	//select a new note
	var e = document.getElementById("ledger-note-range");
	var ledgers = e.options[e.selectedIndex].value;
	
	var oldCurrentNote = currentNote;
	while (oldCurrentNote == currentNote) {
		var maxNote = 13 + ((ledgers-1) * 4);
		var rand = Math.floor(Math.random() * (maxNote));
		//console.log(rand + " / " + maxNote);
		if (clef == 0) { //treble clef
			switch (rand) {
				case 0:
					currentNote = "C3";
					currentNoteMIDI = 60;
					break;
				case 1:
					currentNote = "D3";
					currentNoteMIDI = 62;
					break;
				case 2:
					currentNote = "E3";
					currentNoteMIDI = 64;
					break;
				case 3:
					currentNote = "F3";
					currentNoteMIDI = 65;
					break;
				case 4:
					currentNote = "G3";
					currentNoteMIDI = 67;
					break;
				case 5:
					currentNote = "A3";
					currentNoteMIDI = 69;
					break;
				case 6:
					currentNote = "B3";
					currentNoteMIDI = 71;
					break;
				case 7:
					currentNote = "C4";
					currentNoteMIDI = 72;
					break;
				case 8:
					currentNote = "D4";
					currentNoteMIDI = 74;
					break;
				case 9:
					currentNote = "E4";
					currentNoteMIDI = 76;
					break;
				case 10:
					currentNote = "F4";
					currentNoteMIDI = 77;
					break;
				case 11:
					currentNote = "G4";
					currentNoteMIDI = 79;
					break;
				case 12:
					currentNote = "A4";
					currentNoteMIDI = 81;
					break;
					
				//2 ledgers
				case 13:
					currentNote = "B4";
					currentNoteMIDI = 83;
					break;
				case 14:
					currentNote = "C5";
					currentNoteMIDI = 84;
					break;
				case 15:
					currentNote = "A2";
					currentNoteMIDI = 57;
					break;
				case 16:
					currentNote = "B2";
					currentNoteMIDI = 59;
					break;
				
					
				//3 ledgers
				case 17:
					currentNote = "D5";
					currentNoteMIDI = 86;
					break;
				case 18:
					currentNote = "E5";
					currentNoteMIDI = 88;
					break;
				case 19:
					currentNote = "F2";
					currentNoteMIDI = 53;
					break;
				case 20:
					currentNote = "G2";
					currentNoteMIDI = 55;
					break;
			}
		} else if (clef == 1) { //bass clef
			switch (rand) {
				case 0:
					currentNote = "E1";
					currentNoteMIDI = 40;
					break;
				case 1:
					currentNote = "F1";
					currentNoteMIDI = 41;
					break;
				case 2:
					currentNote = "G1";
					currentNoteMIDI = 43;
					break;
				case 3:
					currentNote = "A1";
					currentNoteMIDI = 45;
					break;
				case 4:
					currentNote = "B1";
					currentNoteMIDI = 47;
					break;
				case 5:
					currentNote = "C2";
					currentNoteMIDI = 48;
					break;
				case 6:
					currentNote = "D2";
					currentNoteMIDI = 50;
					break;
				case 7:
					currentNote = "E2";
					currentNoteMIDI = 52;
					break;
				case 8:
					currentNote = "F2";
					currentNoteMIDI = 53;
					break;
				case 9:
					currentNote = "G2";
					currentNoteMIDI = 55;
					break;
				case 10:
					currentNote = "A2";
					currentNoteMIDI = 57;
					break;
				case 11:
					currentNote = "B2";
					currentNoteMIDI = 59;
					break;
				case 12:
					currentNote = "C3";
					currentNoteMIDI = 60;
					break;
				
				//2 ledgers
				case 13:
					currentNote = "D3";
					currentNoteMIDI = 62;
					break;
				case 14:
					currentNote = "E3";
					currentNoteMIDI = 64;
					break;
				case 15:
					currentNote = "C1";
					currentNoteMIDI = 36;
					break;
				case 16:
					currentNote = "D1";
					currentNoteMIDI = 38;
					break;
					
				//3 ledgers
				case 17:
					currentNote = "F3";
					currentNoteMIDI = 65;
					break;
				case 18:
					currentNote = "G3";
					currentNoteMIDI = 67;
					break;
				case 19:
					currentNote = "A0";
					currentNoteMIDI = 33;
					break;
				case 20:
					currentNote = "B0";
					currentNoteMIDI = 35;
					break;
			}
		}
	}
	
	drawNote();
}

function drawNote() {
	var oy = 35; //y offset to all drawn stuff
	var ledger = 0;
	var canvas = document.getElementById('myCanvas');
	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	//draw staff lines
	for (var i = 0; i < 5; i++) {
		var indent = i*48;
		
		ctx.beginPath();
		ctx.moveTo(0, 155+indent+oy);
		ctx.lineTo(canvas.width, 155+indent+oy);
		ctx.lineWidth = staffLineThickness;
		ctx.stroke();
	}
		
	//draw the clef
	if (clef == 0) { //treble clef
		var img = new Image();
		img.onload = function () {
			var size = 0.32;
			ctx.drawImage(img, -25, 50+oy, 751*size, 1280*size);
		}
		img.src = "images/trebleclef.png";
	} else if (clef == 1) { //bass clef
		var img = new Image();
		img.onload = function () {
			var size = 0.36;
			ctx.drawImage(img, 25, 154+oy, 400*size, 475*size);
		}
		img.src = "images/bassclef.png";
	}
	
	if (clef == 0) { //treble clef
		switch (currentNote) {
			case "E5":
				noteHeight = 69-22-27-22-27;
				ledger = -3;
				break;
			case "D5":
				noteHeight = 69-22-27-22;
				ledger = -2;
				break;
			case "C5":
				noteHeight = 69-22-27;
				ledger = -2;
				break;
			case "B4":
				noteHeight = 69-22;
				ledger = -1;
				break;
			case "A4":
				noteHeight = 69;
				ledger = -1;
				break;
			case "G4":
				noteHeight = 94;
				break;
			case "F4":
				noteHeight = 117;
				break;
			case "E4":
				noteHeight = 142;
				break;
			case "D4":
				noteHeight = 165;
				break;
			case "C4":
				noteHeight = 190;
				break;
			case "B3":
				noteHeight = 190+23;
				break;
			case "A3":
				noteHeight = 190+23+25;
				break;
			case "G3":
				noteHeight = 190+23+25+23;
				break;
			case "F3":
				noteHeight = 190+23+25+23+25;
				break;
			case "E3":
				noteHeight = 190+23+25+23+25+23;
				break;
			case "D3":
				noteHeight = 190+23+25+23+25+23+25;
				break;
			case "C3":
				noteHeight = 350;
				ledger = 1;
				break;
			case "B2":
				noteHeight = 350+25;
				ledger = 1;
				break;
			case "A2":
				noteHeight = 350+25+26;
				ledger = 2;
				break;
			case "G2":
				noteHeight = 350+25+26+25;
				ledger = 2;
				break;
			case "F2":
				noteHeight = 350+25+26+25+26;
				ledger = 3;
				break;
		}
	} else if (clef == 1) { //bass clef
		switch (currentNote) {
			case "G3":
				noteHeight = 69-22-27-22-27;
				ledger = -3;
				break;
			case "F3":
				noteHeight = 69-22-27-22;
				ledger = -2;
				break;
			case "E3":
				noteHeight = 69-22-27;
				ledger = -2;
				break;
			case "D3":
				noteHeight = 69-22;
				ledger = -1;
				break;
			case "C3":
				noteHeight = 69;
				ledger = -1;
				break;
			case "B2":
				noteHeight = 94;
				break;
			case "A2":
				noteHeight = 117;
				break;
			case "G2":
				noteHeight = 142;
				break;
			case "F2":
				noteHeight = 165;
				break;
			case "E2":
				noteHeight = 190;
				break;
			case "D2":
				noteHeight = 190+23;
				break;
			case "C2":
				noteHeight = 190+23+25;
				break;
			case "B1":
				noteHeight = 190+23+25+23;
				break;
			case "A1":
				noteHeight = 190+23+25+23+25;
				break;
			case "G1":
				noteHeight = 190+23+25+23+25+23;
				break;
			case "F1":
				noteHeight = 190+23+25+23+25+23+25;
				break;
			case "E1":
				noteHeight = 350;
				ledger = 1;
				break;
			case "D1":
				noteHeight = 350+25;
				ledger = 1;
				break;
			case "C1":
				noteHeight = 350+25+26;
				ledger = 2;
				break;
			case "B0":
				noteHeight = 350+25+26+25;
				ledger = 2;
				break;
			case "A0":
				noteHeight = 350+25+26+25+26;
				ledger = 3;
				break;
		}
	}
	noteHeight += oy;

	//draw the note
	var img2 = new Image();
	img2.onload = function () {
		ctx.drawImage(img2, 280, noteHeight, noteSize, noteSize);
	}
	img2.src = "images/wholeNote.png";
	
	//ledgerLines
	if (ledger != 0) {
		switch (ledger) {
			case 3:
				ctx.beginPath();
				ctx.moveTo(265, 350+50+50+(noteSize/2)+2+oy);
				ctx.lineTo(370, 350+50+50+(noteSize/2)+2+oy);
				ctx.lineWidth = staffLineThickness;
				ctx.stroke();
			case 2:
				ctx.beginPath();
				ctx.moveTo(265, 350+50+(noteSize/2)+2+oy);
				ctx.lineTo(370, 350+50+(noteSize/2)+2+oy);
				ctx.lineWidth = staffLineThickness;
				ctx.stroke();
			case 1:
				ctx.beginPath();
				ctx.moveTo(265, 350+(noteSize/2)+2+oy);
				ctx.lineTo(370, 350+(noteSize/2)+2+oy);
				ctx.lineWidth = staffLineThickness;
				ctx.stroke();
				break;
			case -3:
				ctx.beginPath();
				ctx.moveTo(265, 69-50-50+(noteSize/2)+2+oy);
				ctx.lineTo(370, 69-50-50+(noteSize/2)+2+oy);
				ctx.lineWidth = staffLineThickness;
				ctx.stroke();
			case -2:
				ctx.beginPath();
				ctx.moveTo(265, 69-50+(noteSize/2)+2+oy);
				ctx.lineTo(370, 69-50+(noteSize/2)+2+oy);
				ctx.lineWidth = staffLineThickness;
				ctx.stroke();
			case -1:
				ctx.beginPath();
				ctx.moveTo(265, 69+(noteSize/2)+2+oy);
				ctx.lineTo(370, 69+(noteSize/2)+2+oy);
				ctx.lineWidth = staffLineThickness;
				ctx.stroke();
				break;
		}
	}
}

newNote();
updateScore();

const sampler = new Tone.Sampler({
	urls: {
		A0: "A0.mp3",
		C1: "C1.mp3",
		"D#1": "Ds1.mp3",
		"F#1": "Fs1.mp3",
		A1: "A1.mp3",
		C2: "C2.mp3",
		"D#2": "Ds2.mp3",
		"F#2": "Fs2.mp3",
		A2: "A2.mp3",
		C3: "C3.mp3",
		"D#3": "Ds3.mp3",
		"F#3": "Fs3.mp3",
		A3: "A3.mp3",
		C4: "C4.mp3",
		"D#4": "Ds4.mp3",
		"F#4": "Fs4.mp3",
		A4: "A4.mp3",
		C5: "C5.mp3",
		"D#5": "Ds5.mp3",
		"F#5": "Fs5.mp3",
		A5: "A5.mp3",
		C6: "C6.mp3",
		"D#6": "Ds6.mp3",
		"F#6": "Fs6.mp3",
		A6: "A6.mp3",
		C7: "C7.mp3",
		"D#7": "Ds7.mp3",
		"F#7": "Fs7.mp3",
		A7: "A7.mp3",
		C8: "C8.mp3"
	},
	release: 1,
	baseUrl: "https://tonejs.github.io/audio/salamander/"
}).toDestination();

piano({
	parent: document.querySelector("#content"),
	noteon: note => sampler.triggerAttack(note.name),
	noteoff: note => sampler.triggerRelease(note.name),
});
		
		
const currInstrument = sampler.toMaster();
		
//attach a listener to the keyboard events
document.querySelector('tone-piano').addEventListener('noteon', e => {
  noteOn(e.detail.midi);
})

document.querySelector('tone-piano').addEventListener('noteoff', e => {
  currInstrument.triggerRelease();
})

function getNoteNameByID(number) {
	switch (number) {
		case 33:
			return "A0";
		case 35:
			return "B0";
		case 36:
			return "C1";
		case 38:
			return "D1";
		case 40:
			return "E1";
		case 41:
			return "F1";
		case 43:
			return "G1";
		case 45:
			return "A1";
		case 47:
			return "B1";
		case 48:
			return "C2";
		case 50:
			return "D2";
		case 52:
			return "E2";
		case 53:
			return "F2";
		case 55:
			return "G2";
		case 57:
			return "A2";
		case 59:
			return "B2";
		case 60:
			return "C3";
		case 62:
			return "D3";
		case 64:
			return "E3";
		case 65:
			return "F3";
		case 67:
			return "G3";
		case 69:
			return "A3";
		case 71:
			return "B3";
		case 72:
			return "C4";
		case 74:
			return "D4";
		case 76:
			return "E4";
		case 77:
			return "F4";
		case 79:
			return "G4";
		case 81:
			return "A4";
		case 83:
			return "B4";
		case 84:
			return "C5";
		case 86:
			return "D5";
		case 88:
			return "E5";
	}
}

<?php
$lang = $_GET["lang"];

if ($lang == "") $lang = "en";

switch ($lang) {
	case "en":
		$text = array(
			"title" => "Sheet Music Practice - Chaomoon",
			"author-by" => "By",
			"header" => "Sheet Music Practice",
			"options-title" => "Options",
			"option-ledger-lines" => "Maximum Ledger Lines",
			"switch-clef" => "Switch Clef",
			"reset" => "Reset",
			"time-mode-title" => "Time Mode",
			"highscore" => "High score",
			"score" => "Score",
			"go" => "GO!",
			"show-stats" => "Stats",
			"none" => "None yet",
			"difficult-notes-title" => "<b>Difficult notes</b><br/>(average response time)<br/>",
			"overall" => "Overall",
		);
		break;
	case "jp":
		$text = array(
			"title" => "楽譜練習 - Chaomoon",
			"author-by" => "プログラマー：",
			"header" => "楽譜練習",
			"options-title" => "オプション",
			"option-ledger-lines" => "最大加線",
			"switch-clef" => "音部記号",
			"reset" => "リセット",
			"time-mode-title" => "時間モード",
			"highscore" => "高得点",
			"score" => "スコア",
			"go" => "行く！",
			"show-stats" => "統計",
			"none" => "まだ何もありません",
			"difficult-notes-title" => "<b>難しい</b><br/>（平均応答時間）<br/>",
			"overall" => "全体",
		);
		break;
}

?>
<html>
	<head>
		<title><?php echo $text["title"]; ?></title>

		<link href="https://fonts.googleapis.com/css?family=Nanum+Gothic&display=swap" rel="stylesheet">

		<!--
		<script src="https://unpkg.com/@webcomponents/webcomponentsjs@^2/webcomponents-bundle.js"></script>
		<script src="https://unpkg.com/tone"></script>
		<script src="https://unpkg.com/@tonejs/ui"></script>
		-->

		<!--<script src="https://unpkg.com/tone@14.7.39/build/Tone.js"></script> -->
		<script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/2.4.3/webcomponents-bundle.js"></script>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
		<script src="tonejs/Tone.js"></script>
		<script src="tonejs/tone-ui.js"></script>
		<script src="tonejs/components.js"></script>
		
		<!-- Global site tag (gtag.js) - Google Analytics -->
		<script async src="https://www.googletagmanager.com/gtag/js?id=UA-29012085-2"></script>
		<script>
		  window.dataLayer = window.dataLayer || [];
		  function gtag(){dataLayer.push(arguments);}
		  gtag('js', new Date());

		  gtag('config', 'UA-29012085-2');
		</script>

		<link rel="stylesheet" href="main.css"/>
	</head>
	<body>
		<span style="float:right; position:fixed;">
			<b><?php echo $text["header"]; ?> &#119136;</b> <font size=4 color=gray>v1.3</font><br/>
			<font size=4><?php echo $text["author-by"]; ?> <a href=http://chaomoon.com>Chaomoon</a></font> <a href="http://twitter.com/chaomoonx"><img src="images/Twitter-128.png" width=24 height=24 /></a>
			<br/>
			<br/>
			<font size=2>
				<?php
				if ($lang == "en") {
					echo '
					<div id="planned-features-button"><a href="#">Planned features</a></div>
					<div id="planned-features" class="subcategory" style="display: none;">
						<ul>
							<li>dark mode</li>
							<li>key selection</li>
							<li>sharps & flats</li>
							<li>chords</li>
							<li>short phrases</li>
						</ul>
					</div>
					';
				}
				?>
				<div id="toggle-options"><a href="#"><?php echo $text["options-title"]; ?></a></div>
				<div id="options" class="subcategory" style="display: none;">
					<font size=3><?php echo $text["option-ledger-lines"]; ?></font>
					<select class="custom-select" id="ledger-note-range">
						<option value="1">1</option>
						<option value="2" selected="selected">2</option>
						<option value="3">3</option>
					</select>
				</div>
			</font>
		</span>
		
		<span style="right:16px; position:fixed;">
			<a href="index.php?lang=en"><img src="images/flag-us.png" /></a>
			<a href="index.php?lang=jp"><img src="images/flag-jp.png" class="borderimg" /></a>
		</span>
		
		<center>
		<canvas id="myCanvas" width="700" height="600" <!--style="border:2px outset #cccccc;"-->></canvas>

		<div id="scoreBox""></div>
		<div id="timeBox" style="float:left; position:fixed; margin-left:100px;"></div>

		<style>
			tone-piano {
				margin-bottom: 10px;
				width: 800px;
			}
		</style>
		<div id="content"></div>

		<ul class="buttons-list">
			<li><button id="switchClef"><?php echo $text["switch-clef"]; ?></button></li>
			<li><button id="resetScore"><?php echo $text["reset"]; ?></button></li>
			<li><button id="timeModeToggle"><?php echo $text["time-mode-title"]; ?></button></li>
			<li><button id="showStats"><?php echo $text["show-stats"]; ?></button></li>
		</ul>
		
		<div id="info-box" style="border: 1px solid #555; width: 200px; display: none;"><font size=2><?php echo $text["none"]; ?></font></div>
		
		<!-- <ul class="buttons-list">
			<li><button id="instSine">Sine</button></li>
			<li><button id="instSaw">Saw</button></li>
			<li><button id="instPiano">Piano</button></li>
		</ul> -->
		<script>
			function getLangText(key) {
				switch (key) {
					case "score":
						return "<?php echo $text["score"]; ?>";
					case "highscore":
						return "<?php echo $text["highscore"]; ?>";
					case "go":
						return "<?php echo $text["go"]; ?>";
					case "difficult-notes-title":
						return "<?php echo $text["difficult-notes-title"]; ?>";
					case "none":
						return "<?php echo $text["none"]; ?>";
					case "overall":
						return "<?php echo $text["overall"]; ?>";
				}
			}
		</script>
		<script src="main.js"></script>
	</body>
</html>
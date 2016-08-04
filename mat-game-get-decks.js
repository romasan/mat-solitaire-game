var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        var json = JSON.stringify(data),
            blob = new Blob([json], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

// window.decks=[];
let _from = 1;
let _to = 1000;

let _get = (i) => {
	$.post(
		'./gw/loadGame.php',
		{
			sessionId:'245299825578f1ba1543dd6.33365003',
			userId:29538616,
			gameVariationId:34,
			newGameId:i * 30,
			oldGameId:25096,
			playMode:0,
			gameType:0,
			playFilter:0
		},
		(e) => {
			let _json = {
				"lg-index": i * 30,
				"deck": JSON.parse(e).data.deck 
			};
			saveData(_json, i + ".json");
			// window.decks.push(JSON.parse(e).data.deck);
		}
	);
	if(i < _to) setTimeout(()=>{_get(i + 1)}, 50);
};
_get(_from);


// var data = { x: 42, s: "hello, world", d: new Date() },
    // fileName = "my-download.json";

// saveData(data, fileName);



/************** GRAPHICS **************/


function plot(data,x,y,w,h) {
	if(data==null) {
		return;
	}
	beginShape();
	for(let i=0;i<data.length;i++) {
		let rawValue = (Number.isNaN(data[i])?0:data[i]);
		let mapValue = ((rawValue-yAxisMin)/(yAxisMax-yAxisMin));
		
		let u = x+i/(data.length-1)*w;
		let v = y-h*min(max(mapValue,0),1);
		
		vertex(u,v);
	}
}

// draw a grid with tickers and numbers
function grid(x, y, w, h,
		tileW, tileH,
		unitX, unitY) {
	
	stroke(64);
	for(let i=x;i<=x+w+1;i+=tileW) { line(i,y,i,y+h); }
	for(let i=y+h;i>=y-1;i-=tileH) { line(x,i,x+w,i); }
	
	stroke(255);
	fill(255);
	line(x,y,x,y+h);
	line(x,y+h,x+w,y+h);
	
	let dpX = min(max(2,ceil(-log((xAxisMax-xAxisMin)*unitX)/log(10))),5);
	let dpY = min(max(2,ceil(-log((yAxisMax-yAxisMin)*unitY)/log(10))),5);
	
	textAlign(CENTER,TOP);
	for(let i=0,u;(u=(x+i*tileW))<=(x+w+1);i++) {
		line(u,y+h,u,y+h+2);
		let coord = (xAxisMin+i*unitX*(xAxisMax-xAxisMin));
		text(coord==0?"0":coord.toFixed(dpX),u+1,y+h+2);
	}
	textAlign(RIGHT,CENTER);
	for(let i=0,v;(v=(y+h-i*tileH))>=y-1;i++) {
		line(x,v,x-2,v);
		let coord = (yAxisMin+i*unitY*(yAxisMax-yAxisMin));
		text(coord==0?"0":coord.toFixed(dpY),x-4,v-2);
	}
	
}

function labels(x, y, w, h, main, axisX, axisY) {
	fill(255);
	textAlign(CENTER,BOTTOM);
	push();
	translate(x,y+h/2);
	rotate(-HALF_PI);
	text(axisY,0,-40);
	pop();
	textAlign(CENTER,TOP);
	text(axisX,x+w/2,y+h+20);
	textAlign(CENTER,BOTTOM);
	text(main,x+w/2,y-8);
}


/************** MORE MATH **************/


function log2(n) {
	let m;
	for(m=0;n>1;m++) {
		n >>= 1;
	}
	return m;
}

function log2floor(n) { // largest integer m such that 2^m <= n, return 2^m
	for(let m=1;;m*=2) {
		if(m>=n) {
			if(m>n) {
				m /= 2;
			}
			return m;
		}
	}
}

function log2ceil(n) { // smallest integer m such that 2^m >= n, return 2^m
	for(let m=1;;m*=2) {
		if(m>=n) {
			return m;
		}
	}
}

function fact(n) { // factorial
	let out = 1;
	for(let i=2;i<=n;i++) {
		out *= i;
	}
	return out;
}

function perm(n) { // permutations
	return 0; // todo
}

function comb(n,k) { // combinations
	return fact(n)/(fact(k)*fact(n-k));
}

function shuffleCount(a,b) {
	return fact(a+b)/(fact(a)*fact(b));
}

function entropy(p, base) {
	if(base==null) {
		p = [p,1-p];
		base = 2;
	}
	let sum = 0;
	for(let i=0;i<p.length;i++) {
		sum += p[i]==0?0:(p[i]*Math.log(p[i]));
	}
	return -sum/Math.log(base);
}

function movingAverage(arr,windowSize) {
	let newArr = [];
	let initValue = isNaN(arr[0])?0:arr[0];
	let windowArr = Array(windowSize).fill(initValue);
	let windowSum = initValue*windowSize;
	let windowIndex = 0;
	for(let i=0;i<arr.length;i++) {
		windowSum -= windowArr[windowIndex];
		windowArr[windowIndex] = isNaN(arr[i])?0:arr[i];
		windowSum += windowArr[windowIndex];
		if(++windowIndex>=windowSize) {
			windowIndex = 0;
		}
		
		newArr[i] = windowSum/min(i+1,windowSize);
	}
	return newArr;
}

function windowedAverage(arr,windowSize) {
	if(windowSize==0) {
		return arr;
	}
	let newArr = [];
	for(let i=0;i<arr.length;i++) {
		let samples = 0;
		let sampleCount = 0;
		for(let j=-windowSize;j<=windowSize;j++) {
			let k = i+j;
			if(k>=0 && k<arr.length) {
				samples += isNaN(arr[k])?0:arr[k];
				sampleCount++;
			}
		}
		newArr[i] = sampleCount>0?samples/sampleCount:0;
	}
	return newArr;
}

function convolutionAverage(arr,factor) {
	let newArr = arr.map(x=>{return x});
	for(;factor>.5;factor-=.5) {
		newArr = convolutionAverage(newArr,.5);
	}
	if(factor>0) {
		newArr = newArr.map((x,i)=>{x=x||0;return x+(((newArr[i+1]||x)+(newArr[i-1]||x))/2-x)*factor});
	}
	return newArr;
}

/************** MISC **************/

let outputMode = 0;

function getTestSequence(binType,options,len) {
	
	let bin = createBin(binType);
	bin.setFrameSize(options.n||8);
	bin.setBinSize(options.k||1);
	bin.setDeadTime(options.e||0);
	let p = options.p||.5;
	
	if(outputMode==1) {
		len *= 8;
	}
	
	let samples = new Int8Array(len);
	let index = 0;
	
	while(index<len) {
		bin.write(Math.random()<p);
		if(outputMode==0) {
			while(bin.getOutput().length()>=8 && index<len) {
				samples[index++] = bin.getOutput().readInt(8);
			}
		} else {
			while(bin.getOutput().ready()) {
				samples[index++] = bin.getOutput().read()?'1':'0';
			}
		}
	}
	
	return samples;
}

function download(data,name) {
	let link = document.createElement("a");
	link.href = window.URL.createObjectURL(new Blob(outputMode==0?[data]:data,{type:"octet/stream"}));
	link.download = name;
	link.click();
	window.URL.revokeObjectURL(link.href);
}

/************** MAIN / USER INTERFACE **************/

let frameSize = 8;
let deadTime = 0;
let probability = 0.5;
let graphSmoothness = 0;

let graphSamples = 512;

let binTypes = [
	SimpleBinning.prototype,
	AdaptiveBinning.prototype,
	AdaptiveAggregatedBinning.prototype,
	AdaptiveFraming.prototype,
];

let ideal = [];

let bins = [];
let rateGraphs = [];
let randGraphs = [];

let defaultPalette;

let labelText = Array(binTypes.length);

let graphScaleX = 1;
let graphScaleY = 1;

let notif = "";
let notifTimer = 0;

let graphUpdateInterval = null;

let graphControlPanel;
let controlTemplate;

let xAxisMode = 0;
let yAxisMode = 0;

let xAxisMin = 0;
let xAxisMax = 1;
let yAxisMin = 0;
let yAxisMax = 1;

let mousePressedX = -1;
let mousePressedY = -1;

let n = frameSize;
let d = deadTime;
let scheme = binTypes[0];
let a = 0;

let showMarkovAnalysis = {
	sb: false,
	ab: false,
	aab: false,
	af: false
};

function updateIdealGraphs(schemeIndex) {
	
	n = frameSize;
	d = deadTime;
	scheme = binTypes[schemeIndex];
	a = 0;
	
	let tbmc = new TimeBinningMarkovChain(n,d,scheme);

	let maxEntropy = 0;
	
	let maxP = 0;
	let maxS = 0;
	let entS = 0;
	
	let stateCount = tbmc.transitions.length;
	console.log("the markov chain has "+stateCount+" states");
	let noratestates = 0;
	for(let i=0;i<stateCount;i++) {
		if(tbmc.transitions[i].rate==0) {
			noratestates++;
		}
	}
	console.log("..."+noratestates+" of which do not give any key bits.");
	console.log("a speed-up of ~"+round(pow(stateCount/(stateCount-noratestates),2))+"x is in order");
	
	ideal[schemeIndex] = LinAlg.array2d(3,graphSamples);
	for(let i=0;i<ideal[schemeIndex][0].length;i++) {
		let p = i/(ideal[schemeIndex][0].length-1)*(1-a);

		// ORIGINAL WORKING
		let limit = tbmc.transition(p);
		let state = tbmc.stationaryFromMatrix(0,limit);
		ideal[schemeIndex][0][i] = tbmc.entropyFromMatrix(limit,state,true);
		ideal[schemeIndex][1][i] = tbmc.keyrateFromState(state);
		maxEntropy = max(maxEntropy,isNaN(ideal[schemeIndex][0][i])?0:ideal[schemeIndex][0][i]);
		
		progress = p;
	}
	for(let i=0;i<ideal[schemeIndex][0].length;i++) {
		ideal[schemeIndex][0][i] /= maxEntropy;
		ideal[schemeIndex][2][i] = ideal[schemeIndex][0][i]*ideal[schemeIndex][1][i];
		
		if(ideal[schemeIndex][1][i]>maxS) {
			maxS = ideal[schemeIndex][1][i];
			maxP = i/(ideal[schemeIndex][0].length-1)*(1-a);
			entS = ideal[schemeIndex][0][i];
		}
	}
	
}

async function updateGraphs(iterations) {
	
	if(graphUpdateInterval!=null) {
		clearInterval(graphUpdateInterval);
	}
	
	await !keyIsPressed;
	
	for(let i=0;i<bins.length;i++) {
		for(let j=0;j<bins[0].length;j++) {
			
			let p = xAxisMode==0?(j/(bins[0].length-1)*(xAxisMax-xAxisMin)+xAxisMin):probability;
			
			for(let k=0;k<iterations;k++) {
				bins[i][j].write(Math.random()<p);
			}
			
			// empty the output
			while(bins[i][j].getOutput().ready()) {
				bins[i][j].getOutput().read();
			}
			
			let h = yAxisMode==1?1:(entropy(p)/(p*d+1));
			rateGraphs[i][j] = h==0?0:(bins[i][j].getRawKeyRate()/h);
			randGraphs[i][j] = bins[i][j].getAnalysis().getRandomness();
		}
	}
	
	graphUpdateInterval = setInterval(function(){
		updateGraphs(32*8/bins.length);
	},10);
}

function reset() {
	for(let i=0;i<bins.length;i++) {
	for(let j=0;j<bins[0].length;j++) {
		bins[i][j].clear();
	}
	}
	if(showMarkovAnalysis.sb) {
		updateIdealGraphs(0);
	}
	if(showMarkovAnalysis.ab) {
		updateIdealGraphs(1);
	}
	if(showMarkovAnalysis.aab) {
		updateIdealGraphs(2);
	}
	if(showMarkovAnalysis.af) {
		updateIdealGraphs(3);
	}
}

function notify(text) {
	notif = text;
	notifTimer = 512;
}

function rgba2hex(value) {
	return  ("0"+(value.levels[0].toString(16))).slice(-2)+
			("0"+(value.levels[1].toString(16))).slice(-2)+
			("0"+(value.levels[2].toString(16))).slice(-2);
}

function getGraphControlIndex(obj) {
	return Array.from(graphControlPanel.children).indexOf(obj);
}

function getColorPicker(index) {
	return graphControlPanel.children[index].querySelector("#graph-color");
}

function setColorPicker(index,color) {
	graphControlPanel.children[index].querySelector("#graph-settings").style = "background-color:"+color;
	getColorPicker(index).value = color;
}

function getAvailablePaletteColor() {
	for(let i=0;i<defaultPalette.length;i++) {
		let taken = false;
		let color = "#"+rgba2hex(defaultPalette[i]);
		for(let j=0;j<graphControlPanel.children.length-1;j++) {
			if(getColorPicker(j).value==color) {
				taken = true;
				break;
			}
		}
		if(!taken) {
			return color;
		}
	}
	return "#"+rgba2hex(color(255));
}

function createBin(binType) {
	//return new binType.constructor();
	let binScheme = new BinningScheme();
	binScheme.setSchemeType(binType);
	binScheme.setSchemeCount(1);
	return binScheme;
}

function addGraph(typeIndex,index) {
	
	if(index==null) {
		index = bins.length;
	}
	
	let newBins = Array(graphSamples).fill(0).map(y=>createBin(binTypes[typeIndex]));
	newBins.forEach(y=>{
		y.setFrameSize(frameSize);
		y.setBinSize(1);
	});
	if(xAxisMode==0) {
		newBins.forEach(y=>{
			y.setDeadTime(deadTime);
		});
	} else {
		newBins.forEach((y,i)=>{
			y.setDeadTime(i);
		});
	}
	bins.splice(index,0,newBins);
	rateGraphs.splice(index,0,[]);
	randGraphs.splice(index,0,[]);
	
	let entry = controlTemplate.content.cloneNode(true);
	
	 // scheme drop-down menu
	let schemeSelect = entry.querySelector("select");
	schemeSelect.selectedIndex = typeIndex;
	schemeSelect.onchange = function() {
		index = getGraphControlIndex(entry);
		let color = getColorPicker(index).value;
		deleteGraph(index);
		addGraph(schemeSelect.selectedIndex,index);
		//getColorPicker(index).value = color;
		setColorPicker(index,color);
	};
	
	entry.querySelector("#graph-color").onchange = function() {
		entry.querySelector("#graph-settings").style = "background-color:"+this.value;
	};
	
	entry.querySelector("#graph-settings").onclick = function() {
		getColorPicker(index).click();
	};
	
	 // x-out button
	let removeButton = entry.querySelector(".remove");
	removeButton.onclick = function() {
		index = getGraphControlIndex(entry);
		//console.log(index);
		deleteGraph(index);
	};
	
	graphControlPanel.insertBefore(entry,graphControlPanel.children[index]);
	entry = graphControlPanel.children[index];
	
	//getColorPicker(index).value = getAvailablePaletteColor();
	setColorPicker(index,getAvailablePaletteColor());
}

function deleteGraph(index) {
	if(index<0) {
		console.log("glitch...");
		return; // glitch?
	}
	bins.splice(index,1);
	rateGraphs.splice(index,1);
	randGraphs.splice(index,1);
	graphControlPanel.removeChild(graphControlPanel.children[index]);
}

function setFrameSize(n) {
	frameSize = n;
	for(let i=0;i<bins.length;i++) {
	for(let j=0;j<bins[i].length;j++) {
		bins[i][j].clear();
		bins[i][j].setFrameSize(n);
	}
	}
	// todo: ideal
}

function handleNumInput(input,callback) {
	if(!input.value || isNaN(input.value) ||
			input.value<parseInt(input.min) ||
			input.value>parseInt(input.max)) {
		input.value = input.pvalue;
		input.style["background-color"] = "#880000";
		setTimeout(function(){
			input.style["background-color"] = "";
		},500);
	} else {
		callback(parseFloat(input.value));
		input.pvalue = input.value;
	}
}

function applyDeadTime() {
	bins.forEach(x=>x.forEach([
		(y=>y.setDeadTime(deadTime)),
		((y,i)=>y.setDeadTime(i))
	][xAxisMode]));
	// todo: ideal
}

function getSelection(name) {
	return document.querySelector('select[name="'+name+'"]');
}

function getInput(name) {
	return document.querySelector('input[name="'+name+'"]');
}

function setDetectorCount(n) {
	bins.forEach(x=>x.forEach(y=>y.setDeadTimerCount(n)));
}

function setupPlot() {
	
	textFont("Source Code Pro");
	
	for(let i=0;i<binTypes.length;i++) {
		addGraph(i);
	}
	
	setDetectorCount(1);
	updateGraphs(32);
	
	for(let i=0;i<labelText.length;i++) {
		labelText[i] = bins[i][0].getName();
	}
	
	// handlers for the dropdown menus and number inputs:
	
	document.querySelector("#graph-control-panel > .add-control").onclick = function() {
		if(bins.length<8) {
			addGraph(0);
		}
	};
	
	getSelection("y-axis").onchange = function() {
		yAxisMode = this.selectedIndex;
	};
	
	getSelection("x-axis").onchange = function() {
		xAxisMode = this.selectedIndex;
		["downtime-control","probability-control"]
			.map(e=>document.getElementById(e))
			.forEach((x,i)=>x.style.display=(i==xAxisMode?"":"none"));
		applyDeadTime();
		reset();
	};
	
	getSelection("frame-size").onchange = function() {
		let newFrameSize = 1<<(this.selectedIndex+3);
		bins.forEach(x=>x.forEach(y=>y.setFrameSize(newFrameSize)));
		reset();
		frameSize = newFrameSize;
	};
	
	getInput("down-time").onchange = function() {
		handleNumInput(this,function(num){
			deadTime = num;
			applyDeadTime();
			reset();
		});
	};
	
	getInput("probability").onchange = function() {
		handleNumInput(this,function(num){
			probability = num;
			applyDeadTime();
			reset();
		});
	};
	
	getInput("detector-count").onchange = function() {
		handleNumInput(this,function(num){
			let interleaveMode = getSelection("interleave-mode");
			if(interleaveMode.selectedIndex==1) {
				setDetectorCount(1);
				interleaveMode.onchange();
			} else {
				setDetectorCount(num);
				reset();
			}
		});
	};
	
	getSelection("interleave-mode").onchange = function() {
		let schemeCount = 1;
		if(this.selectedIndex==1) {
			schemeCount = parseInt(getInput("detector-count").value);
			if(isNaN(schemeCount)) {
				schemeCount = 1;
			}
		}
		bins.forEach(x=>x.forEach(y=>y.setSchemeCount(schemeCount)));
		setDetectorCount(1);
		reset();
	};
	
	getSelection("graph-smoothing").onchange = function() {
		graphSmoothness = parseInt(this.options[this.selectedIndex].innerHTML);
	};
	
	// set up test sample downloader
	
	document.getElementById("sample-download-button").onclick = function() {
		outputMode = getSelection("test-output-mode").selectedIndex;
		download(getTestSequence(binTypes[getSelection("test-graph-type").selectedIndex],{
			n: 1<<(getSelection("test-frame-size").selectedIndex+3),
			k: 1<<(getSelection("test-bin-size")),
			e: getInput("test-down-time").value,
			p: getInput("test-probability").value,
		},getInput("test-length").value),"sample.bin");
	};
	
	getInput("markov-analysis-sb").onchange = ()=>{
		if(getInput("markov-analysis-sb").checked) {
			showMarkovAnalysis.sb = true;
			updateIdealGraphs(0);
		} else {
			showMarkovAnalysis.sb = false;
		}
	};
	
	getInput("markov-analysis-ab").onchange = ()=>{
		if(getInput("markov-analysis-ab").checked) {
			showMarkovAnalysis.ab = true;
			updateIdealGraphs(1);
		} else {
			showMarkovAnalysis.ab = false;
		}
	};
	
	getInput("markov-analysis-aab").onchange = ()=>{
		if(getInput("markov-analysis-aab").checked) {
			showMarkovAnalysis.aab = true;
			updateIdealGraphs(2);
		} else {
			showMarkovAnalysis.aab = false;
		}
	};
	
	getInput("markov-analysis-af").onchange = ()=>{
		if(getInput("markov-analysis-af").checked) {
			showMarkovAnalysis.af = true;
			updateIdealGraphs(3);
		} else {
			showMarkovAnalysis.af = false;
		}
	};
	
}

function keyTyped() {
	switch(key) {
		case 'r': {
			reset();
			notify("Data reset");
		} break;
		case 'n': {
			
		} break;
	}
}

function getMouseSelectionFrame() {
	return [
		min(mouseX,mousePressedX),min(mouseY,mousePressedY),
		max(mouseX,mousePressedX),max(mouseY,mousePressedY)];
}

function withinGraphFrame(x,y,border) {
	border ||= 0;
	return x>=border && y>=border && x<width-border && y<height-border;
}

function drawPlot() {
	
	background(0);
	
	if(keyIsPressed) {
		switch(key) {
			case 's': {
				notify("Scaling mode");
				if(mouseIsPressed) {
					if(mouseButton==LEFT) {
						graphScaleY *= exp(-(mouseY-pmouseY)*.01);
					} else if(mouseButton==RIGHT) {
						graphScaleY = 1;
					}
				}
			} break;
		}
	}
	
	if(notifTimer>0) {
		fill(min(255,notifTimer));
		notifTimer -= 4;
		textAlign(LEFT,TOP);
		text(notif,6,6);
	}
	
	let border = 100;
	
	let xRange = xAxisMode==0?1:graphSamples;
	
	// define the area within and around we will draw our graph
	let x = border;
	let y = border;
	let w = width-border*2;
	let h = height-border*2;
	
	// draw the gridlines
	grid(x,y,w,h,w*.1*graphScaleX,h*.1*graphScaleY,.1*xRange,.1);
	
	// draw the labels around the grid
	let yAxisLabel = ([
		"Photon Utilization (r/h(p))",
		"Raw Key Rate (r)",
		"Randomness (H_min(X)h(x))"
	])[yAxisMode];
	let xAxisLabel = ([
		"Probability (p)",
		"Down time (e)"
	])[xAxisMode];
	labels(x,y,w,h,
		"n = "+frameSize+
			[", e = "+deadTime,
			 ", p = "+probability]
		[xAxisMode]+
		", smoothing = "+graphSmoothness,
			xAxisLabel,yAxisLabel);
	
	// actually draw the graphs themselves
	for(let i=0;i<rateGraphs.length;i++) {
		noFill();
		stroke(getColorPicker(i).value);
		let graph = yAxisMode==2?randGraphs[i]:rateGraphs[i];
		//graph = windowedAverage(graph,graphSmoothness);
		graph = convolutionAverage(graph,graphSmoothness);
		plot(graph,border+1,h+border-1,w*graphScaleX-2,h*graphScaleY-2);
	}
	
	// actually draw the ideal graphs
	let drawIdeal = index=>{
		noFill();
		let keyRatePlot = ideal[index][1];
		let entropyPlot = ideal[index][0];
		let infoRatePlot = ideal[index][2];
		if(yAxisMode==0) {
			keyRatePlot = [];
			infoRatePlot = [];
			for(let i=0;i<ideal[index][1].length;i++) {
				let p = i/(ideal[index][1].length-1);
				let Hx = entropy(p)/(p*d+1);
				keyRatePlot[i] = ideal[index][1][i]/Hx;
				infoRatePlot[i] = ideal[index][2][i]/Hx;
			}
		}
		stroke(255,0,0); plot(keyRatePlot,border+1,h+border-1,w*graphScaleX-2,h*graphScaleY-2);
		stroke(0,255,0); plot(entropyPlot,border+1,h+border-1,w*graphScaleX-2,h*graphScaleY-2);
		stroke(255,0,255); plot(infoRatePlot,border+1,h+border-1,w*graphScaleX-2,h*graphScaleY-2);
	};
	if(showMarkovAnalysis.sb) {
		drawIdeal(0);
	}
	if(showMarkovAnalysis.ab) {
		drawIdeal(1);
	}
	if(showMarkovAnalysis.aab) {
		drawIdeal(2);
	}
	if(showMarkovAnalysis.af) {
		drawIdeal(3);
	}
	
	// zoom in by selecting a window
	if(mouseIsPressed) {
		if(mousePressedX==-1 && withinGraphFrame(mouseX,mouseY)) {
			mousePressedX = mouseX;
			mousePressedY = mouseY;
		}
		if(mousePressedX!=-1) {
			noFill();
			stroke(255);
			
			// draw the selection frame
			let frame = getMouseSelectionFrame();
			rect(frame[0],frame[1],frame[2]-frame[0],frame[3]-frame[1]);
			stroke(255,128);
			line(frame[0],0,frame[0],height);
			line(frame[2],0,frame[2],height);
			line(0,frame[1],width,frame[1]);
			line(0,frame[3],width,frame[3]);
		}
	} else {
		if(mousePressedX!=-1) {
			// use the frame somehow
			
			if(mouseX==mousePressedX && mouseY==mousePressedY) {
				
				// reset frame
				xAxisMin = 0;
				xAxisMax = 1;
				yAxisMin = 0;
				yAxisMax = 1;
				reset();
				
			} else {
				
				let frame = getMouseSelectionFrame();
				
				if(withinGraphFrame(frame[0],frame[1],border)
						|| withinGraphFrame(frame[2],frame[3],border)
						|| withinGraphFrame(frame[0],frame[3],border)
						|| withinGraphFrame(frame[2],frame[1],border)) {
					
					// account for y-axis being flipped
					frame[1] = height-max(mouseY,mousePressedY);
					frame[3] = height-min(mouseY,mousePressedY);
					
					// restrict frame to within the graph
					frame[0] = min(max(frame[0],border),width-border);
					frame[1] = min(max(frame[1],border),height-border);
					frame[2] = min(max(frame[2],border),width-border);
					frame[3] = min(max(frame[3],border),height-border);
					
					// map frame to "actual" coordinates
					frame[0] = (frame[0]-border)/(width-border*2)*(xAxisMax-xAxisMin)+xAxisMin;
					frame[1] = (frame[1]-border)/(height-border*2)*(yAxisMax-yAxisMin)+yAxisMin;
					frame[2] = (frame[2]-border)/(width-border*2)*(xAxisMax-xAxisMin)+xAxisMin;
					frame[3] = (frame[3]-border)/(height-border*2)*(yAxisMax-yAxisMin)+yAxisMin;
					
					// apply
					xAxisMin = frame[0];
					xAxisMax = frame[2];
					yAxisMin = frame[1];
					yAxisMax = frame[3];
					reset();
				}
			
			}
			
			mousePressedX = -1;
			mousePressedY = -1;
		}
	}
	
	//document.title = "QKD Binning Demo | FPS: "+frameRate().toFixed(1);
}

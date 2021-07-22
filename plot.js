
let plots = [];

function h(p,t) {
	return (p>0 && p<1)?((-p*log(p)-(1-p)*log(1-p))/log(2)*(sin(frameCount*.1+p*10+t*.1)*.5+.5)):0;
}

class Experiment {
	
	constructor(options) {
		
		this.scheme = options.scheme; // as text
		this.n = Math.ceil(options.n);
		this.d = Math.ceil(options.d);
		this.p = options.p;
		this.J = options.J;
		this.a = options.a;
		this.f = options.f;
		
		this.bin = new BinningScheme();
		this.bin.setSchemeType(binTypes[this.scheme]);
		this.bin.setSchemeCount(1);
		this.bin.setBinSize(1);
		this.bin.setFrameSize(this.n);
		this.bin.setDeadTime(this.d);
	}
	
	get(options) {
		let iterations = options.iterations;
		let y_axis = options.y_axis;
		for(let t=0;t<iterations;t++) {
			let bit = Math.random()<this.p;
			if(bit && Math.random()<this.a) {
				bit = false;
			}
			if(!bit && Math.random()<this.f) {
				bit = true;
			}
			this.bin.write(bit);
		}
		switch(plotAxes.y_axis.label) {
			case "R": { return this.bin.getRawKeyRate(); }
			case "H": {
				return Math.random();
			}
			case "Pe": { // probability of error
				return Math.random();
			}
			case "Rf": { // final rate
				return Math.random();
			}
		}
		
	}
	
}

class MarkovChainAnalysis {
	
	static chains = [];
	
	static getChain = (n,d,scheme)=>{
		
		for(let i=0;i<MarkovChainAnalysis.chains.length;i++) {
			let chain = MarkovChainAnalysis.chains[i];
			if(chain.n==n && chain.d==d && chain.scheme==scheme) {
				return chain;
			}
		}
		
		let tbmc = new TimeBinningMarkovChain(n,d,scheme);
		tbmc.n = n;
		tbmc.d = d;
		tbmc.scheme = scheme;
		MarkovChainAnalysis.chains.push(tbmc);
		
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
		
		return tbmc;
	}
	
	constructor(options) {
		this.scheme = options.scheme;
		this.n = Math.ceil(options.n);
		this.d = Math.ceil(options.d);
		this.p = options.p;
		this.J = options.J;
		this.a = options.a;
		this.f = options.f;
		
		this.tbmc = MarkovChainAnalysis.getChain(this.n,this.d,binTypes[this.scheme]);
	}
	
	get() {
		let p = this.p*(1-this.a)+(1-this.p)*this.f;
		let limit = this.tbmc.transition(p);
		let state = this.tbmc.stationaryFromMatrix(0,limit);
		switch(plotAxes.y_axis.label) {
			case "H": { return this.tbmc.entropyFromMatrix(limit,state,true); }
			case "R": { return this.tbmc.keyrateFromState(state); }
		}
	}
	
}

class Plot {
	
	update(options) {
		
		["scheme","type","color"].concat("ndpJaf".split('')).forEach(e=>{
			if(options[e]!=null) {
				this[e] = options[e];
			}
		});
		
		$(this.controls).find(".titlebar p:nth-child(2)").text(
			$(this.controls).find("select[name='scheme'] option[value='"+this.scheme+"']").text());
		
		this.refresh();
		
		return this;
	}
	
	updateControls() {
		
		$(this.controls).find(".titlebar p:nth-child(2)").text(
			$(this.controls).find("select[name='scheme'] option[value='"+this.scheme+"']").text());
		
		$(this.controls).find("select[name='scheme']").val(this.scheme);
		$(this.controls).find("select[name='sim']").val(this.type);
		$(this.controls).find("input[type='color']").val(this.color);
		"ndpJaf".split('').forEach(e=>{
			$(this.controls).find("input[name='"+e+"']").val(this[e]);
		});
		
	}
	
	refresh() {
		
		this.out = new Array(1000).fill(0);
		
		if(this.type=="empirical") {
			this.samples = new Array(this.out.length).fill(0).map((e,i)=>{
				
				let options = {
					scheme: this.scheme,
					n: this.n,
					d: this.d,
					p: this.p,
					J: this.J,
					a: this.a,
					f: this.f,
					x: i/(this.out.length-1)
				};
				
				options[plotAxes.x_axis.label] = lerp(plotAxes.x_axis.minval,plotAxes.x_axis.maxval,options.x);
				
				return new Experiment(options);
			});
		} else {
			this.samples = null;
			this.out.fill(null);
		}
		
	}
	
	refine() {
		let startTime = millis();
		for(let i=0;i<this.out.length;i++) {
		if(this.type=="empirical") {
			this.out[i] = this.samples[i].get({
				iterations: 10,
				y_axis: "R"
			});
		} else {
			if(this.out[i]==null) {
				
				let options = {
					scheme: this.scheme,
					n: this.n,
					d: this.d,
					p: this.p,
					J: this.J,
					a: this.a,
					f: this.f,
					x: i/(this.out.length-1)
				};
				
				options[plotAxes.x_axis.label] = lerp(plotAxes.x_axis.minval,plotAxes.x_axis.maxval,options.x);
				
				this.out[i] = new MarkovChainAnalysis(options).get();
				
				let elapsedTime = (millis()-startTime); // in milliseconds
				if(elapsedTime>20) {
					break;
				}
			}
		}
		}
	}
	
	draw(options) {
		noFill();
		stroke(this.color);
		beginShape();
		for(let i=0;i<this.out.length;i++) {
		if(this.out[i]!=null) {
			let x = i/(this.out.length-1)*options.w+options.x;
			let y = options.y+options.h*(1-this.out[i]);
			vertex(x,y);
		}
		}
		endShape();
	}
	
}

function drawGridFrame(options) {
	
	let xlines = floor(width/100);
	for(let i=0;i<xlines;i++) { 
		let offset = (i+1)/xlines*options.w;
		stroke(64);
		line(
			options.x+offset,
			options.y,
			options.x+offset,
			options.y+options.h);
		stroke(255);
		line(
			options.x+offset,
			options.y+options.h,
			options.x+offset,
			options.y+options.h+10);
		fill(255);
		noStroke();
		textAlign(CENTER,TOP);
		let coord = lerp(plotAxes.x_axis.minval,plotAxes.x_axis.maxval,(i+1)/xlines);
		let num = coord.toLocaleString('en-EN',{
			minimumFractionDigits:2,
			maximumFractionDigits:2});
		text(num,options.x+offset-3,options.y+options.h+15);
	}
	let ylines = floor(height/100);
	for(let i=0;i<ylines;i++) { 
		let offset = i/ylines*options.h;
		stroke(64);
		line(
			options.x,
			options.y+offset,
			options.x+options.w,
			options.y+offset);
		stroke(255);
		line(
			options.x,
			options.y+offset,
			options.x-10,
			options.y+offset);
		fill(255);
		noStroke();
		textAlign(RIGHT,CENTER);
		let coord = lerp(plotAxes.y_axis.minval,plotAxes.y_axis.maxval,1-i/ylines);
		let num = coord.toLocaleString('en-EN',{
			minimumFractionDigits:2,
			maximumFractionDigits:2});
		text(num,options.x-15,options.y+offset+1)
	}
	
	stroke(255); line(
		options.x,
		options.y,
		options.x,
		options.y+options.h);
	stroke(255); line(
		options.x,
		options.y+options.h,
		options.x+options.w,
		options.y+options.h);
	
}

function drawAxes(options) {
	fill(255);
	stroke(0);
	
	textAlign(CENTER,TOP);
	text($("select[name='x_axis'] option:selected").text(),options.x+options.w/2,options.y+options.h+40);
	push();
	textAlign(CENTER,BOTTOM);
	translate(options.x-60,options.y+options.h/2);
	rotate(-HALF_PI);
	text($("select[name='y_axis'] option:selected").text(),0,0);
	pop();
}

function drawPlots() {
	let windowWidth = width;
	let plotX = 0;
	if($("#controls .toggle").data("active")==true) {
		windowWidth -= 350;
		plotX += 350;
	}
	if($("#info .toggle").data("active")==true) {
		windowWidth -= 500;
	}
	let plotWidth = windowWidth-200;
	let plotHeight = height-200;
	let frame = {
		x: (windowWidth-plotWidth)/2.+plotX,
		y: (height-plotHeight)/2.,
		w: plotWidth,
		h: plotHeight
	};
	drawGridFrame(frame);
	drawAxes(frame);
	for(let plot of plots) {
		plot.refine();
		plot.draw(frame);
	}
}

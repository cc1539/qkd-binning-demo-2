
let plots = [];

function h(p,t) {
	return (p>0 && p<1)?((-p*log(p)-(1-p)*log(1-p))/log(2)*(sin(frameCount*.1+p*10+t*.1)*.5+.5)):0;
}

class Experiment {
	
	// put this in a better place later
	static JitterChannel = class {
		
		constructor(J) {
			this.queue = [];
			this.J = J;
		}
		
		put(bit) {
			if(bit) {
				this.queue.push(1+(Math.random()<this.J?(Math.random()<.5?1:-1):0));
			}
		}
		
		get() {
			let out = false;
			for(let i=this.queue.length-1;i>=0;i--) {
				if(this.queue[i]==0) {
					out = true;
					this.queue.splice(i,1);
				} else {
					this.queue[i]--;
				}
			}
			return out;
		}
		
	}
	
	static ErrorCorrectionChannel = class {
		
		constructor(type,blockSize,symbolSize) {
			
			this.type = type;
			
			this.blockSize = blockSize;
			this.symbolSize = symbolSize;
			this.queueSize = blockSize*symbolSize;
			
			this.queueA = [];
			this.queueB = [];
			
			this.outputA = [];
			this.outputB = [];
			
			this.leaked = [];
		}
		
		putA(bit) {
			this.queueA.push(bit);
		}
		
		putB(bit) {
			this.queueB.push(bit);
		}
		
		ready() {
			return this.queueA.length>=this.queueSize;
		}
		
		replaceUndefined() {
			this.queueA = this.queueA.map(e=>e==undefined?false:e);
			this.queueB = this.queueB.map(e=>e==undefined?false:e);
		}
		
		hasUndefined() {
			for(let i=0;i<this.queueA.length;i++) {
			if(this.queueA[i]==undefined) {
				return true;
			}
			}
			for(let i=0;i<this.queueB.length;i++) {
			if(this.queueB[i]==undefined) {
				return true;
			}
			}
		}
		
		process() {
			if(this.ready()) {
				this.outputA = this.queueA; // channel a is unchanged
				
				switch(this.type) {
					case "hamming":
						
						// fix single bit flip
						this.replaceUndefined();
						let parity_a = this.queueA.map((e,i)=>e?i:0).reduce((a,b)=>a^b);
						let parity_b = this.queueB.map((e,i)=>e?i:0).reduce((a,b)=>a^b);
						let error_location = parity_b^parity_a;
						this.queueB[error_location] ^= true;
						this.outputB = this.queueB.splice(0,this.queueB.length);
						
					break;
					case "jitter":
						
						// fix jitters of one unit
						if(this.hasUndefined()) {
							this.outputA = [];
							this.outputB = [];
						} else {
							let a = bin2int(this.queueA);
							let b = bin2int(this.queueB);
							while(Math.abs(a-b)>1) {
								if(a<b) {
									a += 2;
								} else {
									a -= 2;
								}
							}
							for(let i=0;i<this.queueB.length;i++) {
								this.outputB[i] = (a&(1<<i))!=0;
							}
						}
						
					break;
					case "ldpc":
						
						// assume 5% of bit flips are fixed
						// assume 30% of erasures are fixed
						for(let i=0;i<this.queueA.length;i++) {
							if(this.queueA[i]!=this.queueB[i]) {
								let correction_probability = 0.05;
								if(this.queueA[i]==undefined || this.queueB[i]==undefined) {
									correction_probability = 0.3;
								}
								if(Math.random()>correction_probability) {
									this.outputB[i] = !this.queueA[i];
								} else {
									this.outputB[i] = this.queueA[i];
								}
							} else {
								this.outputB[i] = this.queueA[i];
							}
						}
						
					break;
					case "rs":
						let errors = 0;
						for(let i=0;i<this.queueSize;i+=this.symbolSize) {
							let errored = false;
							for(let j=0;j<this.symbolSize;j++) {
							if(this.queueA[i+j]!=this.queueB[i+j]) {
								errored = true;
								break;
							}
							}
							if(errored) {
								errors++;
								if(errors>this.blockSize/2) {
									break;
								}
							}
						}
						if(errors>this.blockSize/2) {
							
							// for now, assume complete error
							for(let i=0;i<this.queueA.length;i++) {
								this.outputB[i] = !this.queueA[i];
							}
							
						} else {
							
							// assume complete correction
							for(let i=0;i<this.queueA.length;i++) {
								this.outputB[i] = this.queueA[i];
							}
							
						}
					break;
				}
				this.queueA = [];
				this.queueB = [];
			}
		}
		
	}
	
	constructor(options) {
		
		this.scheme = options.scheme; // as text
		this.n = Math.ceil(options.n);
		this.d = Math.ceil(options.d);
		this.p = options.p;
		this.J = options.J;
		this.a = options.a;
		this.f = options.f;
		
		// error correction
		this.errorc = options.errorc;
		this.blockSize = options.B | 3;
		this.symbolSize = options.S | 1;
		
		// bins
		this.bin_a = new BinningScheme();
		this.bin_a.setSchemeType(binTypes[this.scheme]);
		this.bin_a.setSchemeCount(1);
		this.bin_a.setBinSize(1);
		this.bin_a.setFrameSize(this.n);
		this.bin_a.setDeadTime(this.d);
		this.bin_a.getAnalysis().setLetterSize(1<<this.n);
		
		this.bin_b = new BinningScheme();
		this.bin_b.setSchemeType(binTypes[this.scheme]);
		this.bin_b.setSchemeCount(1);
		this.bin_b.setBinSize(1);
		this.bin_b.setFrameSize(this.n);
		this.bin_b.setDeadTime(this.d);
		this.bin_b.getAnalysis().setLetterSize(1<<this.n);
		
		this.errors = 0;
		this.counts = 0;
	}
	
	get(options) {
		
		let channel_a = new Experiment.JitterChannel(this.J);
		let channel_b = new Experiment.JitterChannel(this.J);
		
		let ec_channel = new Experiment.ErrorCorrectionChannel(
				this.errorc,
				this.blockSize,
				this.symbolSize);
		
		// flush out the jitter channel
		for(let t=0;t<3;t++) {
			
			let bit = Math.random()<this.p;
			
			let bit_a = bit;
			if(bit_a && Math.random()<this.a) {
				bit_a = false;
			}
			if(!bit_a && Math.random()<this.f) {
				bit_a = true;
			}
			
			let bit_b = bit;
			if(bit_b && Math.random()<this.a) {
				bit_b = false;
			}
			if(!bit_b && Math.random()<this.f) {
				bit_b = true;
			}
			
			channel_a.put(bit_a);
			channel_b.put(bit_b);
			
			bit_a = channel_a.get();
			bit_b = channel_b.get();
			
		}
		
		let iterations = options.iterations;
		let y_axis = options.y_axis;
		for(let t=0;t<iterations;t++) {
			
			let bit = Math.random()<this.p;
			let noerrors = this.a==0 && this.f==0 && this.J==0;
			
			if(noerrors) {
				// no errors
				
				this.bin_a.write(bit);
				this.counts = 1;
				
				continue;
			}
			
			let bit_a = bit;
			if(bit_a && Math.random()<this.a) {
				bit_a = false;
			}
			if(!bit_a && Math.random()<this.f) {
				bit_a = true;
			}
			
			let bit_b = bit;
			if(bit_b && Math.random()<this.a) {
				bit_b = false;
			}
			if(!bit_b && Math.random()<this.f) {
				bit_b = true;
			}
			
			if(!noerrors) {
				
				channel_a.put(bit_a);
				channel_b.put(bit_b);
				
				bit_a = channel_a.get();
				bit_b = channel_b.get();
			}
			
			this.bin_a.write(bit_a);
			this.bin_b.write(bit_b);
			
			while(this.bin_a.output.ready() || this.bin_b.output.ready()) {
				
				let out_a = this.bin_a.output.read();
				let out_b = this.bin_b.output.read();
				
				if(this.errorc=="none") {
					
					if(out_a!=out_b) {
						this.errors++;
					}
					this.counts++;
					
				} else {
					
					ec_channel.putA(out_a);
					ec_channel.putB(out_b);
					
					if(ec_channel.ready()) {
						ec_channel.process();
						for(let i=0;i<ec_channel.outputA.length;i++) {
							let out_a = ec_channel.outputA[i];
							let out_b = ec_channel.outputB[i];
							if(out_a!=out_b) {
								this.errors++;
							}
							this.counts++;
						}
					}
					
				}
				
			}
			
		}
		switch(plotAxes.y_axis.label) {
			case "R": { return this.bin_a.getRawKeyRate()*(1-this.errors/this.counts); }
			case "H": {
				return this.bin_a.getAnalysis().getMarkovChainEntropy();
				//return this.bin.getAnalysis().getRandomness();
			}
			case "Pe": { // probability of error
				return this.errors/this.counts;
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
		
		["scheme","type","errorc","color"].concat("ndpJafBS".split('')).forEach(e=>{
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
		$(this.controls).find("select[name='errorc']").val(this.errorc);
		$(this.controls).find("input[type='color']").val(this.color);
		"ndpJafBS".split('').forEach(e=>{
			$(this.controls).find("input[name='"+e+"']").val(this[e]);
		});
		
	}
	
	refresh() {
		
		this.out = new Array(400).fill(0);
		
		if(this.type=="empirical") {
			this.samples = new Array(this.out.length).fill(0).map((e,i)=>{
				
				let options = {
					scheme: this.scheme,
					errorc: this.errorc,
					n: this.n,
					d: this.d,
					p: this.p,
					J: this.J,
					a: this.a,
					f: this.f,
					B: this.B,
					S: this.S,
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
		if(this.type=="empirical") {
			if(typeof this.index!="number") {
				this.index = 0;
			}
			while(true) {
				let errors = this.a>0 || this.f>0 || this.J>0;
				this.out[this.index] = this.samples[this.index].get({
					iterations: 100
					//y_axis: "R"
				});
				this.index++;
				if(this.index>=this.out.length) {
					this.index = 0;
				}
				
				let elapsedTime = (millis()-startTime); // in milliseconds
				if(elapsedTime>20) {
					break;
				}
				
			}
		} else {
			for(let i=0;i<this.out.length;i++) {
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

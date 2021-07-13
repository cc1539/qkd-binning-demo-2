
let plots = [];

function h(p,t) {
	return (p>0 && p<1)?((-p*log(p)-(1-p)*log(1-p))/log(2)*(sin(frameCount*.1+p*10+t*.1)*.5+.5)):0;
}

class Experiment {
	
	constructor(options) {
		
		this.x_axis = options.x_axis || {label:"p",minval:0,maxval:1};
		options[plotAxes.x_axis.label] = options.x*(this.x_axis.maxval-this.x_axis.minval)+this.x_axis.minval;
		
		//console.log(options);
		
		this.scheme = options.scheme || "sb";
		this.n = options.n || 8;
		this.d = options.d || 0;
		this.p = options.p || 0;
		this.J = options.J || .01;
		this.a = options.a || .01;
		this.f = options.f || .01;
		
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
		return this.bin.getRawKeyRate(); // todo: should depend on y_axis
	}
	
}

class MarkovChainAnalysis {
	
	constructor(options) {
		let tbmc = new TimeBinningMarkovChain(options.n,options.d,binTypes[options.scheme]);
		
	}
	
}

class Plot {
	
	update(options) {
		this.scheme = options.scheme || this.scheme;
		this.type   = options.type   || this.type;
		this.color  = options.color  || this.color;
		this.n = options.n | this.n;
		this.d = options.d | this.d;
		this.p = options.p | this.p;
		this.J = options.J | this.J;
		this.a = options.a | this.a;
		this.f = options.f | this.f;
		
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
				return new Experiment({
					scheme: this.scheme,
					type: this.type,
					n: this.n,
					d: this.d,
					p: this.p,
					J: this.J,
					a: this.a,
					f: this.f,
					x_axis: plotAxes.x_axis,
					x: i/(this.out.length-1)
				});
			});
		} else {
			this.samples = null;
		}
		
	}
	
	refine() {
		for(let i=0;i<this.out.length;i++) {
		if(this.type=="empirical") {
			this.out[i] = this.samples[i].get({
				iterations: 10,
				y_axis: "R"
			});
		} else {
			if(this.out[i]==null) {
				let p = i/(this.out.length-1);
				//this.out[i] = h(p,this.n)*(1-noise(i*.2+frameCount*.1)*.1);
				this.out[i] = new MarkovChainAnalysis(this);
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
		let num = ((i+1)/xlines).toLocaleString('en-EN',{
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
		let num = (1-i/ylines).toLocaleString('en-EN',{
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

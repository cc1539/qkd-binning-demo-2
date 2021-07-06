
let plots = [];

function h(p,t) {
	return (p>0 && p<1)?((-p*log(p)-(1-p)*log(1-p))/log(2)*(sin(frameCount*.1+p*10+t*.1)*.5+.5)):0;
}

class Experiment {
	
	constructor(options) {
		this.scheme = options.scheme || "sb";
		this.n = options.n || 8;
		this.d = options.d || 0;
		this.J = options.J || .01;
		this.a = options.a || .01;
		this.f = options.f || .01;
		
		this.x_axis = options.x_axis || {label:"p",minval:0,maxval:1};
		this.p = plotAxes.x_axis.label=="p"?options.p:.1;
		this.x = options.p*(this.x_axis.maxval-this.x_axis.minval)+this.x_axis.minval;
		
		this.bin = new BinningScheme();
		this.bin.setSchemeType(binTypes[this.scheme]);
		this.bin.setSchemeCount(1);
		this.bin.setBinSize(1);
		this.bin.setFrameSize(this.x_axis.label=="n"?Math.ceil(this.x):this.n);
		this.bin.setDeadTime(this.x_axis.label=="d"?Math.ceil(this.x):this.d);
	}
	
	get(options) {
		let iterations = options.iterations;
		let y_axis = options.y_axis;
		for(let t=0;t<iterations;t++) {
			let bit = Math.random()<(this.x_axis.label=="p"?this.x:this.p);
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
	
}

class Plot {
	
	update(options) {
		this.scheme = options.scheme || this.scheme;
		this.type   = options.type   || this.type;
		this.color  = options.color  || this.color;
		this.n = options.n || this.n;
		this.d = options.d || this.d;
		this.J = options.J || this.J;
		this.a = options.a || this.a;
		this.f = options.f || this.f;
		this.out = new Array(1000).fill(0);
		
		if(this.type=="empirical") {
			this.samples = new Array(this.out.length).fill(0).map((e,i)=>{
				return new Experiment({
					scheme: this.scheme,
					type: this.type,
					n: this.n,
					d: this.d,
					J: this.J,
					a: this.a,
					f: this.f,
					x_axis: plotAxes.x_axis,
					p: i/(this.out.length-1)
				});
			});
		} else {
			this.samples = null;
		}
		
		return this;
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
				this.out[i] = new MarkovChainAnalysis(
				);
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
	for(let plot of plots) {
		plot.refine();
		plot.draw(frame);
	}
}

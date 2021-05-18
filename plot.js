
let plots = [];

function h(p,t) {
	return (p>0 && p<1)?((-p*log(p)-(1-p)*log(1-p))/log(2)*(sin(frameCount*.1+p*10+t*.1)*.5+.5)):0;
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
		return this;
	}
	
	refine() {
		for(let i=0;i<this.out.length;i++) {
			let p = i/(this.out.length-1);
			this.out[i] = h(p,this.n)*(1-noise(i*.2+frameCount*.1)*.1);
		}
	}
	
	draw(options) {
		noFill();
		stroke(this.color);
		beginShape();
		for(let i=0;i<this.out.length;i++) {
			let x = i/(this.out.length-1)*options.w+options.x;
			let y = options.y+options.h*(1-this.out[i]);
			vertex(x,y);
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
	let plotWidth = width-200;
	let plotHeight = height-200;
	let frame = {
		x: (width-plotWidth)/2.,
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

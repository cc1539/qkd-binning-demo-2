
let plots = [];

function h(p,t) {
	return (p>0 && p<1)?((-p*log(p)-(1-p)*log(1-p))/log(2)*(sin(frameCount*.1+p*10+t*.1)*.5+.5)):0;
}

function drawGridFrame(options) {
	
	let xlines = floor(width/100);
	for(let i=0;i<xlines;i++) { 
		let offset = (i+1)/xlines*options.w;
		stroke(lerpColor(plotColors.bg,plotColors.fg,.25));
		line(
			options.x+offset,
			options.y,
			options.x+offset,
			options.y+options.h);
		stroke(plotColors.fg);
		line(
			options.x+offset,
			options.y+options.h,
			options.x+offset,
			options.y+options.h+10);
		fill(plotColors.fg);
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
		stroke(lerpColor(plotColors.bg,plotColors.fg,.25));
		line(
			options.x,
			options.y+offset,
			options.x+options.w,
			options.y+offset);
		stroke(plotColors.fg);
		line(
			options.x,
			options.y+offset,
			options.x-10,
			options.y+offset);
		fill(plotColors.fg);
		noStroke();
		textAlign(RIGHT,CENTER);
		let coord = lerp(plotAxes.y_axis.minval,plotAxes.y_axis.maxval,1-i/ylines);
		let num = coord.toLocaleString('en-EN',{
			minimumFractionDigits:2,
			maximumFractionDigits:2});
		text(num,options.x-15,options.y+offset+1)
	}
	
	stroke(plotColors.fg); line(
		options.x,
		options.y,
		options.x,
		options.y+options.h);
	stroke(plotColors.fg); line(
		options.x,
		options.y+options.h,
		options.x+options.w,
		options.y+options.h);
	
}

function drawAxes(options) {
	fill(plotColors.fg);
	stroke(plotColors.bg);
	
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

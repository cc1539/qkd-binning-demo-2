
var plotPalette;

var binTypes = {
	"sb": SimpleBinning.prototype,
	"ab": AdaptiveBinning.prototype,
	"aab": AdaptiveAggregatedBinning.prototype,
	"af": AdaptiveFraming.prototype
}

var plotAxes = {
	x_axis: {
		label: "p",
		minval: 0,
		maxval: 1
	},
	y_axis: {
		label: "R",
		minval: 0,
		maxval: 1
	}
};

function setup() {
	
	plotPalette = [
		color(255,0,0),
		color(0,255,0),
		color(0,0,255),
		color(255,255,0),
		color(255,0,255),
		color(0,255,255),
		color(255,128,0),
		color(128,255,0),
		color(0,255,128),
		color(0,128,255),
		color(128,0,255),
		color(255,0,128)
	];
	
	createCanvas(windowWidth,windowHeight);
	$("#canvas").append($("#defaultCanvas0"));
	textFont("source code pro");
	
	// TOGGLES FOR INFO AND CONTROLS ################################
	let setupToggle = (id,w)=>{
		$("#"+id+" .toggle").data("active",true);
		let toggleInfo = ()=>{
			if($("#"+id+" .toggle").data("active")==true) {
				$("#"+id+" .content").hide();
				$("#"+id).animate({width:"0px"},{duration:1});
				$("#"+id+" .toggle").data("active",false);
			} else {
				$("#"+id).animate({width:min(width-50,w)+"px"},{
					duration:1,
					done:()=>{$("#"+id+" .content").show();}
				});
				$("#"+id+" .toggle").data("active",true);
			}
			$("#info").css("z-index",1);
			$("#controls").css("z-index",1);
			$("#"+id).css("z-index",2);
		};
		$("#"+id+" .toggle").click(toggleInfo);
		toggleInfo();
		$("#"+id).css("z-index",1);
	};
	
	setupToggle("info",500);
	setupToggle("controls",350);
	
	// PLOT CONTROLS ################################################
	$(".plot-control").first().hide();
	let addPlot = pc=>{
		let plot = new Plot();
		pc.show();
		$("#controls .content").append(pc);
		let titlebar = $(pc).find(".titlebar");
		$(titlebar).click(()=>{
			$(titlebar).parent().find(".controls").toggle();
		});
		$(titlebar).find("input").click(e=>{
			e.stopPropagation();
		});
		$(titlebar).find(".del").click(e=>{
			e.stopPropagation();
			$(titlebar).parent().remove();
			for(let i=0;i<plots.length;i++) {
			if(plots[i]==plot) {
				plots.splice(i,1);
				break;
			}
			}
		});
		$(titlebar).find(".dup").click(e=>{
			e.stopPropagation();
			addPlot($(titlebar).parent().clone());
		});
		
		let color = plotPalette[floor(random(0,plotPalette.length))];
		let hexcolor = "#"
			+(color.levels[0].toString(16).padStart(2,'0'))
			+(color.levels[1].toString(16).padStart(2,'0'))
			+(color.levels[2].toString(16).padStart(2,'0'));
		$(titlebar).find("input[type='color']").val(hexcolor);
		$(titlebar).find("input[type='color']").on("input",function(){
			plot.update({color:$(this).val()});
		});
		
		"ndJaf".split('').forEach(e=>{
			let inputs = $(pc).find("input[name='"+e+"']");
			inputs.eq(1).val(inputs.eq(0).val());
			inputs.on("input",function(){
				inputs.val($(this).val());
				let options = {};
				options[e] = $(this).val();
				plot.update(options);
			});
		});
		$(pc).find("select[name='scheme']").on("change",function(){
			plot.update({scheme:$(this).val()});
		});
		$(pc).find("select[name='sim']").on("change",function(){
			plot.update({type:$(this).val()});
		});
		
		plots.push(plot.update({
			scheme: "sb",
			type: "empirical",
			color: $(titlebar).find("input[type='color']").val(),
			n: 8,
			d: 0,
			J: 0.01,
			a: 0.01,
			f: 0.01
		}));
	};
	$(".add-plot-button").click(()=>{
		addPlot($(".plot-control").first().clone());
	});
	
	
	// axis controls
	$(".axis-controls select[name='x_axis']").on("change",function(){
		plotAxes.x_axis.label = $(this).val();
	});
	$(".axis-controls input[name='x_axis_min']").on("change",function(){
		plotAxes.x_axis.minval = $(this).val();
	});
	$(".axis-controls input[name='x_axis_max']").on("change",function(){
		plotAxes.x_axis.maxval = $(this).val();
	});
	$(".axis-controls select[name='y_axis']").on("change",function(){
		plotAxes.y_axis.label = $(this).val();
	});
	$(".axis-controls input[name='y_axis_min']").on("change",function(){
		plotAxes.y_axis.minval = $(this).val();
	});
	$(".axis-controls input[name='y_axis_max']").on("change",function(){
		plotAxes.y_axis.maxval = $(this).val();
	});
	
}

function windowResized() {
	resizeCanvas(windowWidth,windowHeight);
}

function draw() {
	background(0);
	
	stroke(32);
	for(let i=0;i<width;i+=100) {
		line(i,0,i,height);
	}
	for(let i=0;i<height;i+=100) {
		line(0,i,width,i);
	}
	
	drawPlots();
}


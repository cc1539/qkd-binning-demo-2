
function setup() {
	createCanvas(windowWidth,windowHeight);
	$("#canvas").append($("#defaultCanvas0"));
	
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
		});
		$(titlebar).find(".dup").click(e=>{
			e.stopPropagation();
			addPlot($(titlebar).parent().clone());
		});
	};
	$(".add-plot-button").click(()=>{
		addPlot($(".plot-control").first().clone());
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
}

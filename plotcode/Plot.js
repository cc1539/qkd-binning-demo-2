
class Plot {
	
	update(options) {
		
		["scheme","type","errorc","color"].concat("ndpJafBS".split('')).forEach(e=>{
			if(options[e]!=null) {
				this[e] = options[e];
			}
		});
		
		$(this.controls).find(".titlebar p:nth-child(2)").text(
			$(this.controls).find("select[name='scheme'] option[value='"+this.scheme+"']").text());
		
		let num_update = false;
		
		for(let option in options) {
		if(option!="color") {
			num_update = true;
			break;
		}
		}
		
		if(num_update) {
			this.refresh();
		}
		
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
					x: i/(this.out.length-1)
				};
				"ndpJafBS".split("").forEach(n=>(options[n]=this[n]));
				
				options[plotAxes.x_axis.label] = lerp(
						plotAxes.x_axis.minval,
						plotAxes.x_axis.maxval,
						options.x);
				
				return new Experiment(options);
			});
		} else if(this.type=="analytical") {
			this.samples = null;
			this.out.fill(null);
			this.analytical_scale = 1;
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
					iterations: 100,
					request: plotAxes.y_axis.label
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
		} else if(this.type=="analytical") {
			
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
					x: i/(this.out.length-1),
					label: plotAxes.y_axis.label
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

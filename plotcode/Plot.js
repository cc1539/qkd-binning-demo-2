
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
	
	optionsSame(a,b) {
		return ["scheme","type","errorc"].concat("ndpJafBS".split('')).map(e=>a[e]==b[e]).reduce((a,b)=>a&&b,true);
	}
	
	refresh() {
		
		this.out = new Array(400).fill(0);
		this.opt = new Array(this.out.length).fill(0).map((e,i)=>{
			
			let options = {
				scheme: this.scheme,
				errorc: this.errorc,
				x: i/(this.out.length-1),
				label: plotAxes.y_axis.label
			};
			"ndpJafBS".split("").forEach(n=>(options[n]=this[n]));
			
			if(plotAxes.x_axis.label=="k") {
				// change n and p to simulate bin # of frame increasing 
				// while frame width stays constant
				// the given p is for when a frame consists of a single bin
				// p should go down
				
				let dn_ratio = options.d/options.n;
				
				options.n = lerp(
						plotAxes.x_axis.minval,
						plotAxes.x_axis.maxval,
						options.x);
				options.n = Math.floor(options.n);
				options.d = Math.floor(options.n*dn_ratio);
				// p = 1-exp(-L*k)
				// -ln(1-p) = L*k
				// L = stays the same
				// k = 1/options.n
				
				//options.p = 1-exp(ln(1-p)/options.n);
				options.p = 1-Math.pow(1-options.p,1/options.n);
				
			} else {
				options[plotAxes.x_axis.label] = lerp(
						plotAxes.x_axis.minval,
						plotAxes.x_axis.maxval,
						options.x);
						
				if("ndBS".includes(plotAxes.x_axis.label)) {
					options[plotAxes.x_axis.label] = Math.floor(options[plotAxes.x_axis.label]);
				}
			}
			
			return options;
		});
		for(let i=this.opt.length-2;i>0;i--) {
		if(this.optionsSame(this.opt[i],this.opt[i-1])) {
			this.opt[i] = null;
		}
		}
		
		if(this.type=="empirical") {
			this.samples = new Array(this.out.length).fill(0).map((e,i)=>{
				return this.opt[i]==null?null:new Experiment(this.opt[i]);
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
				if(this.samples[this.index]!=null) {
					this.out[this.index] = this.samples[this.index].get({
						iterations: 100,
						request: plotAxes.y_axis.label
					});
				} else {
					this.out[this.index] = NaN;
				}
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
			
			for(let k=Math.floor(this.out.length/2)-1;k>=1;k=Math.floor(k/2)) {
				for(let i=0;i<this.out.length;i+=k) {
				if(this.out[i]==null && this.opt[i]!=null) {
					
					this.out[i] = new MarkovChainAnalysis(this.opt[i]).get();
					
					let elapsedTime = (millis()-startTime); // in milliseconds
					if(elapsedTime>20) {
						return;
					}
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

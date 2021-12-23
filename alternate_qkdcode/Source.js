
Module.Source = class extends Module {
	
	static Exponential = class extends Module {
		
		constructor(lambda) {
			super();
			this.lambda = lambda || 1; // 1/mean in ps
			this.timestamp = 0; // in ps
		}
		
		sample() {
			return -Math.log(1-Math.random())/this.lambda;
		}
		
		pull() {
			this.timestamp += Math.ceil(this.sample());
			this.data_out.write(this.timestamp);
		}
		
	}
	
	static Geometric = class extends Module {
		
		constructor(p) {
			super();
			this.p = p || .1;
		}
		
		pull() {
			this.data_out.write(Math.random()<this.p);
		}
		
	}
	
}

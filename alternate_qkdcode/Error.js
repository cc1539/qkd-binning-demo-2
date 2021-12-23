
Module.Error = class extends Module {
	
	static Jitter = class extends Module {
		
		constructor(sigma) {
			super();
			this.sigma = sigma;
		}
		
		pull() {
			if(!this.request(1)) { return; }
			this.data_out.write(this.data_in.readall());
		}
		
	}
	
	static DownTime = class extends Module {
		
		constructor(d) {
			super();
			this.d = d;
			this.cooldown = 0;
		}
		
		pull() {
			if(!this.request(1)) { return; }
			while(this.input().available()>0) {
				let sample = this.input().read();
				if(typeof sample=="number") {
					if(this.cooldown>0) {
						
					}
				} else { // assume boolean
					if(this.cooldown>0) {
						this.cooldown--;
					} else {
						sample = false;
					}
					if(sample) {
						this.cooldown = this.d;
					}
					this.data_out.write(sample);
				}
			}
		}
		
	}
	
	static Absorption = class extends Module {
		
		constructor(p) {
			super();
			this.p = p;
		}
		
		pull() {
			if(!this.request(1)) { return; }
			this.data_out.write(this.data_in.readall());
		}
		
	}
	
	static DarkCounts = class extends Module {
		
		constructor(lambda) {
			super();
			this.lambda = lambda;
		}
		
		pull() {
			if(!this.request(1)) { return; }
			this.data_out.write(this.data_in.readall());
		}
		
	}
	
}

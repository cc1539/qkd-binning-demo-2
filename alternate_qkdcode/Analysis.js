
class Analysis {
	
	static Meter = class extends Module {
		
		constructor() {
			this.counts = 0;
		}
		
		fire() {
			if(!request(1)) {
				return;
			}
			this.counts += input().available();
			output().write(input().readall());
		}
		
	}
	
	constructor() {
		this.samples = 0;
		this.A = new Module();
		this.B = new Module();
		this.meters = [];
		this.counts = 0;
		this.errors = 0;
	}
	
	getAlice() {
		return this.A;
	}
	
	getBob() {
		return this.B;
	}
	
	getMeter() {
		let meter = new Module();
		this.meters.push(meter);
		return meter;
	}
	
	pull() {
		this.A.pull();
		this.B.pull();
		while(this.A.output().available()>0 || this.B.output().available()>0) {
			let bit_A = this.A.output().read();
			let bit_B = this.B.output().read();
			if(!(bit_A==undefined || bit_B==undefined)) {
				this.counts++;
			}
			if(bit_A!=bit_B) {
				this.errors++;
			}
		}
	}
	
}
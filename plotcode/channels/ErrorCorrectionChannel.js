
Experiment.ErrorCorrectionChannel = class {
	
	constructor(type,blockSize,symbolSize) {
		
		this.type = type;
		
		this.blockSize = blockSize;
		this.symbolSize = symbolSize;
		this.queueSize = blockSize*symbolSize;
		
		this.queueA = [];
		this.queueB = [];
		
		this.outputA = [];
		this.outputB = [];
		
		this.leaked = [];
	}
	
	putA(bit) {
		this.queueA.push(bit);
	}
	
	putB(bit) {
		this.queueB.push(bit);
	}
	
	ready() {
		return this.queueA.length>=this.queueSize;
	}
	
	replaceUndefined() {
		this.queueA = this.queueA.map(e=>e==undefined?false:e);
		this.queueB = this.queueB.map(e=>e==undefined?false:e);
	}
	
	hasUndefined() {
		for(let i=0;i<this.queueA.length;i++) {
		if(this.queueA[i]==undefined) {
			return true;
		}
		}
		for(let i=0;i<this.queueB.length;i++) {
		if(this.queueB[i]==undefined) {
			return true;
		}
		}
	}
	
	process() {
		if(this.ready()) {
			this.outputA = this.queueA; // channel a is unchanged
			
			switch(this.type) {
				case "hamming":
					
					// fix single bit flip
					this.replaceUndefined();
					let parity_a = this.queueA.map((e,i)=>e?i:0).reduce((a,b)=>a^b);
					let parity_b = this.queueB.map((e,i)=>e?i:0).reduce((a,b)=>a^b);
					let error_location = parity_b^parity_a;
					this.queueB[error_location] ^= true;
					this.outputB = this.queueB.splice(0,this.queueB.length);
					
				break;
				case "jitter":
					
					// fix jitters of one unit
					if(this.hasUndefined()) {
						this.outputA = [];
						this.outputB = [];
					} else {
						let a = bin2int(this.queueA);
						let b = bin2int(this.queueB);
						while(Math.abs(a-b)>1) {
							if(a<b) {
								a += 2;
							} else {
								a -= 2;
							}
						}
						for(let i=0;i<this.queueB.length;i++) {
							this.outputB[i] = (a&(1<<i))!=0;
						}
					}
					
				break;
				case "ldpc":
					
					// assume 5% of bit flips are fixed
					// assume 30% of erasures are fixed
					for(let i=0;i<this.queueA.length;i++) {
						if(this.queueA[i]!=this.queueB[i]) {
							let correction_probability = 0.05;
							if(this.queueA[i]==undefined || this.queueB[i]==undefined) {
								correction_probability = 0.3;
							}
							if(Math.random()>correction_probability) {
								this.outputB[i] = !this.queueA[i];
							} else {
								this.outputB[i] = this.queueA[i];
							}
						} else {
							this.outputB[i] = this.queueA[i];
						}
					}
					
				break;
				case "rs":
					let errors = 0;
					for(let i=0;i<this.queueSize;i+=this.symbolSize) {
						let errored = false;
						for(let j=0;j<this.symbolSize;j++) {
						if(this.queueA[i+j]!=this.queueB[i+j]) {
							errored = true;
							break;
						}
						}
						if(errored) {
							errors++;
							if(errors>this.blockSize/2) {
								break;
							}
						}
					}
					if(errors>this.blockSize/2) {
						
						// for now, assume complete error
						for(let i=0;i<this.queueA.length;i++) {
							this.outputB[i] = !this.queueA[i];
						}
						
					} else {
						
						// assume complete correction
						for(let i=0;i<this.queueA.length;i++) {
							this.outputB[i] = this.queueA[i];
						}
						
					}
				break;
			}
			this.queueA = [];
			this.queueB = [];
		}
	}
	
}

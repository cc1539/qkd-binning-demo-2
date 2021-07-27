
// low density parity check
Experiment.ErrorCorrectionChannel.LDPC = class extends Experiment.ErrorCorrectionChannel.ErrorCorrectingCode {
	
	constructor(queueA,queueB) {
		super(queueA,queueB);
	}
	
	process() {
		
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
		
	}
	
}

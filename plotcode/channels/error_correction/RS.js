
// reed-solomon
Experiment.ErrorCorrectionChannel.RS = class extends Experiment.ErrorCorrectionChannel.ErrorCorrectingCode {
	
	constructor(queueA,queueB) {
		super(queueA,queueB);
	}
	
	process() {
		
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
		
	}
	
}

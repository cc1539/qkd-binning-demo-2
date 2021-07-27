
// hamming code with grey coding
Experiment.ErrorCorrectionChannel.HwGC = class extends Experiment.ErrorCorrectionChannel.ErrorCorrectingCode {
	
	constructor(queueA,queueB) {
		super(queueA,queueB);
	}
	
	process() {
		
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
		
	}
	
}

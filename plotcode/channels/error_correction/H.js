
// hamming code
Experiment.ErrorCorrectionChannel.H = class extends Experiment.ErrorCorrectionChannel.ErrorCorrectingCode {
	
	constructor(queueA,queueB) {
		super(queueA,queueB);
	}
	
	process() {
		
		// fix single bit flip
		this.replaceUndefined();
		let parity_a = this.queueA.map((e,i)=>e?i:0).reduce((a,b)=>a^b);
		let parity_b = this.queueB.map((e,i)=>e?i:0).reduce((a,b)=>a^b);
		let error_location = parity_b^parity_a;
		this.queueB[error_location] ^= true;
		this.outputB = this.queueB.splice(0,this.queueB.length);
	}
	
}

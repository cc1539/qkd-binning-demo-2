
// hamming code with grey coding
Experiment.ErrorCorrectionChannel.HwGC = class extends Experiment.ErrorCorrectionChannel.ErrorCorrectingCode {
	
	constructor(queueA,queueB) {
		super(queueA,queueB);
	}
	
	bin2gray(n) {
		return n^(n>>1);
	}
	
	gray2bin(n) {
		let m = n;
		while(m!=0) {
			m >>= 1;
			n ^= m;
		}
		return n;
	}
	
	parity(bin) {
		return bin.map((e,i)=>e?(i+1):0).reduce((a,b)=>a^b,false);
	}
	
	int2bin(m,N) {
		let out = [];
		for(let i=0;i<N;i++) {
			out[i] = (m&(1<<i))!=0;
		}
		return out;
	}
	
	process() {
		
		/*
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
		*/
		
		this.replaceUndefined();
		let N = this.queueA.length;
		let a = this.int2bin(this.bin2gray(bin2int(this.queueA)),N);
		let b = this.int2bin(this.bin2gray(bin2int(this.queueB)),N);
		
		let parity_a = this.parity(a);
		let parity_b = this.parity(b);
		let error_location = (parity_b^parity_a)-1;
		if(error_location!=-1) {
			b[error_location] ^= true;
			this.outputB = this.int2bin(this.gray2bin(bin2int(b)),N);
		} else {
			this.outputB = this.queueB.splice(0,this.queueB.length);
		}
		
	}
	
}

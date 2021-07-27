
Experiment.ErrorCorrectionChannel = class {
	
	static ErrorCorrectingCode = class {
			
		constructor(queueA,queueB) {
			this.queueA = queueA;
			this.queueB = queueB;
			
			this.outputA = this.queueA;
			this.outputB = [];
		}
		
		replaceUndefined() {
			this.queueA = this.queueA.map(e=>e==undefined?false:e);
			this.queueB = this.queueB.map(e=>e==undefined?false:e);
		}
		
		hasUndefined() {
			let check = (a,b)=>(a==undefined||b==undefined?undefined:true);
			if(this.queueA.reduce(check)==undefined) { return true; }
			if(this.queueB.reduce(check)==undefined) { return true; }
			return false;
		}
		
	}
	
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
	
	process() {
		if(this.ready()) {
			this.outputA = this.queueA; // channel a is unchanged
			
			let codeMapping = {
				hamming: "H",
				jitter: "HwGC",
				ldpc: "LDPC",
				rs: "RS",
			}
			let code = new Experiment.ErrorCorrectionChannel[codeMapping[this.type]](this.queueA,this.queueB);
			code.process();
			this.outputA = code.outputA;
			this.outputB = code.outputB;
			
			// clear queue
			this.queueA = [];
			this.queueB = [];
		}
	}
	
}


class BinningScheme extends BitStream {
	
	constructor() {
		super();
		
		this.schemes = [];
		this.schemeClass = null;
		
		this.bitsIn = 0;
		this.bitsOut = 0;
		
		this.output = new BitStream();
		this.analysis = new RandomAnalysis();
	}
	
	getOutput() {
		return this.output;
	}
	
	getAnalysis() {
		return this.analysis;
	}
	
	setFrameSize(n) {
		this.schemes.forEach(scheme=>{
			scheme.n = n;
			scheme.getAnalysis().setLetterSize(log2(n));
		});
		this.getAnalysis().setLetterSize(log2(n));
		this.n = n;
	}
	
	setBinSize(k) {
		this.schemes.forEach(scheme=>{
			scheme.k = k;
		});
		this.k = k;
	}
	
	getRawKeyRate() {
		return this.bitsOut/this.bitsIn;
	}
	
	setDeadTime(e) {
		this.schemes.forEach(scheme=>{
			scheme.setDeadTime(e);
		});
		this.deadTime = e;
	}
	
	setDeadTimerCount(n) {
		this.schemes.forEach(scheme=>{
			scheme.deadTimers = Array(n).fill(0);
		});
	}
	
	setSchemeType(type) {
		this.schemeClass = type;
	}
	
	setSchemeCount(n) {
		this.schemes = Array(n).fill(0).map(scheme=>{
			scheme = new this.schemeClass.constructor();
			scheme.setFrameSize(this.n);
			scheme.setBinSize(this.k);
			scheme.setDeadTime(this.deadTime);
			return scheme;
		});
		this.setDeadTimerCount(1);
	}
	
	write(bit) {
		
		this.bitsIn++;
		
		// if we see a photon, select a detector
		let schemeIndex = bit?(this.schemes.length==1?0:Math.floor(Math.random()*this.schemes.length)):-1;
		this.schemes.forEach((x,i)=>{
			x.write(i==schemeIndex);
		});
		
		this.handleOutput();
	}
	
	handleOutput() {
		this.schemes.forEach(x=>{
			x.handleOutput();
			while(x.getOutput().ready()) {
				let bit = x.getOutput().read();
				this.output.write(bit);
				this.analysis.write(bit);
				this.bitsOut++;
			}
		});
	}
	
	clear() {
		super.clear();
		
		this.analysis.clear();
		this.output.clear();
		
		this.bitsIn = 0;
		this.bitsOut = 0;
		
		this.schemes.forEach(x=>{
			x.clear();
		});
	}
	
	getName() {
		return this.schemes[0].getName();
	}
	
}
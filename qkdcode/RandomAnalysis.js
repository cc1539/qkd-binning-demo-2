
class RandomAnalysis extends BitStream {
	
	constructor() {
		super();
		
		this.letterSize = 0;
		this.bins = null;
		
		this.lastBit = false;
		this.counts = 0;
		this.edges = 0;
		this.samples = 0;
	}
	
	setLetterSize(value) {
		this.letterSize = value;
		this.bins = Array(1<<value).fill(0); // 2^value
	}
	
	write(bit) {
		
		super.write(bit);
		
		if(bit) {
			this.counts++;
		}
		if(bit!=this.lastBit) {
			this.edges++;
			this.lastBit = bit;
		}
		this.samples++;
		
		if(this.length()>=this.letterSize) {
			this.bins[this.readInt(this.letterSize)]++;
		}
		
	}
	
	clear() {
		if(this.bins!=null) {
			this.bins.fill(0);
		}
		this.counts = 0;
		this.edges = 0;
		this.samples = 0;
		this.lastBit = false;
		super.clear();
	}
	
	getStatisticalRandomness() { // p
		return entropy(this.counts/this.samples);
	}
	
	getStructuralRandomness() { // uniformity
		return entropy(this.edges/this.samples);
	}
	
	getSymbolicRandomness() { // symbol-based entropy
		let letterSamples = this.samples/this.letterSize;
		let p = Array(this.bins.length).fill(0);
		for(let i=0;i<this.bins.length;i++) {
			p[i] = this.bins[i]/letterSamples;
		}
		return entropy(p,this.bins.length);
	}
	
	getSymbolicMinEntropy() {
		let letterSamples = this.samples/this.letterSize;
		let maxCount = 0;
		for(let i=0;i<this.bins.length;i++) {
			if(this.bins[i]>maxCount) {
				maxCount = this.bins[i];
			}
		}
		return -Math.log(maxCount/letterSamples)/Math.log(this.bins.length);
	}
	
	getRandomness() {
		return this.getStatisticalRandomness()*this.getStructuralRandomness()*this.getSymbolicMinEntropy();
	}
	
}
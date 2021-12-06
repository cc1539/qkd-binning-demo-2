
class RandomAnalysis extends BitStream {
	
	static MarkovChain = class {
		
		constructor() {
			this.states = [];
			this.weight = [];
			this.last_state = null;
			this.counts = 0;
		}
		
		addState(symbol) {
			let state = {};
			state.symbol = symbol;
			state.counts = 0;
			state.index = this.states.length;
			this.states.push(state);
			this.weight.push(new Array(this.states.length).fill(0));
			for(let i=0;i<this.states.length;i++) {
			for(let j=0;j<this.states.length;j++) {
				if(this.weight[i][j]==undefined) {
					this.weight[i][j] = 0;
				}
			}
			}
			return state;
		}
		
		getState(symbol) {
			for(let i=0;i<this.states.length;i++) {
			if(this.states[i].symbol==symbol) {
				return this.states[i];
			}
			}
			return null;
		}
		
		record(symbol) {
			//console.log("recorded symbol: "+symbol);
			let state = this.getState(symbol);
			if(state==null) {
				state = this.addState(symbol);
			}
			if(this.last_state!=null) {
				this.weight[this.last_state.index][state.index]++;
			}
			this.last_state = state;
			state.counts++;
			this.counts++;
		}
		
		entropy() {
			let ent = 0;
			for(let i=0;i<this.states.length;i++) {
				let p = this.states[i].counts/this.counts;
				let totalWeight = this.weight[i].reduce((a,b)=>a+b);
				let Hi = entropy(this.weight[i].map(e=>e/totalWeight),this.states.length);
				ent += p*Hi;
			}
			return ent;
		}
		
		
		/*
		constructor() {
			this.counts = 0;
			this.states = {};
			this.last_state = null;
		}
		
		addState(symbol) {
			let state = {};
			state.counts = 0;
			state.trans = {};
			this.states[symbol] = state;
			return state;
		}
		
		countTransition(symbol) {
			let count = this.last_state.trans[symbol];
			if(count==null) {
				count = 0;
			}
			count++;
			this.last_state.trans[symbol] = count;
			this.states[symbol].counts++;
		}
		
		record(symbol) {
			this.counts++;
			let state = this.states[symbol];
			if(state==null) {
				state = this.addState(symbol);
			}
			if(this.last_state!=null) {
				this.countTransition(symbol);
			}
			this.last_state = state;
		}
		
		entropy() {
			let out = 0;
			for(let symbol in this.states) {
				let state = this.states[symbol];
				let r = state.counts/this.counts; // stationary probability
				let h = 0;
				for(let tran_symbol in state.trans) {
					let f = state.trans[tran_symbol]/state.counts;
					h += f*Math.log(f);
				}
				out += h*r;
			}
			out /= -Math.log(this.counts);
			return out;
		}
		*/
		
	}
	
	constructor() {
		super();
		
		this.letterSize = 0;
		this.bins = null;
		
		this.lastBit = false;
		this.counts = 0;
		this.edges = 0;
		this.samples = 0;
		
		this.markovchain = new RandomAnalysis.MarkovChain();
	}
	
	setLetterSize(value) {
		this.letterSize = value;
		this.bins = Array(1<<value).fill(0); // 2^value
		this.markovchain = new RandomAnalysis.MarkovChain();
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
			let symbol = this.readInt(this.letterSize);
			this.markovchain.record(""+symbol);
			/*
			if(symbol>=8) {
				console.log("recording symbol: :"+symbol);
				console.log(this.letterSize);
			}
			*/
			this.bins[symbol]++;
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
	
	getMarkovChainEntropy() {
		return this.markovchain.entropy();
	}
	
}
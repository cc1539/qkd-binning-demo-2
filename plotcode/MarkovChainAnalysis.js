
class MarkovChainAnalysis {
	
	static chains = [];
	
	static getChain = (n,d,scheme)=>{
		
		for(let i=0;i<MarkovChainAnalysis.chains.length;i++) {
			let chain = MarkovChainAnalysis.chains[i];
			if(chain.n==n && chain.d==d && chain.scheme==scheme) {
				return chain;
			}
		}
		
		let tbmc = new TimeBinningMarkovChain(n,d,scheme);
		tbmc.n = n;
		tbmc.d = d;
		tbmc.scheme = scheme;
		MarkovChainAnalysis.chains.push(tbmc);
		
		let stateCount = tbmc.transitions.length;
		console.log("the markov chain has "+stateCount+" states");
		let noratestates = 0;
		for(let i=0;i<stateCount;i++) {
			if(tbmc.transitions[i].rate==0) {
				noratestates++;
			}
		}
		console.log("..."+noratestates+" of which do not give any key bits.");
		console.log("a speed-up of ~"+round(pow(stateCount/(stateCount-noratestates),2))+"x is in order");
		
		return tbmc;
	}
	
	constructor(options) {
		this.scheme = options.scheme;
		this.n = Math.ceil(options.n);
		this.d = Math.ceil(options.d);
		this.p = options.p;
		this.J = options.J;
		this.a = options.a;
		this.f = options.f;
		this.label = options.label;
		
		this.tbmc = MarkovChainAnalysis.getChain(this.n,this.d,binTypes[this.scheme]);
	}
	
	get() {
		let p = this.p*(1-this.a)+(1-this.p)*this.f;
		let old_label = this.label;
		let limit = this.tbmc.transition(p);
		let state = this.tbmc.stationaryFromMatrix(0,limit);
		switch(this.label) {
			case "Rf": { return this.getEntropyRate(limit,state); }
			case "H": { return this.getEntropyRatio(limit,state); }
			case "R": { return this.getBitRate(state); }
			case "Pe": { return 0; }
		}
	}
	
	getEntropyRatio(limit,state) {
		return this.tbmc.entropyFromMatrix(limit,state,true);
	}
	
	getBitRate(state) {
		return this.tbmc.keyrateFromState(state);
	}
	
	getEntropyRate(limit,state) {
		let ent = this.getEntropyRatio(limit,state);
		let key = this.getBitRate(state);
		return ent*key;
	}
	
}

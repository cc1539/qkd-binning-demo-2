
TimeBinningMarkovChain = class {
	
	constructor(n,d,scheme) {
		this.n = n;
		this.d = d;
		this.scheme = scheme;
		
		let states = [];
		
		// generate states
		for(let dl=0;dl<=d;dl++) {
			let _n = n-(dl==0?0:(d-dl+1));
			for(let dr=0;dr<=min(d,_n);dr++) {
				let _n_ = _n-dr;
				for(let i=0;i<=_n_/(d+1);i++) {
					let t = new TimeBinningMarkovChain.Transition();
					t.a = (dl>0?1:0)+i; // how many ones there are
					t.b = _n_-(d+1)*i; // how many zeros there are
					t.rate = scheme.getKeyRate(n,d,t,dl,dr);
					let state = new TimeBinningMarkovChain.State();
					state.t = t;
					state.dl = dl;
					state.dr = dr;
					
					t.factor = shuffleCount(i,t.b);
					states.push(state);
				}
			}
		}
		this.stateArray = states;
		
		// generate transition matrix
		this.matrix = [];
		
		this.transitions = [];
		for(let i=0;i<this.stateArray.length;i++) {
			let a = this.stateArray[i];
			this.transitions[i] = a.t;
			this.matrix[i] = Array(this.stateArray.length).fill(null);
			for(let j=0;j<this.stateArray.length;j++) {
				let b = this.stateArray[j];
				if(a.dl==b.dr) {
					this.matrix[i][j] = b.t;
				}
			}
		}
	}
	
	transition(p) {
		let out = LinAlg.array2d(this.matrix.length,this.matrix[0].length);
		for(let i=0;i<out.length;i++) {
		for(let j=0;j<out[0].length;j++) {
		  out[j][i] = this.matrix[i][j]==null?0:this.matrix[i][j].get(p);
		}
		}
		return out;
	}
	
	photonsInFrame(p) {
		let stat = this.stationaryFromP(0,p);
		let photons = 0;
		for(let i=0;i<stat.length;i++) {
		  photons += stat[i]*this.stateArray[i].t.a;
		  console.log("spends "+stat[i]+" being in state "+this.stateArray[i].t.a);
		}
		return photons;
	}
	
	stationaryFromMatrix(init,matrix) {
		
		let avgState = [];
		let samples = 0;
		
		// find stationary probability through brute force
		let state = LinAlg.row(Array(matrix.length).fill(0));
		let lastState = state;
		state[init][0] = 1;
		for(let i=0;i<256;i++) {
		  state = LinAlg.multiply(state,matrix);
		  let error = 0;
		  for(let j=0;j<state.length;j++) {
			error += abs(state[j][0]-lastState[j][0]);
			avgState[j] += state[j][0];
		  }
		  samples++;
		  if(error<1e-4) {
			break;
		  }
		  lastState = state;
		}
		return LinAlg.getrow(state,0);
	}
	
	stationaryFromP(init,p) {
		return this.stationaryFromMatrix(init,this.transition(p));
	}
	
	entropyFromState(p,modified) {
		let out = 0;
		let expandLen = 0;
		for(let i=0;i<p.length;i++) {
		  let weight = modified?this.stateArray[i].t.factor:1;
		  expandLen += weight;
		  out -= (p[i]>0&&p[i]<1)?(p[i]*log(p[i]/weight)):0;
		}
		return out/log(expandLen);
	}
	
	entropyFromP(p,modified) {
		let matrix = this.transition(p);
		let state = this.stationaryFromMatrix(0,matrix);
		return this.entropyFromMatrix(matrix,state,modified);
	}
	
	keyrateFromP(p) {
		let matrix = this.transition(p);
		let state = this.stationaryFromMatrix(0,matrix);
		return this.keyrateFromState(state);
	}
	
	entropyFromMatrix(matrix,state,modified) {
		return new OutputMarkovChain(this,matrix,state).getEntropyRatio();
	}
	
	mapWeight(station,has_output) {
		let out = 0;
		for(let i=0;i<station.length;i++) {
		if(has_output[i]) {
			out += station[i];
		}
		}
		return out;
	}
	
	applyMatrix(matrix,station) {
		let next_station = Array(matrix.length).fill(0);
		for(let i=0;i<matrix.length;i++) {
		for(let j=0;j<matrix.length;j++) {
			next_station[j] += station[i]*matrix[i][j];
		}
		}
		let sum = 0;
		for(let i=0;i<next_station.length;i++) {
			sum += next_station[i];
		}
		for(let i=0;i<next_station.length;i++) {
			station[i] = next_station[i]/sum;
		}
	}
	
	keyrateFromState(state) {
		let out = 0;
		for(let i=0;i<state.length;i++) {
		  out += state[i]*this.transitions[i].rate;
		}
		return out;
	}
	
	absorptionProbability(matrix,i,j,K) {
		
		// probability of going to state j without going to any of the states in vector K
		let state = Array(matrix.length).fill(0);
		state[i] = 1;
		let prob = 0;
		let factor = 1;
		for(let t=0;t<100;t++) {
		  
		  state = LinAlg.getrow(LinAlg.multiply(LinAlg.row(state),matrix),0);
		  
		  let absorbedj = 0;
		  let absorbedK = 0;
		  for(let k=0;k<state.length;k++) {
			if(K[k] && k!=j) {
			  absorbedK += state[k];
			} else if(k==j) {
			  absorbedj += state[k];
			}
		  }
		  let notabsorbed = 1-(absorbedK+absorbedj);
		  if(notabsorbed>0) {
			for(let k=0;k<state.length;k++) {
			  if(K[k] || k==j) {
				state[k] = 0;
			  } else {
				state[k] /= notabsorbed;
			  }
			}
		  }
		  if(absorbedj<1e-4) {
			break;
		  }
		  prob += absorbedj*factor;
		  factor *= notabsorbed;
		}
		return prob;
	}
	
}

TimeBinningMarkovChain.Transition = class {
	
	constructor() {
		this.a = 0;
		this.b = 0;
		this.factor = 1;
		this.rate = 0;
	}
	
	get(p) {
		return pow(p,this.a)*pow(1-p,this.b)*this.factor;
	}
	
	toString() {
		if(this.a>0 || this.b>0) {
			let str = "";
			if(this.factor!=1) {
				str += this.factor;
			}
			if(this.a>0) {
				str += "p";
				if(this.a>1) {
					str += "^";
					str += this.a;
				}
			}
			if(this.b>0) {
				str += "(1-p)";
				if(this.b>1) {
					str += "^";
					str += this.b;
				}
			}
			return str;
		}
		return "0";
	}
	
}

TimeBinningMarkovChain.State = class {
	
	constructor() {
		this.t = null;
		this.dl = 0;
		this.dr = 0;
	}
	
	toString() {
		return dl+" | "+t.toString()+" | "+dr;
	}
	
}

TimeBinningMarkovChain.permute = function(list,str,a,b,i,j) {
	if(i>0 || j>0) {
		if(i>0) { TimeBinningMarkovChain.permute(list,str+a,a,b,i-1,j); }
		if(j>0) { TimeBinningMarkovChain.permute(list,str+b,a,b,i,j-1); }
	} else {
		list.push(str);
	}
}
  
TimeBinningMarkovChain.generate = function(n,d,t,dl,dr) {
	let list = [];
	TimeBinningMarkovChain.permute(list,"","0".repeat(d)+"1","0",t.a-(dl>0?1:0),t.b);
	let head = (dl==0?"":"0".repeat(d-dl)+"1");
	let tail = "0".repeat(dr);
	for(let i=0;i<list.length;i++) {
		list[i] = head+list[i]+tail;
	}
	return list;
}
  
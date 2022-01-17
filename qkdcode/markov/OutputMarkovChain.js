
OutputMarkovChain = class {
	
	static State = class {
		
		constructor(symbol) {
			this.symbol = symbol;
			this.steady = 0;
		}
		
	}
	
	constructor(imc,matrix,state) {
		
		this.states = {};
		this.transitions = {};
		
		let has_output = []; // whether a particular state has output bits according to the binning scheme being used
		let output_states = []; // set of all the possible outputs from an individual frame
		let sequence_matrix = []; // shows which states map to which output states
		for(let i=0;i<imc.stateArray.length;i++) {
			let sequence = TimeBinningMarkovChain.generate(
				imc.n,imc.d,
				imc.stateArray[i].t,
				imc.stateArray[i].dl,
				imc.stateArray[i].dr);
			sequence_matrix[i] = [];
			has_output[i] = false;
			if(sequence.length>0) {
				for(let seq of sequence) {
					let output = imc.scheme.apply(seq);
					if(output.length>0) {
						has_output[i] = true;
						sequence_matrix[i].push(output);
						output_states[output] = [];
					}
				}
			}
		}
		
		// init states and begin init-ing transitions
		for(let symbol in output_states) {
			this.states[symbol] = new OutputMarkovChain.State(symbol);
			this.transitions[symbol] = {};
		}
		
		// init transitions
		for(let a in output_states) {
		for(let b in output_states) {
			this.transitions[a][b] = 0;
		}
		}
		
		// find relevant stationary probabilities
		let output_station = [];
		{
			let output_sum = 0;
			for(let i=0;i<state.length;i++) {
				if(has_output[i]) {
					output_station[i] = state[i];
					output_sum += state[i];
				} else {
					output_station[i] = 0;
				}
			}
			for(let i=0;i<state.length;i++) {
				output_station[i] /= output_sum;
			}
		}
		
		// init alternate imc transition matrix
		let transition_matrix = [];
		for(let i=0;i<matrix.length;i++) {
			transition_matrix[i] = Array(matrix.length).fill(0);
			let sum = 0;
			for(let j=0;j<matrix.length;j++) {
				sum += matrix[j][i];
			}
			for(let j=0;j<matrix.length;j++) {
				transition_matrix[i][j] = matrix[j][i]/sum;
			}
		}
		
		// generate a matrix where for all has_output[i]==true, the state i transitions to itself
		let output_matrix = [];
		for(let i=0;i<matrix.length;i++) {
			output_matrix[i] = Array(matrix.length).fill(0);
			if(has_output[i]) {
				output_matrix[i][i] = 1;
			} else {
				for(let j=0;j<matrix.length;j++) {
					output_matrix[i][j] = transition_matrix[i][j];
				}
			}
		}
		
		let ent = 0; // entropy to be returned
		
		for(let i=0;i<imc.stateArray.length;i++) {
		if(has_output[i]) {
			
			let station = Array(imc.stateArray.length).fill(0);
			station[i] = 1;
			imc.applyMatrix(transition_matrix,station); // apply the regular transition matrix once...
			for(let t=0;t<1000;t++) {
				if(imc.mapWeight(station,has_output)>.99) {
					break;
				}
				imc.applyMatrix(output_matrix,station);
			}
			let sum = 0;
			for(let i=0;i<station.length;i++) {
				if(has_output[i]) {
					sum += station[i];
				} else {
					station[i] = 0;
				}
			}
			if(sum!=0) {
				for(let i=0;i<station.length;i++) {
					station[i] /= sum;
				}
			}
			
			let transitions = {};
			for(let output in output_states) {
				transitions[output] = 0;
			}
			for(let i=0;i<station.length;i++) {
			if(has_output[i]) {
				for(let j=0;j<sequence_matrix[i].length;j++) {
					transitions[sequence_matrix[i][j]] += station[i]/sequence_matrix[i].length;
				}
			}
			}
			
			let ent_i = 0;
			let transition_sum = 0;
			for(let i in transitions) {
				let transition = transitions[i];
				transition_sum += transition;
			}
			for(let i in transitions) {
				transitions[i] /= transition_sum;
			}
			
			for(let j=0;j<sequence_matrix[i].length;j++) {
				let symbol = sequence_matrix[i][j];
				this.states[symbol].steady += output_station[i];
				for(let other_symbol in transitions) {
					/*
					if(this.transitions[symbol][other_symbol]==null) {
						this.transitions[symbol][other_symbol] = 0;
					}
					*/
					this.transitions[symbol][other_symbol] += transitions[other_symbol];
				}
			}
		}
		}
		
		// normalize the steady state
		let steady_sum = 0;
		for(let symbol in this.states) {
			steady_sum += this.states[symbol].steady;
		}
		if(steady_sum!=0) {
			for(let symbol in this.states) {
				this.states[symbol].steady /= steady_sum;
			}
		}
		
		// normalize the transitions
		for(let symbol_i in this.transitions) {
			let sum = 0;
			for(let symbol_j in this.transitions[symbol_i]) {
				sum += this.transitions[symbol_i][symbol_j];
			}
			if(sum!=0) {
				for(let symbol_j in this.transitions[symbol_i]) {
					this.transitions[symbol_i][symbol_j] /= sum;
				}
			}
		}
		
		console.log(this.states);
		console.log(this.transitions);
	}
	
	getEntropyRatio() {
		let ent = 0;
		for(let symbol in this.states) {
			
			let state = this.states[symbol];
			let transitions = this.transitions[symbol];
			
			let ent_i = 0;
			for(let other_symbol in transitions) {
				let transition = transitions[other_symbol];
				if(transition>0) {
					ent_i += transition*log(transition);
				}
			}
			let transition_count = Object.keys(transitions).length;
			if(transition_count>0) {
				ent += -ent_i*state.steady;//log(transition_count);
			}
		}
		let state_count = Object.keys(this.states).length;
		return ent/log(state_count);
		//return ent;
	}
	
}

  

class Experiment {
	
	constructor(options) {
		
		this.scheme = options.scheme; // as text
		this.n = Math.ceil(options.n);
		this.d = Math.ceil(options.d);
		this.p = options.p;
		this.J = options.J;
		this.a = options.a;
		this.f = options.f;
		
		// error correction
		this.errorc = options.errorc;
		this.blockSize = options.B | 3;
		this.symbolSize = options.S | 1;
		
		// bins
		this.bin_a = new BinningScheme();
		this.bin_a.setSchemeType(binTypes[this.scheme]);
		this.bin_a.setSchemeCount(1);
		this.bin_a.setBinSize(1);
		this.bin_a.setFrameSize(this.n);
		this.bin_a.setDeadTime(this.d);
		this.bin_a.getAnalysis().setLetterSize(log2(this.n));
		
		this.bin_b = new BinningScheme();
		this.bin_b.setSchemeType(binTypes[this.scheme]);
		this.bin_b.setSchemeCount(1);
		this.bin_b.setBinSize(1);
		this.bin_b.setFrameSize(this.n);
		this.bin_b.setDeadTime(this.d);
		this.bin_b.getAnalysis().setLetterSize(log2(this.n));
		
		this.errors = 0;
		this.counts = 0;
	}
	
	get(options) {
		
		let channel_a = new Experiment.JitterChannel(this.J);
		let channel_b = new Experiment.JitterChannel(this.J);
		
		let ec_channel = new Experiment.ErrorCorrectionChannel(
				this.errorc,
				this.blockSize,
				this.symbolSize);
		
		// flush out the jitter channel
		for(let t=0;t<3;t++) {
			
			let bit = Math.random()<this.p;
			
			let bit_a = bit;
			if(bit_a && Math.random()<this.a) { bit_a = false; }
			if(!bit_a && Math.random()<this.f) { bit_a = true; }
			
			let bit_b = bit;
			if(bit_b && Math.random()<this.a) { bit_b = false; }
			if(!bit_b && Math.random()<this.f) { bit_b = true; }
			
			channel_a.put(bit_a);
			channel_b.put(bit_b);
			
			bit_a = channel_a.get();
			bit_b = channel_b.get();
			
		}
		
		let bit_output = [];
		const BITS_REQUEST = "bits";
		
		let iterations = options.iterations || 0;
		let y_axis = options.y_axis;
		for(let t=0;t<iterations || (options.request==BITS_REQUEST && bit_output.length<options.bitlen);t++) {
			
			let bit = Math.random()<this.p;
			let noerrors = this.a==0 && this.f==0 && this.J==0;
			
			if(noerrors) {
				// no errors
				
				this.bin_a.write(bit);
				this.counts = 1;
				
				if(options.request==BITS_REQUEST) {
					bit_output = bit_output.concat(this.bin_a.getOutput().readall());
				}
				
				continue;
			}
			
			let bit_a = bit;
			if(bit_a && Math.random()<this.a) { bit_a = false; }
			if(!bit_a && Math.random()<this.f) { bit_a = true; }
			
			let bit_b = bit;
			if(bit_b && Math.random()<this.a) { bit_b = false; }
			if(!bit_b && Math.random()<this.f) { bit_b = true; }
			
			if(!noerrors) {
				
				channel_a.put(bit_a);
				channel_b.put(bit_b);
				
				bit_a = channel_a.get();
				bit_b = channel_b.get();
			}
			
			this.bin_a.write(bit_a);
			this.bin_b.write(bit_b);
			
			while(this.bin_a.output.ready() || this.bin_b.output.ready()) {
				
				let out_a = this.bin_a.output.read();
				let out_b = this.bin_b.output.read();
				
				if(this.errorc=="none") {
					
					if(out_a!=out_b) {
						this.errors++;
					}
					this.counts++;
					
					if(options.request==BITS_REQUEST) {
						bit_output.push(out_a);
					}
					
				} else {
					
					ec_channel.putA(out_a);
					ec_channel.putB(out_b);
					
					if(ec_channel.ready()) {
						ec_channel.process();
						for(let i=0;i<ec_channel.outputA.length;i++) {
							let ec_out_a = ec_channel.outputA[i];
							let ec_out_b = ec_channel.outputB[i];
							if(ec_out_a!=ec_out_b) {
								this.errors++;
							}
							this.counts++;
							
							if(options.request==BITS_REQUEST) {
								bit_output.push(ec_out_a);
							}
							
						}
					}
					
				}
				
			}
			
		}
		
		switch(options.request) {
			case "R": { return this.requestKeyRate(); }
			case "H": { return this.requestEntropyRatio(); }
			case "Pe": { return this.requestErrorRate(); }
			case "Rf": { return this.requestSharedRate(); }
			case BITS_REQUEST: { return bit_output; }
		}
		
	}
	
	requestErrorRate() {
		return this.errors/this.counts;
	}
	
	requestKeyRate() {
		return this.bin_a.getRawKeyRate()*(1-this.requestErrorRate());
	}
	
	requestEntropyRatio() {
		return this.bin_a.getAnalysis().getMarkovChainEntropy();
	}
	
	requestEntropyRate() {
		return this.requestKeyRate()*this.requestEntropyRatio();
	}
	
	requestSharedRate() {
		return this.requestEntropyRate()*(1-this.requestErrorRate());
	}
	
}

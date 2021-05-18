
class AdaptiveAggregatedBinning extends SimpleBinning {
	
	constructor() {
		super();
		this.publicChannel = new BitStream();
	}
	
	getPublicChannel() {
		return this.publicChannel;
	}
	
	handleOutput() {
		
		if(this.length()>=this.n) {
			let frame = this.toArray(this.n);
			let l = 0;
			for(let i=0;i<frame.length;i++) {
				if(frame[i]) {
					l++;
				}
			}
			/*
			if(l>this.n/2) {
				l = this.n-l;
			}
			*/
			if(l>0 && l<this.n) {
				this.k = l>this.n/2?log2floor(this.n-l):log2ceil(l);
				let index = 0;
				for(let i=this.n/this.k;i>1;i>>>=1) {
					let outBit = Math.random()>.5;
					this.output.write(outBit);
					this.analysis.write(outBit);
					if(outBit) {
						index += 1;
					}
					index <<= 1;
					this.bitsOut++;
				}
				//publicChannel.write(index);
			}
		}
		
	}
	
	getName() {
		return "aab";
	}
	
	getKeyRate(n,d,t,dl,dr) {
		let sequences = TimeBinningMarkovChain.generate(n,d,t,dl,dr);
		let total = 0;
		for(let i=0;i<sequences.length;i++) {
			total += this.apply(sequences[i]).length;
		}
		return total/sequences.length/n;
	}
	
	
	applySpecific(bin,n) {
		let out = [];
		let l = 0;
		for(let i=0;i<n;i++) {
			if(bin[i]) {
				l++;
			}
		}
		if(l==0 || l==n) {
			return out;
		}
		let bitsPerFrame = 0;
		if(l<=n/2) {
			bitsPerFrame = log2(n/log2ceil(l));
		} else {
			bitsPerFrame = log2(n/log2floor(n-l));
		}
		for(let i=0;i<bitsPerFrame;i++) {
			out.push(true);
		}
		return out;
	}
    
	apply(key) {
		let bin = Array(key.length).fill(false);
		for(let i=0;i<bin.length;i++) {
			if(key.charAt(i)=='1') {
				bin[i] = true;
			} else {
				bin[i] = false;
			}
		}
		let out = this.applySpecific(bin,bin.length);
		let outStr = "";
		for(let i=0;i<out.length;i++) {
			outStr += (out[i]?'1':'0');
		}
		return outStr;
	}
	
}
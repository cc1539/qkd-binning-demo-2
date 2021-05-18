
class AdaptiveBinning extends SimpleBinning {
	
	handleOutput() {
		
		if(this.length()>=this.n) {
			let frame = this.toArray(this.n);
			for(this.k=1;this.k<this.n;this.k*=2) {
				let fullIndex = -1;
				let nullIndex = -1;
				for(let i=0;i<this.n;i+=this.k) {
					let full = false;
					for(let j=0;j<this.k;j++) {
						if(frame[i+j]) {
							full = true;
						}
					}
					let index = i/this.k;
					if(full) {
						fullIndex = fullIndex==-1?index:-2;
					} else {
						nullIndex = nullIndex==-1?index:-2;
					}
				}
				if(fullIndex>=0 || nullIndex>=0) {
					let index = fullIndex>=0?fullIndex:nullIndex;
					for(let i=this.n/this.k;i>1;i>>>=1) {
						let outBit = (index&1)!=0;
						this.output.write(outBit);
						this.analysis.write(outBit);
						this.bitsOut++;
						index >>>= 1;
					}
					break;
				}
			}
		}
		
	}
	
	getName() {
		return "ab";
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
		let bitsPerFrame = log2(n);
		for(let i=0;i<bin.length/n*n;i+=n) {
			let a = -1;
			let b = -1;
			for(let j=0;j<n;j++) {
				if(bin[i+j])
					{ a=(a==-1)?j:(a>=0)?-2:a; } else
					{ b=(b==-1)?j:(b>=0)?-2:b; }
			}
			let index = 0;
			if(a>=0) { index = a; } else
			if(b>=0) { index = b; } else
			{ continue; }
			for(let j=0;j<bitsPerFrame;j++) {
				out.push((index&(1<<j))!=0);
			}
		}
		if(n>2 && out.length==0) {
			let newbin = [];
			for(let i=0;i<bin.length;i+=2) {
			if(bin[i+0]||bin[i+1]) {
				newbin[i/2] = true;
			}
			}
			return this.applySpecific(newbin,n/2);
		}
		return out;
	}
    
	apply(key) {
		let bin = Array(key.length).fill(false);
		for(let i=0;i<bin.length;i++) {
			if(key.charAt(i)=='1') {
				bin[i] = true;
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
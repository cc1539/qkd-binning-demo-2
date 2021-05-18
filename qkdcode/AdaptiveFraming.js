
class AdaptiveFraming extends SimpleBinning {
	
	constructor() {
		super();
		this.publicChannel = new BitStream();
		this.bitQueue = 0;
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
			if(l>this.n/2) {
				l = this.n-l;
			}
			if(l>0) {
				let m = this.n/l;
				let k = this.n%l;
				this.bitQueue += this.k*Math.log(m+1);
				this.bitQueue += (l-this.k)*Math.log(m);
				while(this.bitQueue>=1) {
					let outBit = Math.random()>.5;
					this.output.write(outBit);
					this.analysis.write(outBit);
					this.bitsOut++;
					this.bitQueue--;
				}
				//publicChannel.write(index);
			}
		}
		
	}
	
	getName() {
		return "af";
	}
	
	getKeyRate(n,d,t,dl,dr) {
		let sequences = TimeBinningMarkovChain.generate(n,d,t,dl,dr);
		let total = 0;
		for(let i=0;i<sequences.length;i++) {
			let bitsPerFrame = 0;
			let bin = sequences[i].split('').map(e=>e=='1'?1:0);
			let n = bin.length;
			let l = bin.reduce((a,b)=>a+b,0);
			if(l>0 && l<n) {
				if(l<=n/2) {
					let r = n%l;
					let m = floor(n/l);
					bitsPerFrame += (r*log(m+1)+(l-r)*log(m));
				} else {
					let r = n%(n-l);
					let m = floor(n/(n-l));
					bitsPerFrame += (r*log(m+1)+(n-l-r)*log(m));
				}
				if(!isNaN(bitsPerFrame)) {
					total += bitsPerFrame*1.1;
				}
			}
		}
		return (sequences.length==0||n==0)?0:(total/sequences.length/n);
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
			let r = n%l;
			let m = (n-r)/l;
			bitsPerFrame = floor((r*log(m+1)+(l-r)*log(m))/log(2));
		} else {
			let r = n%(n-l);
			let m = (n-r)/(n-l);
			bitsPerFrame = floor((r*log(m+1)+(n-l-r)*log(m))/log(2));
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
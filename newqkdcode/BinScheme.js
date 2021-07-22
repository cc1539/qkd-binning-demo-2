
Module.BinScheme = class extends Module {
	
	constructor(k) {
		super();
		this.n = 8;
		this.m = log2ceil(this.n);
		this.k = k;
		this.binTime = 0;
		this.newBin = true;
	}
	
	pull() {
		// convert timestamps into bin occupancies
		if(!this.request(1)) {
			return;
		}
		while(this.data_in.available()>0) {
			let timestamp = this.data_in.read();
			while(timestamp>this.binTime+this.k) {
				this.newBin = true;
				this.binTime += this.k;
				this.data_out.write(false);
			}
			if(this.newBin) {
				this.data_out.write(true);
				this.newBin = false;
			}
		}
	}
	
};

// pulse position modulation
Module.BinScheme.PPM = class extends Module.BinScheme {
	
	constructor(n) {
		super();
		this.n = n;
	}
	
	pull() {
		if(!this.request(this.n)) { return; }
		let N = this.data_in.read(this.n);
		let l = N.map(e=>e?1:0).reduce((a,b)=>a+b);
		if(l==1) {
			this.data_out.write(num2bin(N.indexOf(true),this.m));
		}
	}
	
}

// simple binning
Module.BinScheme.SB = class extends Module.BinScheme {
	
	constructor(n) {
		super();
		this.n = n;
	}
	
	pull() {
		if(!this.request(this.n)) { return; }
		let N = this.data_in.read(this.n);
		let l = N.map(e=>e?1:0).reduce((a,b)=>a+b);
		if(l==1 || l==this.n-1) {
			this.data_out.write(num2bin(N.indexOf(l==1),this.m));
		}
	}
	
}

// adaptive binning
Module.BinScheme.AB = class extends Module.BinScheme {
	
	constructor(n) {
		super();
		this.n = n;
	}
	
	pull() {
		if(!this.request(this.n)) { return; }
		let N = this.data_in.read(this.n);
		while(N.length>=2) {
			let l = N.map(e=>e?1:0).reduce((a,b)=>a+b);
			if(l==1 || l==this.n-1) {
				this.data_out.write(num2bin(N.indexOf(l==1),this.m));
				break;
			}
			let newN = [];
			for(let i=0;i<N.length/2;i++) {
				newN[i] = N[i*2+0]|N[i*2+1];
			}
			N = newN;
		}
	}
	
}

// adaptive aggregated binning (leaks log2(n!) bits on the public channel)
Module.BinScheme.AAB = class extends Module.BinScheme {
	
	constructor(n) {
		super();
		this.n = n;
	}
	
	pull() {
		if(!this.request(this.n)) { return; }
		let N = this.data_in.read(this.n);
		let l = N.map(e=>e?1:0).reduce((a,b)=>a+b);
		let output = Math.floor(Math.random()*this.n);
		this.data_out.write(num2bin(output,this.m-log2ceil(l)+1));
	}
	
}

// adaptive framing (leaks log2(n!) bits on the public channel)
Module.BinScheme.AF = class extends Module.BinScheme {
	
	constructor(n) {
		super();
		this.n = n;
	}
	
	pull() {
		if(!this.request(this.n)) { return; }
		let N = this.data_in.read(this.n);
		let l = N.map(e=>e?1:0).reduce((a,b)=>a+b);
		let a = Math.floor(this.n/l);
		let b = this.n%l;
		let bits = Math.ceil(Math.log(Math.pow(a,1-b)*Math.pow(a+1,b))/Math.log(2));
		let output = Math.floor(Math.random()*(1<<bits));
		this.data_out.write(num2bin(output,bits));
	}
	
}

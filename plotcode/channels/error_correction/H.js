
// hamming code
Experiment.ErrorCorrectionChannel.H = class extends Experiment.ErrorCorrectionChannel.ErrorCorrectingCode {
	
	constructor(queueA,queueB) {
		super(queueA,queueB);
		this.G = null;
		this.H = null;
	}
	
	matrix2D(rows,cols) {
		return new Array(rows).fill(0).map(e=>new Array(cols).fill(false));
	}
	
	updateGeneratorMatrix(len) {
		if(this.G==null || this.G.length!=len) {
			let rows = Math.ceil(Math.log(len)/Math.log(2));
			let cols = len;
			
			this.H = this.matrix2D(rows,cols);
			let swap_index = 0;
			for(let i=0;i<cols;i++) {
				let ones = 0;
				for(let j=0;j<rows;j++) {
					this.H[j][i] = ((i+1)&(1<<j))!=0;
					if(this.H[j][i]) {
						ones++;
					}
				}
				if(ones==1) {
					if(i!=swap_index) {
						for(let j=0;j<rows;j++) {
							let tmp = this.H[j][i];
							this.H[j][i] = this.H[j][swap_index];
							this.H[j][swap_index] = tmp;
						}
					}
					swap_index++;
				}
			}
			
		}
	}
	
	updateParityCheckMatrix(len) {
		if(this.H==null || this.H.length!=len) {
			let rows = Math.ceil(Math.log(len)/Math.log(2));
			let cols = len;
			/*
			console.log("rows: "+rows);
			console.log("cols: "+cols);
			*/
			this.H = this.matrix2D(rows,cols);
			let swap_index = 0;
			for(let i=0;i<cols;i++) {
				let ones = 0;
				for(let j=0;j<rows;j++) {
					this.H[j][i] = ((i+1)&(1<<j))!=0;
					if(this.H[j][i]) {
						ones++;
					}
				}
				if(ones==1) {
					if(i!=swap_index) {
						for(let j=0;j<rows;j++) {
							let tmp = this.H[j][i];
							this.H[j][i] = this.H[j][swap_index];
							this.H[j][swap_index] = tmp;
						}
					}
					swap_index++;
				}
			}
			/*
			for(let i=0;i<rows;i++) {
				let line = "";
				for(let j=0;j<cols;j++) {
					if(j>0) {
						line += ",";
					}
					line += this.H[i][j]?'1':'0';
				}
				console.log(line);
			}
			*/
		}
	}
	
	process() {
		
		let content_length = this.queueA.length;
		this.updateGeneratorMatrix(content_length);
		this.updateParityCheckMatrix(content_length);
		
		// fix single bit flip
		this.replaceUndefined();
		let parity_a = this.queueA.map((e,i)=>e?i:0).reduce((a,b)=>a^b);
		let parity_b = this.queueB.map((e,i)=>e?i:0).reduce((a,b)=>a^b);
		let error_location = parity_b^parity_a;
		this.queueB[error_location] ^= true;
		this.outputB = this.queueB.splice(0,this.queueB.length);
	}
	
}

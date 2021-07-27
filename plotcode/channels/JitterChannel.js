
Experiment.JitterChannel = class {
	
	constructor(J) {
		this.queue = [];
		this.J = J;
	}
	
	put(bit) {
		if(bit) {
			this.queue.push(1+(Math.random()<this.J?(Math.random()<.5?1:-1):0));
		}
	}
	
	get() {
		let out = false;
		for(let i=this.queue.length-1;i>=0;i--) {
			if(this.queue[i]==0) {
				out = true;
				this.queue.splice(i,1);
			} else {
				this.queue[i]--;
			}
		}
		return out;
	}
	
}

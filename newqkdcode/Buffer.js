
class Buffer {
	
	constructor() {
		this.data = [];
	}
	
	read() {
		return this.data.splice(0,1)[0];
	}
	
	readall() {
		return this.data.splice(0,available());
	}
	
	available() {
		return this.data.length;
	}
	
	write(val) {
		if(Array.isArray(val)) {
			val.forEach(e=>this.write(e));
		} else {
			this.data.push(val);
		}
	}
	
}
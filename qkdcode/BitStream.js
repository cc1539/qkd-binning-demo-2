
class BitStream {
	
	constructor() {
		this.memory = [];
		
		this.writeIndex = 0;
		this.readIndex = 0;
	}
	
	write(bit) {
		this.memory.push(bit);
		this.writeIndex++;
	}
	
	read() {
		if(!this.ready()) {
			return false;
		}
		let bit = this.memory[0];
		this.readIndex++;
		this.memory.shift();
		return bit;
	}
	
	ready() {
		return this.length()>0;
	}
	
	length() {
		return this.writeIndex-this.readIndex;
	}
	
	toArray(len) {
		if(len==null) {
			len = this.length();
		}
		let array = [];
		for(let i=0;i<len;i++) {
			array[i] = this.read();
		}
		return array;
	}
	
	readInt(len) {
		len = len || 32;
		let num = 0;
		for(let i=0;i<len;i++) {
			if(this.read()) {
				num += 1<<i;
			}
		}
		return num;
	}
	
	clear() {
		this.readIndex = 0;
		this.writeIndex = 0;
		this.memory = [];
	}
	
}
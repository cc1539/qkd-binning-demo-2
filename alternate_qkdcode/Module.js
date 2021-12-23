
class Module {
	
	constructor() {
		this.mod_in = [];
		this.mod_out = [];
		this.data_in = new Buffer();
		this.data_out = new Buffer();
	}
	
	addInput(mod) {
		inputModules().push(mod);
		return this;
	}
	
	addOutput(mod) {
		outputModules().push(mod);
		return this;
	}
	
	inputModule(index) {
		return this.inputModules()[0|index];
	}
	
	outputModule(index) {
		return this.outputModules()[0|index];
	}
	
	inputModules() {
		return this.mod_in;
	}
	
	outputModules() {
		return this.mod_out;
	}
	
	input() {
		return this.data_in;
	}
	
	output() {
		return this.data_out;
	}
	
	pull() {
		this.inputModules().forEach(e=>{
			e.fire();
		});
	}
	
	request(amount) {
		pull();
		return input().available()>=amount;
	}
	
	fire() {
		if(!request(1)) {
			return;
		}
		output().write(input().readall());
	}
	
}

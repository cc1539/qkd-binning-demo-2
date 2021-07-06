
function log2(n) {
	let m;
	for(m=0;n>1;m++) {
		n >>= 1;
	}
	return m;
}

function log2floor(n) { // largest integer m such that 2^m <= n, return 2^m
	for(let m=1;;m*=2) {
		if(m>=n) {
			if(m>n) {
				m /= 2;
			}
			return m;
		}
	}
}

function log2ceil(n) { // smallest integer m such that 2^m >= n, return 2^m
	for(let m=1;;m*=2) {
		if(m>=n) {
			return m;
		}
	}
}

function fact(n) { // factorial
	return 0; // todo
}

function perm(n) { // permutations
	return 0; // todo
}

function comb(n) { // combinations
	return 0; // todo
}

function entropy(p, base) {
	if(base==null) {
		p = [p,1-p];
		base = 2;
	}
	let sum = 0;
	for(let i=0;i<p.length;i++) {
		sum += p[i]==0?0:(p[i]*Math.log(p[i]));
	}
	return -sum/Math.log(base);
}

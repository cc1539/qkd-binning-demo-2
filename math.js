
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
	let out = 1;
	for(let i=2;i<=n;i++) {
		out *= i;
	}
	return out;
}

function perm(n) { // permutations
	return 0; // todo
}

function comb(n,k) { // combinations
	return fact(n)/(fact(k)*fact(n-k));
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

function shuffleCount(a,b) {
	return fact(a+b)/(fact(a)*fact(b));
}

function bin2int(bin) {
	let out = 0;
	for(let i=0;i<bin.length;i++) {
	if(bin[i]) {
		out += 1<<i;
	}
	}
	return out;
}


class LinAlg {
	
}

LinAlg.array2d = function(w,h) {
	return Array(w).fill(0).map(e=>Array(h).fill(0));
}

LinAlg.getrow = function(x,i) {
	let out = Array(x.length).fill(0);
	for(let j=0;j<out.length;j++) {
		out[j] = x[j][i];
	}
	return out;
}

LinAlg.getcol = function(x,i) {
	return x[i];
}

LinAlg.col = function(x) {
	let out = LinAlg.array2d(1,x.length);
	for(let i=0;i<x.length;i++) {
		out[0][i] = x[i];
	}
	return out;
	}

LinAlg.row = function(x) {
	let out = LinAlg.array2d(x.length,1);
	for(let i=0;i<x.length;i++) {
		out[i][0] = x[i];
	}
	return out;
}

LinAlg.transpose = function(m) {
	let out = LinAlg.array2d(m[0].length,m.length);
	for(let i=0;i<m.length;i++) {
	for(let j=0;j<m[0].length;j++) {
		out[j][i] = m[i][j];
	}
	}
	return out;
}

LinAlg.trace = function(m) {
	let sum = 0;
	for(let i=0;i<m.length;i++) {
		sum += m[i][i];
	}
	return sum;
}

LinAlg.multiply = function(a,b) {
	let out = LinAlg.array2d(b.length,a[0].length);
	for(let i=0;i<out.length;i++) {
	for(let j=0;j<out[0].length;j++) {
		for(let k=0;k<a.length;k++) {
			out[i][j] += a[k][j]*b[i][k];
		}
	}
	}
	return out;
}

LinAlg.kronecker = function(a,b) {
	let out = LinAlg.array2d(a.length*b.length,a[0].length*b[0].length);
	for(let i=0;i<a.length;i++) {
	for(let j=0;j<a[0].length;j++) {
		for(let u=0;u<b.length;u++) {
		for(let v=0;v<b[0].length;v++) {
			out[i*b.length+u][j*b[0].length+v] = a[i][j]*b[u][v];
		}
		}
	}
	}
	return out;
}

LinAlg.matrix = function(w,x) {
	let out = LinAlg.array2d(w,x.length/w);
	for(let i=0;i<out.length;i++) {
	for(let j=0;j<out[0].length;j++) {
		out[i][j] = x[i*w+j];
	}
	}
	return out;
}

LinAlg.evaluate = function(line) {
	return null;
}

LinAlg.toString = function(m) {
	let out = "";
	out += "[";
	for(let i=0;i<m[0].length;i++) {
		if(i>0) {
			out += ";";
		}
		for(let j=0;j<m.length;j++) {
			if(j>0) {
				out += " ";
			}
			if(abs(m[j][i]-round(m[j][i]))<1e-5) {
				out += round(m[j][i]);
			} else {
				out += m[j][i];
			}
		}
	}
	out += "]";
	return out;
}

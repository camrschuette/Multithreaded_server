"use strict"

module.exports = Complex;

function Complex(aa, bb){
	var r = (aa === undefined) ? 0.0 : aa;
	var i = (bb === undefined) ? 0.0 : bb;
}

Complex.prototype.mag2 = function(){
	return r*r + i*i;
}

Complex.prototype.mulOperator = function(y){
	var temp = new Complex(r*y.r - i*y.i, r*y.i + i*y.r);
	return temp;
}

Complex.prototype.addOperator = function(y){
	var temp = new Complex(a.r+b.r, a.i+b.i);
	return temp;
}
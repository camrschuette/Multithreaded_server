"use strict"

module.exports = {

	iterations_to_infinity: function(x, y, maxi){
		var c = new Complex(x,y);
		var z = new Complex(0,0);
		var k;
		for( k=0; k<maxi; ++k ){
			z = z.mulOperator(z);
			z = z.addOperator(c);
			if( z.mag2() > 4.0 )
				return k;
		}
		return maxi;
	}
}

function Complex(aa, bb){
	this.r = (aa === undefined) ? 0.0 : aa;
	this.i = (bb === undefined) ? 0.0 : bb;
}

Complex.prototype.mag2 = function(){
	return this.r*this.r + this.i*this.i;
}

Complex.prototype.mulOperator = function(y){
	var temp = new Complex(this.r*y.r - this.i*y.i, this.r*y.i + this.i*y.r);
	return temp;
}

Complex.prototype.addOperator = function(y){
	var temp = new Complex(this.r+y.r, this.i+y.i);
	return temp;
}
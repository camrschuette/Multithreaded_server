"use strict"
module.exports = {
	map_color: function(k, MAX_ITERS){
		//N. Schaller's algorithm to map
		//HSV to RGB values.
		//http://www.cs.rit.edu/~ncs/color/t_convert.html

		var s = 0.8;     //saturation
		var v = 0.95;    //value
		var h = (k*1.0/MAX_ITERS) * 360.0 / 60.0;       //hue
		
		if( k >= MAX_ITERS )
			v=0;
			
		var ipart = Math.floor(h);
		var fpart = h-ipart;
		var A = v*(1-s);
		var B = v*(1-s*fpart);
		var C = v*(1-s*(1-fpart));
		var r,g,b;
		if( ipart == 0 ){
			r=v; g=C; b=A;
		}
		else if( ipart == 1){
			r=B; g=v; b=A;
		}
		else if( ipart == 2 ){
			r=A; g=v; b=C;
		}
		else if( ipart == 3){
			r=A; g=B; b=v;
		}
		else if( ipart == 4 ){
			r=C; g=A; b=v;
		}
		else{
			r=v; g=A; b=B;
		}
		var ri,gi,bi;
		ri=Math.floor(r*255);
		gi=Math.floor(g*255);
		bi=Math.floor(b*255);
		return [ri, gi, bi];
	}
}
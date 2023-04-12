import {
	Curve,
	Vector3
} from 'three';

// Lemniscate of Gerono

class Lemniscate extends Curve {
    constructor( scale = 50 ) {

		super();

		this.scale = scale;

	}

	getPoint( t, optionalTarget = new Vector3() ) {

		const point = optionalTarget;

		t = 2 * Math.PI * t;

		const x = Math.cos( t );
		const y = Math.sin( t ) * Math.cos( t );
		const z = 0;

		return point.set( x, y, z ).multiplyScalar( this.scale );

	}

}

export { Lemniscate }
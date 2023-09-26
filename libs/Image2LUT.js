import {
    TextureLoader,
	DataTexture,
	Data3DTexture,
	RGBAFormat,
	UnsignedByteType,
	ClampToEdgeWrapping,
	LinearFilter,
} from 'three';

export class Image2LUT {

	constructor( url, flipVertical=true ) {
		this.done = false;
		this.flip = flipVertical;

		const loader = new TextureLoader().load( url, tex => {
			let imageData;
			if (tex.image.width < tex.image.height ){
				imageData = this.getImageData( tex );
			}else{
				imageData = this.horz2Vert( tex );
			}
			this.lutMap = this.convert( imageData.data, Math.min(tex.image.width, tex.image.height ));
			this.done = true;
		}, null, err => {
			console.error(err);
			this.done = true;
		});
	}

	getImageData( texture ) {
		const width = texture.image.width;
		const height = texture.image.height;

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext('2d');
		if (this.flip){
			context.scale(1, -1);
            context.translate(0, -height);
		}

		context.drawImage( texture.image, 0, 0 );

		return context.getImageData(0, 0, width, height);
    }
		
    horz2Vert( texture ){
		const width = texture.image.height;
		const height = texture.image.width;

		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext('2d');
		if (this.flip){
			context.scale(1, -1);
			context.translate(0, -height);
		}

		for(let i=0; i<width; i++){
			const sy = i * width;
			const dy = (this.flip) ? height - i * width : i * width;
			context.drawImage( texture.image, sy, 0, width, width, 0, dy, width, width );
		}

		return context.getImageData(0, 0, width, height);
    }

    convert(dataArray, size){
		const data = new Uint8Array( dataArray );
		const texture = new DataTexture();
		texture.image.data = data;
		texture.image.width = size;
		texture.image.height = size * size;
		texture.format = RGBAFormat;
		texture.type = UnsignedByteType;
		texture.magFilter = LinearFilter;
		texture.minFilter = LinearFilter;
		texture.wrapS = ClampToEdgeWrapping;
		texture.wrapT = ClampToEdgeWrapping;
		texture.generateMipmaps = false;
		texture.needsUpdate = true;

		const texture3D = new Data3DTexture();
		texture3D.image.data = data;
		texture3D.image.width = size;
		texture3D.image.height = size;
		texture3D.image.depth = size;
		texture3D.format = RGBAFormat;
		texture3D.type = UnsignedByteType;
		texture3D.magFilter = LinearFilter;
		texture3D.minFilter = LinearFilter;
		texture3D.wrapS = ClampToEdgeWrapping;
		texture3D.wrapT = ClampToEdgeWrapping;
		texture3D.wrapR = ClampToEdgeWrapping;
		texture3D.generateMipmaps = false;
		texture3D.needsUpdate = true;

		return {
			size,
			texture,
			texture3D,
		};

	}

}
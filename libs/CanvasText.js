import { CanvasTexture } from 'three';

export class CanvasText{
    constructor( text='Hello World', font='48px Arial', width=256, height=128 ){
        this.canvas = document.createElement('canvas');
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        this.fontSize = Number(font.split('px')[0]);
        this.context = this.canvas.getContext('2d');
        this.context.font = font;
        this.context.textAlign = 'center';

        this.texture = new CanvasTexture( this.canvas );
        this.setText( text );
    }

    setText( text ){
        this.context.fillStyle = '#fff';
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.fillStyle = '#000';
        this.context.fillText( text, this.width/2, this.height-this.fontSize );
    
        this.texture.needsUpdate = true;
    }
}
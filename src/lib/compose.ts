export type FrameId = 'opentowork' | 'hiring';

export interface Frame {
	id: FrameId;
	label: string;
	src: string;
	accent: string;
}

export interface Pan {
	x: number;
	y: number;
}

export const FRAMES: Frame[] = [
	{ id: 'opentowork', label: 'Open to Work', src: '/frames/opentowork.png', accent: '#457032' },
	{ id: 'hiring', label: 'Hiring', src: '/frames/hiring.png', accent: '#8344cc' }
];

// The photo fills the full 800×800 output circle (radius 400, tangent to all
// edges). The frame — ring on the left, banner on the bottom — is drawn on top
// of the photo, so it reads as merged into the image, not an external border.
const PHOTO = { cx: 400, cy: 400, r: 400 };
const OUTPUT_SIZE = 800;
const BLEED = 2;
const DEST_SIZE = PHOTO.r * 2 + BLEED * 2;

export const CENTER_PAN: Pan = { x: 0.5, y: 0.5 };

export function loadFileAsBitmap(file: File): Promise<ImageBitmap> {
	return createImageBitmap(file, { imageOrientation: 'from-image' });
}

export function loadFrame(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.decoding = 'async';
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(`Failed to load frame: ${src}`));
		img.src = src;
	});
}

function sourceWidth(source: ImageBitmap | HTMLImageElement): number {
	return source instanceof HTMLImageElement ? source.naturalWidth : source.width;
}

function sourceHeight(source: ImageBitmap | HTMLImageElement): number {
	return source instanceof HTMLImageElement ? source.naturalHeight : source.height;
}

function clamp(v: number, min = 0, max = 1): number {
	return v < min ? min : v > max ? max : v;
}

/**
 * Convert a pointer drag (in canvas pixels) into a pan delta.
 * The photo is cover-fit into the circular opening, so only the overflow
 * direction(s) are pannable; a square photo has no freedom to move.
 */
export function panDelta(
	photo: ImageBitmap | HTMLImageElement,
	dx: number,
	dy: number
): Pan {
	const sw = sourceWidth(photo);
	const sh = sourceHeight(photo);
	const m = Math.min(sw, sh);
	const xRange = sw - m;
	const yRange = sh - m;
	return {
		x: xRange > 0 ? (-dx * m) / (DEST_SIZE * xRange) : 0,
		y: yRange > 0 ? (-dy * m) / (DEST_SIZE * yRange) : 0
	};
}

export function composeFrame(
	photo: ImageBitmap | HTMLImageElement,
	frame: HTMLImageElement,
	pan: Pan = CENTER_PAN
): HTMLCanvasElement {
	const canvas = document.createElement('canvas');
	canvas.width = OUTPUT_SIZE;
	canvas.height = OUTPUT_SIZE;

	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas 2D context is unavailable');

	// Cover-fit the photo: the smaller source dimension fills the opening,
	// the larger dimension overflows and is positioned by `pan` (0..1).
	const sw = sourceWidth(photo);
	const sh = sourceHeight(photo);
	const m = Math.min(sw, sh);
	const srcX = clamp(pan.x) * (sw - m);
	const srcY = clamp(pan.y) * (sh - m);

	const destLeft = PHOTO.cx - PHOTO.r - BLEED;
	const destTop = PHOTO.cy - PHOTO.r - BLEED;

	// Draw the photo as a circle, slightly oversized so the frame's ring and
	// banner overlap the edge with no transparent seam.
	ctx.save();
	ctx.beginPath();
	ctx.arc(PHOTO.cx, PHOTO.cy, PHOTO.r + BLEED, 0, Math.PI * 2);
	ctx.clip();
	ctx.drawImage(photo, srcX, srcY, m, m, destLeft, destTop, DEST_SIZE, DEST_SIZE);
	ctx.restore();

	// Overlay the frame (transparent PNG carrying the ring and banner).
	ctx.drawImage(frame, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

	return canvas;
}

<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import {
		FRAMES,
		type FrameId,
		type Pan,
		CENTER_PAN,
		loadFileAsBitmap,
		loadFrame,
		composeFrame,
		panDelta
	} from '$lib/compose';

	let photoFile = $state<File | null>(null);
	let photoBitmap = $state<ImageBitmap | null>(null);
	let photoUrl = $state('');
	let frameId = $state<FrameId>('opentowork');
	let frameImage = $state<HTMLImageElement | null>(null);
	let working = $state(false);
	let error = $state('');
	let dragActive = $state(false);
	let pan = $state<Pan>({ ...CENTER_PAN });

	let preview = $state<HTMLCanvasElement | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);

	let panning = $state<{ startX: number; startY: number; pan: Pan } | null>(null);

	const selectedFrame = $derived(FRAMES.find((f) => f.id === frameId) ?? FRAMES[0]);
	const isPanned = $derived(pan.x !== CENTER_PAN.x || pan.y !== CENTER_PAN.y);

	$effect(() => {
		let cancelled = false;
		loadFrame(selectedFrame.src)
			.then((img) => {
				if (!cancelled) frameImage = img;
			})
			.catch((e: unknown) => {
				if (!cancelled) error = e instanceof Error ? e.message : 'Could not load the frame.';
			});
		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (!preview || !photoBitmap || !frameImage) return;
		const canvas = composeFrame(photoBitmap, frameImage, pan);
		const ctx = preview.getContext('2d');
		if (!ctx) return;
		ctx.clearRect(0, 0, preview.width, preview.height);
		ctx.drawImage(canvas, 0, 0);
	});

	onMount(() => {
		let depth = 0;
		const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes('Files');

		function enter(e: DragEvent) {
			if (!hasFiles(e)) return;
			e.preventDefault();
			depth += 1;
			dragActive = true;
		}
		function over(e: DragEvent) {
			if (hasFiles(e)) e.preventDefault();
		}
		function leave(e: DragEvent) {
			if (!hasFiles(e)) return;
			depth = Math.max(0, depth - 1);
			if (depth === 0) dragActive = false;
		}
		function drop(e: DragEvent) {
			if (!hasFiles(e)) return;
			e.preventDefault();
			depth = 0;
			dragActive = false;
			const file = e.dataTransfer?.files?.[0];
			if (file) handleFile(file);
		}

		window.addEventListener('dragenter', enter);
		window.addEventListener('dragover', over);
		window.addEventListener('dragleave', leave);
		window.addEventListener('drop', drop);

		return () => {
			window.removeEventListener('dragenter', enter);
			window.removeEventListener('dragover', over);
			window.removeEventListener('dragleave', leave);
			window.removeEventListener('drop', drop);
		};
	});

	onDestroy(() => {
		if (photoUrl) URL.revokeObjectURL(photoUrl);
	});

	function openPicker() {
		fileInput?.click();
	}

	function clampPan(v: number): number {
		return v < 0 ? 0 : v > 1 ? 1 : v;
	}

	async function handleFile(file: File) {
		if (!file.type.startsWith('image/')) {
			error = 'Choose an image file (PNG or JPEG).';
			return;
		}
		error = '';
		working = true;
		try {
			const bitmap = await loadFileAsBitmap(file);
			if (photoUrl) URL.revokeObjectURL(photoUrl);
			photoUrl = URL.createObjectURL(file);
			photoFile = file;
			photoBitmap = bitmap;
			pan = { ...CENTER_PAN };
		} catch {
			error = 'Could not read that image. Try another file.';
		} finally {
			working = false;
		}
	}

	function onInput(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (file) handleFile(file);
	}

	function resetPan() {
		pan = { ...CENTER_PAN };
	}

	function onPointerDown(e: PointerEvent) {
		if (!photoBitmap) return;
		const el = e.currentTarget as HTMLElement;
		el.setPointerCapture(e.pointerId);
		panning = { startX: e.clientX, startY: e.clientY, pan: { ...pan } };
	}

	function onPointerMove(e: PointerEvent) {
		if (!panning || !photoBitmap) return;
		const canvas = e.currentTarget as HTMLCanvasElement;
		const rect = canvas.getBoundingClientRect();
		const scale = canvas.width / rect.width;
		const dx = (e.clientX - panning.startX) * scale;
		const dy = (e.clientY - panning.startY) * scale;
		const d = panDelta(photoBitmap, dx, dy);
		pan = {
			x: clampPan(panning.pan.x + d.x),
			y: clampPan(panning.pan.y + d.y)
		};
	}

	function onPointerUp(e: PointerEvent) {
		panning = null;
		const el = e.currentTarget as HTMLElement;
		if (el.hasPointerCapture?.(e.pointerId)) el.releasePointerCapture(e.pointerId);
	}

	function onKeydown(e: KeyboardEvent) {
		if (!photoBitmap) return;
		const step = 0.02;
		let dx = 0;
		let dy = 0;
		if (e.key === 'ArrowLeft') dx = step;
		else if (e.key === 'ArrowRight') dx = -step;
		else if (e.key === 'ArrowUp') dy = step;
		else if (e.key === 'ArrowDown') dy = -step;
		else return;
		e.preventDefault();
		pan = { x: clampPan(pan.x + dx), y: clampPan(pan.y + dy) };
	}

	function download() {
		if (!preview) return;
		const url = preview.toDataURL('image/png');
		const a = document.createElement('a');
		a.href = url;
		a.download = `linkedin-${frameId}.png`;
		document.body.appendChild(a);
		a.click();
		a.remove();
	}
</script>


<!-- Hidden native file input; the visible controls trigger it programmatically. -->
<input
	bind:this={fileInput}
	type="file"
	accept="image/*"
	class="sr-only"
	tabindex="-1"
	aria-hidden="true"
	onchange={onInput}
/>

<div class="w-full">
	<section class="mb-10 sm:mb-16">
		<h1 class="text-3xl sm:text-4xl font-medium tracking-tighter text-foreground">
			Add a LinkedIn frame to your photo
		</h1>
		<p class="mt-4 text-lg sm:text-xl text-muted-foreground">
			Upload a photo, pick the Open to Work or Hiring frame, and download the result. Everything
			runs locally in your browser.
		</p>
	</section>

	<section class="grid gap-10 lg:grid-cols-2 lg:gap-12">
		<!-- Controls -->
		<div class="flex flex-col gap-8">
			<div>
				<h2 class="mb-4 text-xl font-medium tracking-tight text-foreground">Photo</h2>

				{#if !photoFile}
					<button
						type="button"
						onclick={openPicker}
						class="flex min-h-56 w-full cursor-pointer flex-col items-center justify-center gap-3 border bg-transparent p-8 text-center transition-colors border-border/40 hover:border-border/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="size-8 text-muted-foreground"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"
						>
							<rect x="3" y="3" width="18" height="18" rx="2" />
							<circle cx="9" cy="9" r="2" />
							<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
						</svg>
						<span class="text-base text-foreground">
							{working ? 'Loading…' : 'Drop your photo anywhere'}
						</span>
						<span class="text-sm text-muted-foreground">or click to browse</span>
					</button>
				{:else}
					<div class="flex items-center justify-between gap-4 border border-border/40 bg-transparent p-4">
						<div class="flex min-w-0 items-center gap-3">
							<div class="grid size-10 shrink-0 place-items-center overflow-hidden border border-border/40">
								<img src={photoUrl} alt="" class="size-full object-cover" />
							</div>
							<span class="truncate text-sm text-foreground">{photoFile.name}</span>
						</div>
						<button
							type="button"
							onclick={openPicker}
							class="btn btn-ghost btn-sm shrink-0 border border-border/40"
						>
							Change photo
						</button>
					</div>
				{/if}

				{#if error}
					<p role="alert" class="mt-3 text-sm text-error">
						{error}
					</p>
				{/if}
			</div>

			<fieldset>
				<legend class="mb-4 text-xl font-medium tracking-tight text-foreground">Frame</legend>
				<div class="grid grid-cols-2 gap-4">
					{#each FRAMES as frame (frame.id)}
						<label
							class="cursor-pointer border bg-transparent p-4 transition-colors {frameId === frame.id ? 'border-foreground' : 'border-border/40 hover:border-border/80'}"
						>
							<input
								type="radio"
								name="frame"
								value={frame.id}
								bind:group={frameId}
								class="sr-only"
							/>
							<span class="flex items-center gap-3">
								<span
									class="size-4 shrink-0 rounded-full border border-foreground/20"
									style={`background-color: ${frame.accent}`}
									aria-hidden="true"
								></span>
								<span class="text-sm font-medium text-foreground">{frame.label}</span>
								<span
									class="ml-auto text-muted-foreground {frameId === frame.id ? 'opacity-100' : 'opacity-0'}"
									aria-hidden="true"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="size-4"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									>
										<path d="M20 6 9 17l-5-5" />
									</svg>
								</span>
							</span>
						</label>
					{/each}
				</div>
			</fieldset>

			<div class="flex flex-col gap-3">
				<button type="button" class="btn btn-primary w-full" onclick={download} disabled={!photoBitmap}>
					Download PNG
				</button>
				<p class="text-xs text-muted-foreground">
					Exports an 800×800 PNG. Your photo is circular-cropped and the frame overlays the
					selected badge.
				</p>
			</div>
		</div>

		<!-- Preview -->
		<div class="flex flex-col gap-4">
			<h2 class="text-xl font-medium tracking-tight text-foreground">Preview</h2>
			<div class="border border-border/40 bg-transparent p-4">
				{#if photoBitmap}
					<canvas
						bind:this={preview}
						width={800}
						height={800}
						class="h-auto w-full cursor-grab touch-none select-none active:cursor-grabbing"
						tabindex="0"
						aria-label="Photo preview. Drag or use the arrow keys to reposition the photo."
						onpointerdown={onPointerDown}
						onpointermove={onPointerMove}
						onpointerup={onPointerUp}
						onpointercancel={onPointerUp}
						onkeydown={onKeydown}
					></canvas>
				{:else}
					<div class="flex aspect-square w-full items-center justify-center text-muted-foreground">
						<div class="text-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="mx-auto mb-3 size-10"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.5"
								stroke-linecap="round"
								stroke-linejoin="round"
								aria-hidden="true"
							>
								<rect x="3" y="3" width="18" height="18" rx="2" />
								<circle cx="9" cy="9" r="2" />
								<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
							</svg>
							<p class="text-sm">Your preview appears here</p>
						</div>
					</div>
				{/if}
			</div>
			{#if photoBitmap}
				<div class="flex items-center justify-between gap-4">
					<p class="text-xs text-muted-foreground">Drag on the photo to reposition it.</p>
					{#if isPanned}
						<button
							type="button"
							onclick={resetPan}
							class="btn btn-ghost btn-xs shrink-0 border border-border/40"
						>
							Reset position
						</button>
					{/if}
				</div>
			{/if}
		</div>
	</section>
</div>

{#if dragActive}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
		<div class="border-2 border-dashed border-foreground px-16 py-24 text-center">
			<p class="text-lg font-medium text-foreground">Drop your image</p>
			<p class="mt-2 text-sm text-muted-foreground">It will be added to the frame</p>
		</div>
	</div>
{/if}

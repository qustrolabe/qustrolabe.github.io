import { createSignal } from "solid-js";
import CanvasSketch, {
    type SketchFn,
    type SketchInputs,
    type SketchOutputs,
} from "@components/CanvasSketch.tsx";

/** Input types - parent passes these to sketch */
type DemoInputs = SketchInputs<{
    velocity: number;
    radius: number;
    reset: number;
    flipX: number;
    flipY: number;
}>;

/** Output types - sketch pushes these back to parent */
type DemoOutputs = SketchOutputs<{
    x: number;
    y: number;
    vx: number;
    vy: number;
}>;

export default function CanvasDemo() {
    const [inputs, setInputs] = createSignal<DemoInputs>({
        velocity: 3,
        radius: 30,
        reset: 0,
        flipX: 0,
        flipY: 0,
    });
    const [outputs, setOutputs] = createSignal<DemoOutputs>({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
    });

    const sketch: SketchFn<DemoInputs, DemoOutputs> = (
        { ctx, width, height, inputs, onCleanup, onOutput },
    ) => {
        let x = 250;
        let y = 250;
        let dirX = 1;
        let dirY = 1;
        let animationId: number;
        let lastReset = 0;
        let lastFlipX = 0;
        let lastFlipY = 0;

        const angle = Math.random() * Math.PI * 2;
        dirX = Math.cos(angle);
        dirY = Math.sin(angle);

        const draw = () => {
            const inp = inputs();

            if (inp.reset !== lastReset) {
                lastReset = inp.reset;
                x = 250;
                y = 250;
            }
            if (inp.flipX !== lastFlipX) {
                lastFlipX = inp.flipX;
                dirX *= -1;
            }
            if (inp.flipY !== lastFlipY) {
                lastFlipY = inp.flipY;
                dirY *= -1;
            }

            x += inp.velocity * dirX;
            y += inp.velocity * dirY;

            const r = inp.radius;

            if (x - r <= 0) {
                x = r;
                dirX = Math.abs(dirX);
            } else if (x + r >= width) {
                x = width - r;
                dirX = -Math.abs(dirX);
            }

            if (y - r <= 0) {
                y = r;
                dirY = Math.abs(dirY);
            } else if (y + r >= height) {
                y = height - r;
                dirY = -Math.abs(dirY);
            }

            ctx.fillStyle = "#141414";
            ctx.fillRect(0, 0, width, height);

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = "white";
            ctx.fill();

            onOutput({
                x,
                y,
                vx: inp.velocity * dirX,
                vy: inp.velocity * dirY,
            });

            animationId = requestAnimationFrame(draw);
        };

        draw();
        onCleanup(() => cancelAnimationFrame(animationId));
    };

    return (
        <div class="flex flex-col gap-4">
            <div class="flex flex-wrap items-center gap-4 p-3 bg-zinc-800 rounded-lg">
                <div class="flex items-center gap-2">
                    <label class="text-sm text-zinc-400">Velocity</label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={inputs().velocity}
                        onInput={(e) =>
                            setInputs({
                                ...inputs(),
                                velocity: Number(e.currentTarget.value),
                            })}
                        class="w-24 accent-emerald-500"
                    />
                    <span class="text-sm text-zinc-200 w-6">
                        {inputs().velocity}
                    </span>
                </div>
                <div class="flex items-center gap-2">
                    <label class="text-sm text-zinc-400">Radius</label>
                    <input
                        type="range"
                        min="10"
                        max="80"
                        step="5"
                        value={inputs().radius}
                        onInput={(e) =>
                            setInputs({
                                ...inputs(),
                                radius: Number(e.currentTarget.value),
                            })}
                        class="w-24 accent-emerald-500"
                    />
                    <span class="text-sm text-zinc-200 w-6">
                        {inputs().radius}
                    </span>
                </div>
                <div class="flex items-center gap-2 ml-2">
                    <button
                        class="px-3 py-1.5 text-sm font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors"
                        onClick={() =>
                            setInputs({
                                ...inputs(),
                                reset: inputs().reset + 1,
                            })}
                    >
                        Reset
                    </button>
                    <button
                        class="px-3 py-1.5 text-sm font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors"
                        onClick={() =>
                            setInputs({
                                ...inputs(),
                                flipX: inputs().flipX + 1,
                            })}
                    >
                        Flip X
                    </button>
                    <button
                        class="px-3 py-1.5 text-sm font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors"
                        onClick={() =>
                            setInputs({
                                ...inputs(),
                                flipY: inputs().flipY + 1,
                            })}
                    >
                        Flip Y
                    </button>
                </div>
                <div class="flex items-center gap-2 ml-auto text-xs font-mono text-zinc-400">
                    <span>x: {Math.round(outputs().x)}</span>
                    <span class="text-zinc-600">|</span>
                    <span>y: {Math.round(outputs().y)}</span>
                    <span class="text-zinc-600">|</span>
                    <span>vx: {outputs().vx.toFixed(1)}</span>
                    <span class="text-zinc-600">|</span>
                    <span>vy: {outputs().vy.toFixed(1)}</span>
                </div>
            </div>

            <div class="w-full aspect-square max-w-[500px] mx-auto rounded-lg overflow-hidden">
                <CanvasSketch
                    width={1500}
                    height={500}
                    inputs={inputs}
                    outputs={setOutputs}
                    sketch={sketch}
                />
            </div>
        </div>
    );
}

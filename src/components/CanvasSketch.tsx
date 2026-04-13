import { onCleanup, onMount } from "solid-js";
import type { Accessor, Setter } from "solid-js";

export type SketchInputs<T> = T;
export type SketchOutputs<T> = T;

export type SketchFn<TInputs, TOutputs> = (params: {
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    inputs: Accessor<TInputs>;
    onCleanup: (fn: () => void) => void;
    onOutput: (outputs: TOutputs) => void;
}) => void;

/**
 * CanvasSketchProps<TInputs, TOutputs> - Component props
 */
interface CanvasSketchProps<TInputs, TOutputs> {
    width: number;
    height: number;
    inputs: Accessor<TInputs>;
    outputs: Setter<TOutputs>;
    sketch: SketchFn<TInputs, TOutputs>;
}

/**
 * CanvasSketch - Universal HTML5 Canvas component for SolidJS
 *
 * Generic component that handles any canvas animation with type-safe inputs/outputs.
 * Parent controls inputs (sliders, buttons), sketch reads them each frame.
 * Sketch pushes outputs back for display panel.
 *
 * @example
 * ```tsx
 * type DemoInputs = { velocity: number; radius: number; reset: number };
 * type DemoOutputs = { x: number; y: number; vx: number; vy: number };
 *
 * const [inputs, setInputs] = createSignal<DemoInputs>({ velocity: 3, radius: 30, reset: 0 });
 * const [outputs, setOutputs] = createSignal<DemoOutputs>({ x: 0, y: 0, vx: 0, vy: 0 });
 *
 * <CanvasSketch<DemoInputs, DemoOutputs>
 *   width={500}
 *   height={500}
 *   inputs={inputs}
 *   outputs={setOutputs}
 *   sketch={({ ctx, width, height, inputs, onCleanup, onOutput }) => { ... }}
 * />
 * ```
 */
export default function CanvasSketch<TInputs, TOutputs>(
    props: CanvasSketchProps<TInputs, TOutputs>,
) {
    let container!: HTMLDivElement;
    let cleanup: (() => void) | null = null;

    onMount(() => {
        if (!container) return;

        const canvas = document.createElement("canvas");
        canvas.width = props.width;
        canvas.height = props.height;
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.style.display = "block";
        container.appendChild(canvas);

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        props.sketch({
            ctx,
            width: props.width,
            height: props.height,
            inputs: props.inputs,
            onCleanup: (fn) => {
                cleanup = fn;
            },
            onOutput: props.outputs,
        });
    });

    onCleanup(() => cleanup?.());

    return <div ref={container} />;
}

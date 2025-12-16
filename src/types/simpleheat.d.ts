declare module 'simpleheat' {
    class SimpleHeat {
        constructor(canvas: HTMLCanvasElement);
        data(data: Array<[number, number, number]>): this;
        max(max: number): this;
        add(point: [number, number, number]): this;
        clear(): this;
        radius(r: number, blur: number): this;
        resize(): this;
        draw(minOpacity?: number): this;
    }

    function simpleheat(canvas: HTMLCanvasElement): SimpleHeat;
    export = simpleheat;
}

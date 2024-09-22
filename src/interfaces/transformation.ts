export interface Transformation {

    openWindows(resourcePath: string): void;
    getContent(json: string): string;
    transform(resourcesPath: string): void;
}
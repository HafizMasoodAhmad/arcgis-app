declare global {
    const $arcgis: {
        import(moduleSpecifier: string | string[]): Promise<any>;
    };
}

export {}; 
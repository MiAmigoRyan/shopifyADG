declare const VIRTUAL_ROUTES_DIR = "virtual-routes/routes";
declare const VIRTUAL_ROOT = "virtual-routes/virtual-root";
declare function getVirtualRoutes(): Promise<{
    routes: {
        id: string;
        path: string;
        file: string;
        index: boolean;
    }[];
    root: {
        id: string;
        path: string;
        file: string;
    };
}>;

export { VIRTUAL_ROOT, VIRTUAL_ROUTES_DIR, getVirtualRoutes };

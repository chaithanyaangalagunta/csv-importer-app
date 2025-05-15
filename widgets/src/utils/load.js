export const NotLoaded = () => ({ status: "not-loaded" });
export const Loading = () => ({ status: "loading" });
export const Loaded = (data) => ({ status: "loaded", data });
export const Error = (error) => ({ status: "error", error });

export const isLoaded = (data) => data.status === "loaded";
export const isLoading = (data) => data.status === "loading";
export const isNotLoaded = (data) => data.status === "not-loaded";
export const isError = (data) => data.status === "error";

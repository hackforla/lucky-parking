export type onEvent = (arg0: any) => void;

export type Handler = keyof HTMLElement & `on${string}`;

export type Nil = null | undefined;

export type EmptyObject = Record<string, never>;

export type Handler = keyof HTMLElement & `on${string}`;

export type Nil = null | undefined;

export type NonNil = NonNullable<unknown>;

export type onEvent = (arg0: unknown) => void;

import Elysia from "elysia";

export const api = new Elysia()

    .get('/app', () => {
        return "huan  yin"
    })
    .get('', () => {
        return "hello world"
    })

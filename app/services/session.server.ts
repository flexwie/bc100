import {createCookieSessionStorage} from '@remix-run/node'

export const sessionStorage = createCookieSessionStorage({
    cookie: {
        name: "_session",
        sameSite: "lax",
        path: "/",
        httpOnly: true,
        secrets: ["dfgvbhj34567fgh"],
        secure: process.env.NODE_ENV === "production"
    }
})

export const {getSession, commitSession, destroySession} = sessionStorage
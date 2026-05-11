import NextAuth from "next-auth";
import { authOptions } from "./lib/auth-config";

const authHandler = NextAuth(authOptions);

export { authHandler, authOptions };

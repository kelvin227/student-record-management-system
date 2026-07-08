import Credentials from "next-auth/providers/credentials";
import { prisma } from "./lib/db";
import bcrypt from "bcryptjs";
import { NextAuthConfig } from "next-auth";

const providers = [
    Credentials({
    name: "credentials",
    credentials: {
        email: {label: "Email", type: "email"},
        password: {label: "Password", type: "password"},
    },
    authorize: async (credentials) => {
        
        if (!credentials?.email || !credentials?.password){
            return null
        };

        const password = credentials.password as string
        const email =  credentials.email as string

        // check for existing user
        let user = await prisma.user.findUnique({
            where: {
                email: email,
            }
        });

        if(!user) {
            return null
        } else {
            const isMatch = bcrypt.compare(password, user.password)
            if (!isMatch){
                return null
            }
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role,
        }
        
        
    }

})]

export const authConfig = {
    providers: providers,

    session: {
        strategy: "jwt",
    },

    callbacks: {
        async jwt({ token, user }){
            if(user){
                token.role = user.role;
            }

            return token;
        },

        async session({ session, token }){
            if(session.user){
                session.user.id = token.sub!;
                session.user.role = token.role as string;
            }

            return session;
        },
    }
} satisfies NextAuthConfig
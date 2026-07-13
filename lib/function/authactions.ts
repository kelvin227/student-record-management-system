"use server"

import {signIn, signOut } from "@/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function Login(email:string, password:string, panel: string){
    try {
        let existingUser;
        if(panel !== "STUDENT"){
        existingUser = await prisma.user.findUnique({
            where: {email: email}
        })
        }else{
            const student = await prisma.student.findUnique({
            where: {matricNo: email},
            include:{user:true}
        })
        existingUser = student?.user;
        }

        if(!existingUser){
            return {success: false, message: "User does not exist"}
        }
        if(existingUser.role !== panel){
            return {success: false, message: "You are not authorized to access this panel"}
        }
        const isMatch = bcrypt.compareSync(password, existingUser.password)
        if(!isMatch){
            return {success: false, message: "Incorrect password"}
        }
            const signin = await signIn("credentials", {
                email: panel !== 'STUDENT' ? email : existingUser.email,
                password: password,
                redirect: false,
            })

            if(!signin){
                return { success: false, message: "Sign in  Failed"}
            }

        return {success: true, message: "Sign in successfully"}
    } catch (error) {
        console.error(error)
        return {success: false, message: "There's an error somewhere"}
    }
}

export async function Logout(url: string){
    await signOut(
        {redirectTo: url}
    )
}

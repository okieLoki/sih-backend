import { Request, Response } from "express";
import { handleErrors, password_compare,create_token } from "../utils";
import { UserLogin } from "../dto";
import * as EmailValidator from 'email-validator';
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export const login = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    const parsing = UserLogin.safeParse(data);
    if (!parsing.success) {
      return res.status(400).json({
        "message": "pls enter proper data"
      })
    }
    if (!EmailValidator.validate(data.email)) {
      return res.status(400).json({
        "message": "email is invalid"
      })
    }
    const find = await prisma.user.findFirst({
      where: { email: data.email }
    })
    if (!find) {
      return res.status(400).json({
        "message":"user doesn't exist"
      })
    }
    console.log(find.password)
    console.log(data.password)
    const compare = await password_compare(data.password, find.password);
    console.log(compare)
    if (!compare) {
      return res.status(400).json({
        "message":"password doesn't match"
      })
    }
    const token = await create_token(data.email);
    res.set('Authorization', `Bearer ${token}`);
    res.send(find)
  } catch (err) {
    handleErrors(res,err)
  }
}
"use server";

import * as z from "zod";
import { signIn } from "@/auth";
import { getUserByEmail } from "@/data/user";
import { sendVerificationEmail, sendTwoFactorTokenEmail } from "@/lib/mail";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { LoginSchema } from "@/schemas";
import { AuthError } from "next-auth";
import { generateVerificationtoken, generateTwoFactorToken } from "@/lib/tokens";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { error } from "console";
import db from "@/lib/db";
import getTwoFactorConfirmationByUserId from "@/data/two-factor-confirmation";


export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: "Invalid fields!" };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: "Email does not exist" }
  };

  if (!existingUser.emailVerified) {
    const verificatonToken = await generateVerificationtoken(
      existingUser.email,
    );
    await sendVerificationEmail(
      verificatonToken.email,
      verificatonToken.token,
    );

    return { success: "Confirmation email sent!" }
  }

  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactortoken = await getTwoFactorTokenByEmail(existingUser.email);

      if (!twoFactortoken) {
        return { error: "Invalid code!" };
      }

      if (twoFactortoken.token !== code) {
        return { error: "Invalid code!" }
      }

      const hasExpired = new Date(twoFactortoken.expires) < new Date();

      if (hasExpired) {
        return { error: "Code expired!" };
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactortoken.id }
      })

      const existingConfirmation  = await getTwoFactorConfirmationByUserId(existingUser.id);

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id }
        });
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id
        }
      });


    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email)
      await sendTwoFactorTokenEmail(
        twoFactorToken.email,
        twoFactorToken.token
      );

      return { twoFactor: true }
    }
  }



  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: " Invalid credentials!" }
        default:
          return { error: "Something went wrong!" }
      }
    }

    throw error;

  }
}
import crpyto from "crypto";
import { v4 as uuidv4 } from "uuid";
import db from "./db";

import { getPasswordresetTokenByEmail } from "@/data/password-reset-token";
import { getVerificationTokenbyEmail } from "@/data/verification_token";
import { getTwoFactorTokenByEmail, getTwoFactorTokenByToken } from "@/data/two-factor-token";

export const generateTwoFactorToken = async (email: string) => {
  const token =  crpyto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 15 * 60 * 1000);

  const existingToken = await getTwoFactorTokenByEmail(email);

  if (existingToken) {
    await db.twoFactorToken.delete({
      where: {
        id: existingToken.id
      }
    });
  }

  const twoFactorToken = await db.twoFactorToken.create({
    data: {
      email,
      token,
      expires,
    }
  });
  return twoFactorToken;
}

export const generatePasswordResetToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordresetTokenByEmail(email);

  if (existingToken) {
    await db.passwordResetToken.delete({
      where: { id: existingToken.id}
    });
  }

  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      email,
      token, 
      expires
    }
  });

  return passwordResetToken
}
export const generateVerificationtoken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getVerificationTokenbyEmail(email);

  if (existingToken) {
    await db.verificationToken.delete({
      where: {
        id: existingToken.id
      },
    });
  }

  const verificationToken = await db.verificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });
  return verificationToken;
};


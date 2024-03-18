"use client";

import { useSearchParams } from "next/navigation";
import CardWrapper from "./card-wrapper";
import { BeatLoader } from "react-spinners"
import { useCallback, useEffect, useState } from "react";
import { newVerification } from "@/actions/new-verification";
import { FormSuccess } from "../form-success";
import { FormError } from "../form-error";



export const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();


  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const onSubmit = useCallback(() => {

    if (success || error) return;

    console.log(token);
  }, [token]);

  useEffect(() => {
    if (!token) {
      setError("Missing token!");
      return;
    }

    newVerification(token)
      .then((data) => {
        setSuccess(data.succes);
        setError(data.error);
      })
      .catch(() => {
        setError("Something went wrong!");
      })
    onSubmit();
  }, [onSubmit, success, error])

  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center w-full justify-center">
        {!success && !error && (
          <BeatLoader />
        )}
        <FormSuccess message={success}/>
       {!success && (
         <FormError message={error}/>
       )}
      </div>

    </CardWrapper>
  )
}
import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

const Login = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>

  );
}

export default Login;
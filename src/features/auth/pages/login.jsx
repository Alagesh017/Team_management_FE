import { LoginForm } from "../components/LoginForm";
import { LoginSessionRedirect } from "../components/LoginSessionRedirect";
import AuthLayout from "../../../common/layouts/AuthLayout";

const Login = () => {
  return (
    <AuthLayout>
      <LoginSessionRedirect />
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;

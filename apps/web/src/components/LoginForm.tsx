import { useAuth } from "../hooks/useAuth";
import { useDemo } from "../hooks/useDemo";
import LoginFormView from "./LoginFormView";
import LoginScreenView from "./LoginScreenView";

/** Login page: connects the hooks (API) to the views. */
export default function LoginForm() {
  const { login, loginDemo, loading, demoRole, error } = useAuth();
  const { occupancy } = useDemo();

  return (
    <LoginScreenView
      demo={occupancy}
      demoRole={demoRole}
      onDemoLogin={loginDemo}
      form={<LoginFormView onSubmit={login} loading={loading} error={error} />}
    />
  );
}

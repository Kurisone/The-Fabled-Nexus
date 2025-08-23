import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/session";
import { useModal } from "../context/Modal";
import "./AuthForms.css"; 

function LoginForm() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const { closeModal } = useModal();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);

  if (sessionUser) return null;

  const handleErrors = (data) => {
    if (!data) return;
    // Convert object errors or array errors into an array
    if (Array.isArray(data)) setErrors(data);
    else if (typeof data === "object") setErrors(Object.values(data));
    else setErrors([String(data)]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    const data = await dispatch(login({ credential, password }));
    if (data?.errors) handleErrors(data.errors);
    else closeModal();
  };

  const handleDemoLogin = async () => {
    setErrors([]);
    const data = await dispatch(
      login({ credential: "demo@user.io", password: "password" })
    );
    if (data?.errors) handleErrors(data.errors);
    else closeModal();
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2 className="form-title">Log In</h2>

      {errors.length > 0 && (
        <ul className="error-list">
          {errors.map((error, idx) => (
            <li key={idx} className="error">{error}</li>
          ))}
        </ul>
      )}

      <label className="input-label">
        Username or Email
        <input
          type="text"
          value={credential}
          onChange={(e) => setCredential(e.target.value)}
          required
          className="input-field"
        />
      </label>

      <label className="input-label">
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input-field"
        />
      </label>

      <div className="button-group">
        <button type="submit" className="submit-button">Log In</button>
        <button type="button" onClick={handleDemoLogin} className="demo-button">
          Demo User
        </button>
      </div>
    </form>
  );
}

export default LoginForm;

import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import OpenModalButton from "../OpenModalButton/OpenModalButton";
import LoginForm from "../Forms/LoginForm";
import SignupForm from "../Forms/SignupForm";
import { logout } from "../../store/session";
import { useModal } from "../context/Modal";
import logo from "../../assets/logo.png"; // make sure this file exists
import "./NavBar.css";

function NavBar() {
  const user = useSelector((state) => state.session.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { closeModal } = useModal();

  const handleLogout = async () => {
    await dispatch(logout());
    closeModal();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/" className="nav-logo-link">
          <img src={logo} alt="The Fabled Nexus" className="nav-logo" />
        </Link>
        <Link to="/collection" className="nav-link">Collection</Link>
        <Link to="/decks" className="nav-link">Decks</Link>
      </div>

      <div className="nav-right">
        {!user ? (
          <>
            <OpenModalButton
              buttonText="Log In"
              modalComponent={<LoginForm />}
              buttonClass="nav-button"
            />
            <OpenModalButton
              buttonText="Sign Up"
              modalComponent={<SignupForm />}
              buttonClass="nav-button"
            />
          </>
        ) : (
          <div className="profile-dropdown">
            <span className="nav-user">Hi, {user.username}</span>
            <button onClick={handleLogout} className="nav-button">
              Log Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;

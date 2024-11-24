import React, { useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";

const Header = () => {
  const { userInfo, setUserInfo } = useContext(UserContext);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/profile`, {
      credentials: "include",
    }).then((response) => {
      response.json().then((userInfo) => {
        setUserInfo(userInfo);
      });
    });
  }, [setUserInfo]);

  const logout = () => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/logout`, {
      credentials: "include",
      method: "POST",
    });
    setUserInfo(null);
  };
  return (
    <>
      <header>
        <Link to="/" className="logo">
          MyBlog
        </Link>
        <nav>
          {userInfo?.username && (
            <>
              <Link to="/create">Create new post</Link>
              <span style={{ cursor: "pointer" }} onClick={logout}>
                Logout ({userInfo?.username})
              </span>
            </>
          )}

          {!userInfo?.username && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </nav>
      </header>
    </>
  );
};

export default Header;

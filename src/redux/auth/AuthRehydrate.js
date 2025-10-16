import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials } from "./authSlice";
import { useGetUserByIdQuery } from "../loginSlice";


export default function AuthRehydrate() {
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  let userId = null;
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.id ||  null;
    } catch {}
  }
  const { data, isSuccess } = useGetUserByIdQuery(userId, { skip: !userId });

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setCredentials({ user: data, token: token }));
    }
  }, [isSuccess, data, token, dispatch]);

  return null;
}

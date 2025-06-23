import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

export const useReduxStateHook = (navigation, path = "login") => {
  const { loading, error, message } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (error) {
      alert(error);
      dispatch({ type: "clearError" });
    }

    if (message) {
      alert(message);
      dispatch({ type: "clearMessage" });

      // ✅ CRITICAL FIX: Only navigate for auth-related messages
      // Don't navigate for profile/operation success messages
      const shouldNavigate =
        message.includes("Login Successfully") ||
        message.includes("Registeration Success") ||
        message.includes("please login") ||
        message.includes("Logout") ||
        (message.includes("Password Updated") && path === "login"); // Only for password reset flows

      if (shouldNavigate) {
        console.log("🔄 customeHook: Navigating due to auth message:", message);
        navigation.reset({
          index: 0,
          routes: [{ name: path }],
        });
      } else {
        console.log(
          "✅ customeHook: Skipping navigation for non-auth message:",
          message
        );
      }
    }
  }, [error, dispatch, message, navigation, path]);

  return loading;
};

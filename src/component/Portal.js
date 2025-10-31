import { createPortal } from "react-dom";

export default function Portal({ children }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

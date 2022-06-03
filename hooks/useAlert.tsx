import { useContext } from "react";
import { AlertContext } from "../contexts/Alert";

export default function useAlert() {
  return useContext(AlertContext);
}

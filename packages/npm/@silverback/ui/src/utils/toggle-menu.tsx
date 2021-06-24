import { useState } from "react";

export const useMobileMenu = (): [boolean, () => void] => {
  console.log("Clicked");
  const [status, setStatus] = useState<boolean>(false);
  return [status, () => setStatus(!status)];
};

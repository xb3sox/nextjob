import { useEffect, useState } from "react";

export function useElementById(id: string) {
  const [el, setEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // oxlint-disable-next-line react/set-state-in-effect, react/no-deriving-state-in-effects
    setEl(document.getElementById(id));
  }, [id]);

  return el;
}

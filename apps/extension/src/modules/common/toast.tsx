import { useState } from "react";

import { Toaster as ToasterPrimitive } from "@workspace/ui-web/toast";

const Toaster = () => {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <>
      <div ref={setContainer} className="pointer-events-none fixed" />
      {container ? <ToasterPrimitive portal={{ container }} /> : null}
    </>
  );
};

export { Toaster };

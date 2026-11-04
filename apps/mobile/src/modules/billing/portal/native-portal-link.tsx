import { useMutation } from "@tanstack/react-query";

import { useCustomer } from "@workspace/billing-mobile";
import { Button, buttonTextVariants } from "@workspace/ui-mobile/button";
import { Spinner } from "@workspace/ui-mobile/spinner";

export const NativePortalLink = ({
  children,
  store,
  variantId,
  ...props
}: React.ComponentProps<typeof Button> & {
  store: string;
  variantId?: string;
}) => {
  const { linkToPortal } = useCustomer();

  const link = useMutation({
    mutationFn: () => linkToPortal({ store, variantId }),
  });

  return (
    <Button
      {...props}
      onPress={() => link.mutate()}
      disabled={link.isPending || props.disabled}
    >
      {link.isPending ? (
        <Spinner
          className={buttonTextVariants({ variant: props.variant })}
          size={20}
        />
      ) : (
        children
      )}
    </Button>
  );
};

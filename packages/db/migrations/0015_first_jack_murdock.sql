CREATE INDEX "order_customerId_idx" ON "order" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "subscription_customerId_idx" ON "subscription" USING btree ("customer_id");--> statement-breakpoint
CREATE OR REPLACE FUNCTION "public"."delete_customers_on_organization_delete"()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM "public"."customer" WHERE "reference_id" = OLD."id";
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;--> statement-breakpoint
CREATE TRIGGER "delete_customers_on_organization_delete_trigger"
AFTER DELETE ON "public"."organization"
FOR EACH ROW
EXECUTE FUNCTION "public"."delete_customers_on_organization_delete"();
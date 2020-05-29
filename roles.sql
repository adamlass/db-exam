CREATE ROLE "webshop-client" NOINHERIT LOGIN CONNECTION LIMIT 1 VALID UNTIL '2020-06-11 12:00:00+02';

GRANT Insert, References, Select ON TABLE "public"."orders" TO "webshop-client";

GRANT Insert, References, Select ON TABLE "public"."customer" TO "webshop-client";

GRANT Insert, References, Select ON TABLE "public"."orderline" TO "webshop-client";

GRANT References, Select ON TABLE "public"."item" TO "webshop-client";
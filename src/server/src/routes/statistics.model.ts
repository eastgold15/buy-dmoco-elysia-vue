import { t } from "elysia";
import { UnoQuery } from "../utils/common.model";

export const statisticsRouteModel = {

  statisticsQuery: t.Object({
    ...UnoQuery.properties
  }),



}
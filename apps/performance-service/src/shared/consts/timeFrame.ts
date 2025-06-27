import { TimeFrameToAggregateWindowMap } from "@repo/backend-utils/src/constants";

export type TimeFrame = keyof typeof TimeFrameToAggregateWindowMap;

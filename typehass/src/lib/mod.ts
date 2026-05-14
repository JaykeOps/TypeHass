import type { Logger } from "./ha_logger.ts";

import type { EntityId } from "./ha_types.ts";
import type { HomeAssistantWs } from "./ha_ws.ts";

export type TypeHassContext<TEntityId extends EntityId = EntityId> = {
  ha: HomeAssistantWs<TEntityId>;
  logger: Logger;
};

export { createNotifyEntityPublisher } from "./ha_notify_entity.ts";

export type {
  EntityId,
  EntityIdContaining,
  EntityIdInDomain,
  EntityIdOf,
  FilterHassEntitiesByPattern,
  FilterHassEntitiesContaining,
  FilterHassEntitiesStartingWith,
  HassEntities,
  HassState,
  InputSelectEntityId,
  NotifyEntityId,
  NotifyServiceId,
  SensorEntityId,
  ServiceId,
  ServiceIdInDomain,
} from "./ha_types.ts";

export { HomeAssistantWs, type StateChangedEvent } from "./ha_ws.ts";
export { type Logger, createLogger } from "./ha_logger.ts";
export {
  filterEntitiesContaining,
  filterEntitiesStartingWith,
  isEntityIdContaining,
} from "./ha_functions.ts";

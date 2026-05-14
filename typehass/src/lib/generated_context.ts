import type { EntityId, ServiceId } from "typehass/generated";
import type {
  EntityIdInDomain,
  NotifyEntityId,
  SensorEntityId,
  ServiceIdInDomain,
  TypeHassContext,
} from "./mod.ts";

export type GeneratedTypeHassContext = TypeHassContext<EntityId>;

export type GeneratedEntityIdInDomain<Domain extends string> = EntityIdInDomain<
  EntityId,
  Domain
>;

export type GeneratedServiceIdInDomain<Domain extends string> =
  ServiceIdInDomain<ServiceId, Domain>;

export type GeneratedNotifyEntityId = NotifyEntityId<EntityId>;
export type GeneratedSensorEntityId = SensorEntityId<EntityId>;

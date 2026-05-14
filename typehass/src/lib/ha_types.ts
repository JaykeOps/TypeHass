export type EntityId = string;
export type ServiceId = string;

export type HassState<TEntityId extends EntityId = EntityId> = {
  entity_id: TEntityId;
  state: string;
  attributes: Record<string, unknown>;
  last_changed: string;
  last_updated: string;
};

export type HassEntities<TEntityId extends EntityId = EntityId> = Partial<{
  [E in TEntityId]: HassState<E>;
}>;

export type EntityIdOf<THassEntities> = Extract<keyof THassEntities, string>;

type MatchingString<TValue extends string, Pattern extends string> =
  TValue extends Pattern ? TValue
    : Pattern extends TValue ? Pattern
    : never;

export type FilterHassEntitiesByPattern<
  THassEntities,
  Pattern extends string,
> = Pick<
  THassEntities,
  MatchingString<EntityIdOf<THassEntities>, Pattern> & keyof THassEntities
>;

export type FilterHassEntitiesStartingWith<
  THassEntities,
  Prefix extends string,
> = FilterHassEntitiesByPattern<THassEntities, `${Prefix}${string}`>;

export type FilterHassEntitiesContaining<
  THassEntities,
  Substring extends string,
> = FilterHassEntitiesByPattern<THassEntities, `${string}${Substring}${string}`>;

export type EntityIdContaining<
  TEntityId extends string,
  Needle extends string,
> = MatchingString<TEntityId, `${string}${Needle}${string}`>;

export type EntityIdInDomain<
  TEntityId extends string,
  Domain extends string,
> = MatchingString<TEntityId, `${Domain}.${string}`>;

export type InputSelectEntityId<TEntityId extends string = string> =
  EntityIdInDomain<TEntityId, "input_select">;
export type SensorEntityId<TEntityId extends string = string> = EntityIdInDomain<
  TEntityId,
  "sensor"
>;
export type NotifyEntityId<TEntityId extends string = string> = EntityIdInDomain<
  TEntityId,
  "notify"
>;

export type ServiceIdInDomain<
  TServiceId extends string,
  Domain extends string,
> = MatchingString<TServiceId, `${Domain}.${string}`>;

export type NotifyServiceId<TServiceId extends string = string> =
  ServiceIdInDomain<TServiceId, "notify">;

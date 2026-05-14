import type {
  EntityId,
  EntityIdContaining,
  FilterHassEntitiesContaining,
  FilterHassEntitiesStartingWith,
  HassEntities,
} from "./ha_types.ts";

export function filterEntitiesStartingWith<
  TEntityId extends EntityId,
  Prefix extends string,
>(
  entities: HassEntities<TEntityId>,
  prefix: Prefix,
): FilterHassEntitiesStartingWith<HassEntities<TEntityId>, Prefix> {
  return Object.fromEntries(
    Object.entries(entities).filter(([entityId]) =>
      entityId.startsWith(prefix)
    ),
  ) as FilterHassEntitiesStartingWith<HassEntities<TEntityId>, Prefix>;
}

export function filterEntitiesContaining<
  TEntityId extends EntityId,
  Substring extends string,
>(
  entities: HassEntities<TEntityId>,
  substring: Substring,
): FilterHassEntitiesContaining<HassEntities<TEntityId>, Substring> {
  return Object.fromEntries(
    Object.entries(entities).filter(([entityId]) =>
      entityId.includes(substring)
    ),
  ) as FilterHassEntitiesContaining<HassEntities<TEntityId>, Substring>;
}

export function isEntityIdContaining<
  TEntityId extends EntityId,
  Needle extends string,
>(
  needle: Needle,
) {
  return (
    entityId: TEntityId,
  ): entityId is EntityIdContaining<TEntityId, Needle> => {
    return entityId.includes(needle);
  };
}

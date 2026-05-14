import type { EntityId, InputSelectEntityId } from "./ha_types.ts";
import type { HomeAssistantWs } from "./ha_ws.ts";

export function createInputSelectPublisher<
  TEntityId extends EntityId = EntityId,
  Option extends string = string,
>(
  ha: HomeAssistantWs<TEntityId>,
  entityId: InputSelectEntityId<TEntityId>,
) {
  let lastPublishedOption: Option | undefined;

  return {
    publish(option: Option) {
      if (option === lastPublishedOption) return;

      lastPublishedOption = option;

      ha.callService("input_select", "select_option", {
        entity_id: entityId,
        option,
      });
    },
  };
}

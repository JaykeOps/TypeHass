import type { EntityId, InputSelectEntityId } from "./ha_types.ts";
import type { HomeAssistantWs } from "./ha_ws.ts";

export function createInputSelectPublisher<
  Option extends string = string,
  TEntityId extends EntityId = EntityId,
>(
  ha: Pick<HomeAssistantWs, "callService">,
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

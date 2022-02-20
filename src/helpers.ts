import { StateChange } from "../generated/CMS/CMS";
import { handleStateChange } from "./stateChange";
import { Address, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as/assembly/defaults";

export function handleNewStateChanges(events: StateChange[]): void {
  events.forEach((event) => {
    handleStateChange(event)
  })
}

export function createNewStateChangeEvent(
  ownerAddress: string, data: string
): StateChange {
  let mockEvent = newMockEvent()
  let newStateChangeEvent = new StateChange(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  )
  newStateChangeEvent.parameters = []
  let addressParam = new ethereum.EventParam(
    'author',
    ethereum.Value.fromAddress(Address.fromString(ownerAddress))
  )
  const bytes = Bytes.fromByteArray(Bytes.fromHexString(data))
  let dataParam = new ethereum.EventParam('data', ethereum.Value.fromBytes(bytes))

  newStateChangeEvent.parameters.push(addressParam)
  newStateChangeEvent.parameters.push(dataParam)

  return newStateChangeEvent
}

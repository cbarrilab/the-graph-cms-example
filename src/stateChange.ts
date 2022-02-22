import {Address, BigInt, log, ipfs, json, Bytes} from "@graphprotocol/graph-ts"
import { StateChange } from "../generated/CMS/CMS"
import { Content } from "../generated/schema";

export function handleStateChange(event: StateChange): void {
  const id = event.params.id
  let header = event.params.data.toHex().slice(2, 6)
  // header byte 1 is the noun byte 2 is the verb
  let noun = header.slice(0, 2)
  let verb = header.slice(2, 4)
  log.info("noun: {}, verb: {}, id: {}", [noun.toString(), verb.toString(), id.toString()])
  const body = event.params.data.toHex().slice(6)

  log.info("body: {}", [body.toString()])
  let bytes = Bytes.fromHexString("0x1220" + body);
  const hash = ''
  log.info("hash: {}", [hash])

  // content.create
  if (noun.toString() == "03" && verb.toString() == "01") {
    createContent(event.params.author, id, hash)
  }
}

function createContent(owner: Address, id: BigInt, hash: string): void {
  const content = new Content(id.toString());
  content.owner = owner.toString()
  let data = ipfs.cat(hash);
  if (data !== null) {
    log.info("data {}", [Bytes.fromHexString(data.toHexString()).toString()])
    content.metadata = json.fromString(Bytes.fromHexString(data.toHexString()).toString()).toString()
  } else {
    log.warning("data null for id {}", [id.toString()])
  }
  content.save()
}

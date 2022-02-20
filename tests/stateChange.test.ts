import { clearStore, test, assert } from 'matchstick-as/assembly/index'
import { Project } from '../generated/schema'
import { Address, Bytes, log } from "@graphprotocol/graph-ts"
import { CMS, StateChange } from '../generated/CMS/CMS'
import { handleStateChange } from '../src/stateChange'
import {createNewStateChangeEvent, handleNewStateChanges} from "../src/helpers";

test('Can call mappings with custom events', () => {
  // Initialise
  // let stateChange = new CMS('cms01', '0xab62F94EC37E7F8c7a7DA560C6a1B6225362Cd12')
  // stateChange.save()

  log.info('Antes createNewStateChangeEvent', [])
  // Call mappings
  // data: '010201020201030400030415Another Project'
  let newStateChangeEvent = createNewStateChangeEvent(
    '0xFfe64338Ce6c7443858D5286463Bbf4922a0056e',
    '0x303130323031303230323031303330343030303230343132546573742050726f6a656374'
  )
  log.info('Despues createNewStateChangeEvent', [])

  //let anotherStateChangeEvent = createNewStateChangeEvent('0xFfe64338Ce6c7443858D5286463Bbf4922a0056e')

  handleNewStateChanges([newStateChangeEvent])
  log.info('Despues handleNewStateChanges', [])

  assert.fieldEquals('Project', '0002', 'owner', '0xffe64338ce6c7443858d5286463bbf4922a0056e')
  assert.fieldEquals('Project', '0002', 'name', 'Test Project')

  clearStore()
})

test('Next test', () => {
  //...
})


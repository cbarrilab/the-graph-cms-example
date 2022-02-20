import { Address, Bytes, log } from "@graphprotocol/graph-ts"
import { StateChange } from "../generated/CMS/CMS"
import { Project, User, UserProject } from "../generated/schema";
import { store } from '@graphprotocol/graph-ts'

export function handleStateChange(event: StateChange): void {
  // Entities can be loaded from the store using a string ID; this ID
  // needs to be unique across all entities of the same type
  // let entity = ExampleEntity.load(event.transaction.from.toHex())
  log.info('Data toString {}', [event.params.data.toString()])
  const data = event.params.data.toString()
  const tags = new Map<string, string>();

  let i: i32 = 0
  log.info('data length {}', [data.length.toString()])
  while (i < data.length) {
    const tag = data.substring(i, i + 2);
    log.info('tag {}', [tag])
    i += 2;
    const valueLength : i32 = parseInt(data.substring(i, i + 2)) as i32;
    i += 2;
    const value = data.substring(i, i + valueLength);
    i += valueLength;
    tags.set(tag, value);
  }

  // event.params.data has starting 0x and then header and body.
  // tag 01 is the action and tag 02 is the type
  log.info("action and type: {} {}", [tags.get('01'), tags.get('02')])
  // Remaining tags are the data according action and type
  const body: string[] = []
  let bodyKeys = tags.keys().slice(2);
  for (let i = 0; i < bodyKeys.length; i++) {
    body.push(tags.get(bodyKeys[i]));
  }
  log.info("body: {}", [body.join(', ')])

  // noun: create, delete, update
  let action = tags.get('01')
  // noun: project
  let type = tags.get('02')

  log.info("action: {}, type: {}", [action.toString(), type.toString()])
  log.info("body: {}", [body.toString()])
  // create project
  if (action.toString() == "01" && type.toString() == "01") {
    // project id is in tag 03
    let id = tags.get('03')
    // project name is in tag 04
    let name = tags.get('04')
    log.info("create project, ID: {}, name: {}", [id, name])
    createProject(event, id, name)
  }
  // add members to project
  if (action.toString() == "02" && type.toString() == "01") {
    // project id is in tag 03
    let id = tags.get('03')
    // project members are string addresses of the rest of the tags
    const members: string[] = []
    let membersKeys = tags.keys().slice(3);
    for (let i = 0; i < membersKeys.length; i++) {
      members.push(tags.get(membersKeys[i]));
    }
    log.info("member array: {}", members)
    log.info("add members to project, ID: {}, members: {}", [id, members.toString()])
    addMembersToProject(event, id, members)
  }
}

// Note: If a handler doesn't require existing field values, it is faster
// _not_ to load the entity from the store. Instead, create it fresh with
// `new Entity(...)`, set the fields that should be updated and save the
// entity back to the store. Fields that were not set or unset remain
// unchanged, allowing for partial updates to be applied.

// It is also possible to access smart contracts from mappings. For
// example, the contract that has emitted the event can be connected to
// with:
//
// let contract = Contract.bind(event.address)
//
// The following functions can then be called on this contract to access
// state variables and other data:
//
// None


function createProject(event: StateChange, id: string, name: string): void {
  let project = Project.load(id)
  if (project != null) return
  project = new Project(id)
  project.owner = event.params.author
  project.name = name
  project.createdAt = event.block.timestamp
  project.updatedAt = event.block.timestamp
  project.save()
}

function addMembersToProject(event: StateChange, projectId: string, members: string[]): void {
  let project = Project.load(projectId)
  if (project == null) return
  if (project.owner != event.params.author) return
  log.info("Number of project members: {}", [members.length.toString()])
  let projectMembers = project.members
  for (let i = 0; i < members.length; i++) {
    log.info("project member: {}", [members[i]])
    let user = User.load(members[i])
    if (user == null) {
      user = new User(members[i])
      user.save()
    }
    let userProject = UserProject.load(members[i] + "-" + projectId)
    if (userProject == null) {
      userProject = new UserProject(members[i] + "-" + projectId)
      userProject.user = members[i]
      userProject.project = projectId
      userProject.save()
      project.updatedAt = event.block.timestamp
      project.save()
    }
  }
}

function removeMembersFromProject(event: StateChange, projectId: string, members: string[]): void {
  let project = Project.load(projectId)
  if (project == null) return
  if (project.owner != event.params.author) return
  log.info("Number of project members: {}", [members.length.toString()])
  let projectMembers = project.members
  for (let i = 0; i < members.length; i++) {
    log.info("project member: {}", [members[i]])
    let userProject = UserProject.load(members[i] + "-" + projectId)
    if (userProject != null) {
      store.remove('UserProject', members[i] + "-" + projectId)
      project.updatedAt = event.block.timestamp
      project.save()
    }
  }
}

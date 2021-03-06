/*jshint esversion: 6 */
import Dispatcher from './dispatcher';
var Constants = require('./constants');
var CanvasConstants = require('./pages/workspace/maps/editor/canvas-constants');

export default class Actions {

  static openNewWorkspaceDialog() {
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.WORKSPACE_OPEN_NEW_WORKSPACE_DIALOG});
  }

  static closeNewWorkspaceDialog() {
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.WORKSPACE_CLOSE_NEW_WORKSPACE_DIALOG});
  }

  static submitNewWorkspaceDialog(newWorkspaceData) {
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.WORKSPACE_SUBMIT_NEW_WORKSPACE_DIALOG, data: newWorkspaceData});
  }

  static openEditWorkspaceDialog(workspaceID) {
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.WORKSPACE_OPEN_EDIT_WORKSPACE_DIALOG, data: workspaceID});
  }

  static closeEditWorkspaceDialog() {
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.WORKSPACE_CLOSE_EDIT_WORKSPACE_DIALOG});
  }

  static submitEditWorkspaceDialog(workspaceID, newWorkspaceData) {
    Dispatcher.dispatch({
      actionType: Constants.ACTION_TYPES.WORKSPACE_SUBMIT_EDIT_WORKSPACE_DIALOG,
      data: {
        workspaceID: workspaceID,
        newWorkspaceData: newWorkspaceData
      }
    });
  }

  static openNewMapDialog() {
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.MAP_OPEN_NEW_MAP_DIALOG});
  }

  static closeNewMapDialog() {
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.MAP_CLOSE_NEW_MAP_DIALOG});
  }

  static submitNewMapDialog(data) {
    if(!(data.user && data.purpose)){
      throw new Exception('Bad payload for submitNewMapDialog, expected user and purpose, but got', data);
    }
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.MAP_CLOSE_SUBMIT_NEW_MAP_DIALOG, data: data});
  }

  static openEditMapDialog(mapid) {
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.MAP_OPEN_EDIT_MAP_DIALOG, data: mapid});
  }

  static closeEditMapDialog() {
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.MAP_CLOSE_EDIT_MAP_DIALOG});
  }

  static submitEditMapDialog(data) {
    if(!( (data.user && data.purpose) || data.name)){
      throw new Exception('Bad payload for submitEditMapDialog, got', data);
    }
    Dispatcher.dispatch({
      actionType: Constants.ACTION_TYPES.MAP_CLOSE_SUBMIT_EDIT_MAP_DIALOG,
      data: {
        mapID: data.map._id,
        mapData: {
          user: data.user,
          purpose: data.purpose,
          name : data.name
        }
      }
    });
  }

  static openEditNodeDialog(mapID, nodeID) {
    Dispatcher.dispatch({
      actionType: Constants.ACTION_TYPES.MAP_OPEN_EDIT_NODE_DIALOG,
      data: {
        mapID: mapID,
        nodeID: nodeID
      }
    });
  }

  static closeEditNodeDialog() {
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.MAP_CLOSE_EDIT_NODE_DIALOG});
  }

  static submitEditNodeDialog(data) {
    Dispatcher.dispatch({
      actionType: Constants.ACTION_TYPES.MAP_CLOSE_SUBMIT_EDIT_NODE_DIALOG,
      data: {
        mapID: data.map._id,
        nodeID: data.nodeID,
        workspaceID : data.workspaceID,
        params: {
          name: data.name,
          type: data.type
        }
      }
    });
  }

  static palletteDragStopped(type, mapID, data) {
    //cancel highlight of the canvas as the component was dropped and there is no reason to keep it highlighted anymore
    Dispatcher.dispatch({actionType: CanvasConstants.ACTION_TYPES.CANCEL_HIGHLIGHT_CANVAS_AS_DROP_TARGET});
    // process the drop
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.PALETTE_DRAG_STOPPED, type: type, data: data, mapID:mapID});
  }

  static closeNewNodeDialog() {
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.MAP_CLOSE_NEW_NODE_DIALOG});
  }
  static newNodeCreated(data) {
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.MAP_CLOSE_SUBMIT_NEW_NODE_DIALOG, data: data});
  }

  static nodeDragged(workspaceID,mapID, nodeID, newPos) {
    Dispatcher.dispatch({
      actionType: Constants.ACTION_TYPES.CANVAS_NODE_DRAGGED,
      data: {
        mapID: mapID,
        nodeID: nodeID,
        newPos: newPos,
        workspaceID : workspaceID
      }
    });
  }

  static recordConnection(workspaceID, mapID, sourceId, targetId) {
    Dispatcher.dispatch({
      actionType: Constants.ACTION_TYPES.CANVAS_CONNECTION_CREATED,
      data: {
        mapID: mapID,
        sourceID: sourceId,
        targetID: targetId,
        workspaceID : workspaceID
      }
    });
  }

  static deleteConnection(workspaceID, mapID, sourceId, targetId) {
    Dispatcher.dispatch({
      actionType: Constants.ACTION_TYPES.CANVAS_CONNECTION_DELETE,
      data: {
        mapID: mapID,
        workspaceID : workspaceID,
        sourceID: sourceId,
        targetID: targetId
      }
    });
  }

  static removeNode(workspaceID, mapID, nodeID) {
    Dispatcher.dispatch({
      actionType: Constants.ACTION_TYPES.CANVAS_REMOVE_NODE,
      data: {
        workspaceID : workspaceID,
        mapID: mapID,
        nodeID: nodeID
      }
    });
  }

  static archiveMap(workspaceID, mapID) {
    Dispatcher.dispatch({
      actionType: Constants.ACTION_TYPES.MAP_ARCHIVE,
      data: {
        workspaceID: workspaceID,
        mapID: mapID
      }
    });
  }

  static archiveWorkspace(workspaceID) {
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.WORKSPACE_ARCHIVE, data: workspaceID});
  }

  static triggerEditingWorkspace(workspaceID) {
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.TRIGGER_WORKSPACE_EDIT, data: workspaceID});
  }

  static openCreateSubmapDialog(data){
    Dispatcher.dispatch({
      actionType: Constants.ACTION_TYPES.SHOW_SUBMAP_DIALOG,
      data: data
    });
  }

  static closeNewSubmapDialog() {
    Dispatcher.dispatch({actionType: Constants.ACTION_TYPES.MAP_CLOSE_NEW_SUBMAP_DIALOG});
  }

  static createSubmap(name){
    Dispatcher.dispatch({
      actionType: Constants.ACTION_TYPES.MAP_SUBMAP,
      name : name
    });
  }

  static createReferencedSubmap(refMapID){
    Dispatcher.dispatch({
      actionType: Constants.ACTION_TYPES.MAP_REF_SUBMAP,
      refMapID : refMapID
    });
  }

  static openSubmapReferencesDialog(currentName, mapID, submapID){
    Dispatcher.dispatch({
      actionType: Constants.ACTION_TYPES.SHOW_REFERENCES_SUBMAP,
      currentName : currentName,
      mapID : mapID,
      submapID : submapID
    });
  }

  static closeSubmapReferencesDialog(){
    Dispatcher.dispatch({
      actionType: Constants.ACTION_TYPES.CLOSE_REFERENCES_SUBMAP
    });
  }

  static openReferencesDialog(currentName, node, workspaceID){
    Dispatcher.dispatch({
      actionType: Constants.ACTION_TYPES.SHOW_REFERENCES,
      currentName : currentName,
      node : node,
      workspaceID : workspaceID
    });
  }

  static closeReferencesDialog(){
    Dispatcher.dispatch({
      actionType: Constants.ACTION_TYPES.CLOSE_REFERENCES
    });
  }
}

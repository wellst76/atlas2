 /*jshint esversion: 6 */

import React, {PropTypes} from 'react';
import DocumentTitle from 'react-document-title';
import {
  Grid,
  Row,
  Col,
  Jumbotron,
  Button,
  Table,
  ListGroup
} from 'react-bootstrap';
import WorkspaceStore from '../../workspace-store';
import CanvasStore from './canvas-store';
var _ = require('underscore');
import $ from 'jquery';
import Actions from '../../../../actions';
import CanvasActions from './canvas-actions';
var MapComponent = require('./map-component');
import {endpointOptions} from './component-styles';

//one day - make it proper require, but JsPlumb 2.2.0 must be released
/*jshint -W117 */
require('jsplumb');
var jsPlumb = window.jsPlumb;
/*jshint -W117 */

var mapCanvasStyle = { //this is style applied to the place where actuall components can be drawn
  position: 'relative',
  top: 0,
  height: '98%',
  width: '98%',
  left: '2%',
  zIndex: 4
  // backgroundColor: 'silver',
  // backgroundImage: 'transparent url(1x1_transparent.png) repeat center top'
};

var setContainer = function(input) {
  if (input === null) {
    //noop - component was destroyed, no need to worry about draggable
    return;
  }
  jsPlumb.setContainer(input);
};

export default class MapCanvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = CanvasStore.getCanvasState();
    this.handleResize = this.handleResize.bind(this);
    this.setContainer = this.setContainer.bind(this);
    this.beforeDropListener = this.beforeDropListener.bind(this);
    this.componentDidUpdate = this.componentDidUpdate.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.reconcileDependencies = this.reconcileDependencies.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this._onChange = this._onChange.bind(this);
    this.overlayClickHandler = this.overlayClickHandler.bind(this);
  }

  beforeDropListener(connection) {
    var scope = connection.scope;
    // no connection to self
    if (connection.sourceId === connection.targetId) {
      return false;
    }
    // no duplicate connections - TODO: check that in app state
    if (jsPlumb.getConnections({
      scope: scope,
      source: connection.sourceId,
      target: connection.targetId
    }, true).length > 0) {
      //connection already exists, so do not do anything
      return false;
    }
    Actions.recordConnection(this.props.workspaceID, this.props.mapID, connection.sourceId, connection.targetId);
    //never create connection as they will be reconciled
    return false;
  }

  setContainer(input) {
    this.input = input;
    if (input === null) {
      //noop - component was destroyed, no need to worry about draggable
      return;
    }
    jsPlumb.setContainer(input);
    //this method is called multiple times, and we want to have only one listener attached at every point of time
    jsPlumb.unbind("beforeDrop", this.beforeDropListener);
    jsPlumb.bind("beforeDrop", this.beforeDropListener);
  }

  handleResize() {
    if (!this.input) {
      return;
    }
    var coord = {
      offset: {
        top: $(this.input).offset().top,
        left: $(this.input).offset().left
      },
      size: {
        width: $(this.input).width(),
        height: $(this.input).height()
      }
    };
    CanvasActions.updateCanvasSizeAndOffset(coord);
    jsPlumb.repaintEverything();
  }

  componentDidMount() {
    CanvasStore.addChangeListener(this._onChange.bind(this));
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    this.reconcileDependencies();
  }

  componentWillUnmount() {
    CanvasStore.removeChangeListener(this._onChange.bind(this));
    jsPlumb.reset();
    window.removeEventListener('resize', this.handleResize);
  }

  _onChange() {
    this.setState(CanvasStore.getCanvasState());
  }

  componentDidUpdate(prevProps, prevState) {
    this.reconcileDependencies();
  }

  getOverlays() {
    return [
      [
        "Custom", {
          create: function(component) {
            return $("<div><span class='glyphicon glyphicon-remove' style='color: silver;z-index: 30;cursor: pointer'></span></div>");
          },
          location: 0.5,
          id: "deleteOverlay"
        }
      ]
    ];
  }
  overlayClickHandler(obj) {
    if (obj.component) {
      //hurray, overlay clicked. So far there is only one, so it is not an issue
      Actions.deleteConnection(this.props.workspaceID, this.props.mapID, obj.component.sourceId, obj.component.targetId);
      return;
    }
    // we got pure connection
    var conn = obj;
    conn.___overlayVisible = !conn.___overlayVisible;
    conn.getOverlay("deleteOverlay").setVisible(conn.___overlayVisible);
  }

  reconcileDependencies() {
    var modelConnections = [];
    if(!this.props.nodes){
      return;
    }

    for(var i = 0; i < this.props.nodes.length; i++){
      var _node = this.props.nodes[i];
      var iterator_length = _node.outboundDependencies ? _node.outboundDependencies.length : 0;
      for(var j = 0; j < iterator_length;j++){
        modelConnections.push({
            source: _node._id,
            target: _node.outboundDependencies[j],
            scope: jsPlumb.Defaults.Scope
        });
      }
    }

    var canvasConnections = jsPlumb.getConnections();
    var modelIterator = modelConnections.length;
    while (modelIterator--) {
      var isCurrentModelConnectionInTheCanvas = false;
      var canvasIterator = canvasConnections.length;
      var currentModel = modelConnections[modelIterator];
      while (canvasIterator--) {
        var currentCanvas = canvasConnections[canvasIterator];
        if ((currentModel.source === currentCanvas.sourceId) && (currentModel.target === currentCanvas.targetId)) {
          isCurrentModelConnectionInTheCanvas = true;
          //we found graphic equivalent, so we ignore further processing of this element
          canvasConnections.splice(canvasIterator, 1);
        }
      }
      // model connection not found on canvas, create it
      if (!isCurrentModelConnectionInTheCanvas) {
        var connection = jsPlumb.connect({
          source: currentModel.source,
          target: currentModel.target,
          scope: jsPlumb.Defaults.Scope,
          anchors: [
            "BottomCenter", "TopCenter"
          ],
          paintStyle: endpointOptions.connectorStyle,
          endpoint: endpointOptions.endpoint,
          connector: endpointOptions.connector,
          endpointStyles: [
            endpointOptions.paintStyle, endpointOptions.paintStyle
          ],
          overlays: this.getOverlays()
        });
        connection.___overlayVisible = false;
        connection.getOverlay("deleteOverlay").hide();
        connection.bind('click', this.overlayClickHandler);
      }
    }
    //clean up unnecessary canvas connection (no counterpart in model)
    for (var z = 0; z < canvasConnections.length; z++) {
      jsPlumb.detach(canvasConnections[z]);
    }
  }

  render() {
    var style = _.clone(mapCanvasStyle);
    if (this.state.dropTargetHighlight) {
      style = _.extend(style, {
        borderColor: "#00789b",
        boxShadow: "0 0 10px #00789b",
        border: '1px solid #00789b'
      });
    }
    var size = {
      width: 0,
      height: 0
    };
    if (this.state.coords && this.state.coords.size) {
      size = this.state.coords.size;
    }
    var components = null;
    var mapID = this.props.mapID;
    var workspaceID = this.props.workspaceID;
    var state = this.state;
    if (this.props.nodes) {
      components = this.props.nodes.map(function(component) {
        var focused = false;
        for(var i = 0; i < state.currentlySelectedNodes.length; i++){
          if(component._id === state.currentlySelectedNodes[i]){
            focused = true;
          }
        }
        return (<MapComponent workspaceID={workspaceID} mapID={mapID} node={component} size={size} key={component._id} id={component._id} focused={focused} multi={state.multiNodeSelection}/>);
      });
    }
    return (
      <div style={style} ref={input => this.setContainer(input)} onClick={CanvasActions.deselectNodesAndConnections}>
        {components}
      </div>
    );
  }
}

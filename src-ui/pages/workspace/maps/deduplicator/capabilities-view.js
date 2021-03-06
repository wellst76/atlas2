/*jshint esversion: 6 */

import React, {PropTypes} from 'react';
import {
  Grid,
  Row,
  Col,
  Jumbotron,
  Button,
  Table,
  ListGroup,
  Popover,
  OverlayTrigger,
  Glyphicon
} from 'react-bootstrap';
import Actions from './deduplicator-actions';
import _ from "underscore";
var AssignExistingCapabilityDialog = require('./assign-existing-capability');
import {getStyleForType} from './../editor/component-styles';
import MapLink from './maplink.js';
var WMPopover = require('./wm-popover');

var acceptorStyle = {
  width: "100%",
  height: "35px",
  lineHeight: "35px",
  textAlign: "center",
  verticalAlign: "middle",
  margin: "1px",
  color: "white"
};

var capabilityStyle = {
  textAlign: "center"
};

var greyLaneStyle = {
  position: 'absolute',
  left: 1,
  right: 1,
  top: 5,
  height: 20,
  margin: "1px",
  backgroundColor: '#f8f8f8'
};
export default class CapabilitiesView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.state.assignExistingCapabilityDialog =  {
        open: false
    };
  }

  handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'copy';
  }

  handleDropExistingCapability(capability,  e) {
    var item = JSON.parse(e.dataTransfer.getData('json'));
    var newState = {
      assignExistingCapabilityDialog: {
        open: true,
        nodeBeingAssigned: item,
        capability: capability,
      }
    };
    this.setState(newState);
  }

  handleDropNewCapability(cat, e) {
    var item = JSON.parse(e.dataTransfer.getData('json'));
    Actions.createNewCapability(this.props.workspace._id, cat, item._id);
  }

  cancelDialog() {
    var newState = {
      assignExistingCapabilityDialog : {
        open:false
      }
    };
    this.setState(newState);
  }

  submitAssignDialog(nodeBeingAssignedID) {
    var capability = this.state.assignExistingCapabilityDialog.capability;
    Actions.assignNodeToCapability(this.props.workspace._id, capability._id, nodeBeingAssignedID);
    this.setState({
        assignExistingCapabilityDialog: {
          open: false
        }
      });
  }

  submitAssignAlias(nodeBeingAssignedID, aliasID) {
    Actions.assignNodeToAlias(this.props.workspace._id, aliasID, nodeBeingAssignedID);
    this.setState({
        assignExistingCapabilityDialog: {
          open: false
        }
      });
  }

  deleteCapability(capability, e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.stopPropagation();
    Actions.deleteCapability(this.props.workspace._id, capability._id);
  }


  renderSingleNode(node){
    var style = getStyleForType(node.type);
    style.left = node.x * 100 + '%';
    style.position = 'absolute';
    style.top = "10px";
    var workspaceID = this.props.workspace._id;
    var _popover = <Popover id={node._id} title="Component details">
            <WMPopover node={node} workspaceID={workspaceID}/>
        </Popover>;
    return (
      <OverlayTrigger trigger="click" placement="bottom" overlay={_popover}>
        <div style={style}></div>
      </OverlayTrigger>);
  }

  render() {
    var _acceptorStyleToSet = _.clone(acceptorStyle);
    var _capabilityStyleToSet = _.clone(capabilityStyle);
    var _greyLaneStyleToSet = _.clone(greyLaneStyle);
    var greyLaneText = null;
    var _this = this;
    if (this.props.dragStarted) {
      _acceptorStyleToSet = _.extend(_acceptorStyleToSet, {
        borderColor: "#00789b",
        boxShadow: "0 0 10px #00789b",
        border: '1px solid #00789b',
        color: 'black'
      });
      _greyLaneStyleToSet = _.extend(_greyLaneStyleToSet, {
        borderColor: "#00789b",
        boxShadow: "0 0 5px #00789b",
        border: '1px solid #00789b',
        zIndex:20
      });
      greyLaneText = "Drop here if the component does the same what this component";
    }

    var categories = [];
    if(!this.props.categories || !this.props.categories.capabilityCategories){
      return <div> wait...</div>
    }
    this.props.categories.capabilityCategories.forEach(function(category){

      var dragOver = _this.handleDragOver.bind(_this);
      var onDrop = _this.handleDropNewCapability.bind(_this, category._id);

      // first the title
      categories.push(
        <Row className="show-grid" key={category._id}>
          <Col xs={3}>
            <h4>{category.name}</h4>
          </Col>
          <Col xs={9}>
            <div style={_acceptorStyleToSet} onDragOver={dragOver} onDrop={onDrop}>Drop here if nothing in this category does the same job</div>
          </Col>
        </Row>
      );

      category.capabilities.forEach(function(capability){
        console.log('rendering',capability );
        var _itemsToDisplay = [];
        capability.aliases.forEach(function(alias){
          console.log('rendering',alias );
            _itemsToDisplay.push(
              _this.renderSingleNode(alias.nodes[0])
            );
        });
        var name = capability.aliases[0].nodes[0].name;
        categories.push(
          <Row className="show-grid" key={capability._id}>
                      <Col xs={3}>
                        <div style={{
                          textAlign: "right"
                        }}>
                          <h5>{name}</h5>
                        </div>
                      </Col>
                      <Col xs={8}>
                        <div style={_capabilityStyleToSet} onDragOver={dragOver} onDrop={_this.handleDropExistingCapability.bind(_this, capability)}>
                          <div style={_greyLaneStyleToSet}>{greyLaneText}</div>
                          {_itemsToDisplay}
                        </div>
                      </Col>
                      <Col xs={1}>
                        <Button bsSize="xsmall" onClick={_this.deleteCapability.bind(_this, capability)}><Glyphicon glyph="remove"></Glyphicon></Button>
                      </Col>
                    </Row>
        );
      });

    });
    if(categories.length === 0){
      categories.push(<Row className="show-grid">
                  <Col xs={12}>
                    Nothing found
                  </Col>
                </Row>);
    }

    var assignDialogOpen = this.state.assignExistingCapabilityDialog.open;
    var capability = this.state.assignExistingCapabilityDialog.capability;
    var nodeBeingAssigned = this.state.assignExistingCapabilityDialog.nodeBeingAssigned;

    var _this;
    return (
      <Grid fluid={true}>
        {categories}
        <AssignExistingCapabilityDialog
          open={assignDialogOpen}
          nodeBeingAssigned={nodeBeingAssigned}
          capability={capability}
          cancel={_this.cancelDialog.bind(_this)}
          submitAssignDialog={_this.submitAssignDialog.bind(_this)}
          submitAssignAlias={_this.submitAssignAlias.bind(_this)}
          />
      </Grid>
    );
  }
}

import React, { Component } from "react";
import {
  TextArea,
  Container,
  Icon,
  Button,
  Modal,
  Input,
  Form,
  Divider,
} from "semantic-ui-react";
import { connect } from "react-redux";

import * as CommonActions from "../../commonActions";

class IssueModal extends Component {
  state = {
    name: "",
    timeEstimate: 0,
    projectId: 0,
    sprintId: 0,
    modalOpen: false,
    notes: "",
  };

  componentWillMount() {
    const { selectedSprint } = this.props;
    this.setState({
      sprintId: selectedSprint && selectedSprint.id,
    });
  }

  componentDidUpdate(prevProps) {
    const { selectedSprint } = this.props;
    if (
      JSON.stringify(selectedSprint) !==
      JSON.stringify(prevProps.selectedSprint)
    ) {
      this.setState({
        sprintId: selectedSprint && selectedSprint.id,
      });
    }
  }

  handleOpen = () =>
    this.setState({
      modalOpen: true,
    });

  handleClose = () =>
    this.setState({
      modalOpen: false,
    });

  handleName = (event, { value }) => {
    this.setState({
      name: value,
    });
  };

  handleTime = (event, { value }) => {
    this.setState({
      timeEstimate: value,
    });
  };

  handleSprintSelect = (event, { value }) => {
    this.setState({
      sprintId: value,
    });
  };

  handleProjectSelect = (event, { value }) => {
    this.setState({
      projectId: value,
    });
  };

  handleNotes = (event, { value }) => {
    this.setState({
      notes: value,
    });
  };

  handleValidate = () => {
    const { name, sprintId } = this.state;
    return name.length === 0 || sprintId === 0;
  };

  handleSubmit = () => {
    const { sprintId, name, timeEstimate, projectId, notes } = this.state;
    const requestObj = {
      sprintId,
      name,
      timeSpent: 0,
      timeEstimate,
      timeRemaining: timeEstimate,
      status: "In queue", //In queue
      blocked: 0, // not blocked
      projectId,
      notes,
    };
    this.props.createIssue(requestObj);

    // Reset state after submit
    this.setState({
      name: "",
      timeEstimate: 0,
      projectId: 0,
      modalOpen: false,
      notes: "",
    });
  };

  render() {
    const { modalOpen, sprintId, timeEstimate } = this.state;

    const { projects } = this.props;

    return (
      <Modal
        size="mini"
        closeIcon
        centered
        onClose={this.handleClose}
        open={modalOpen}
        trigger={
          <Button icon labelPosition="left" onClick={this.handleOpen} primary>
            <Icon color="red" name="plus" />
            New issue
          </Button>
        }
        className="Modal"
      >
        <Modal.Header textAlign="left">Create Issue</Modal.Header>
        <Container textAlign="left">
          <Form>
            <Form.Field>
              <label>Issue Name</label>
              <Input size="tiny" type="text" onChange={this.handleName} />
            </Form.Field>
            <Form.Field>
              <label>Sprint</label>
            </Form.Field>
            <Form.Field>
              <label>Notes</label>
              <TextArea onChange={this.handleNotes} />
            </Form.Field>
          </Form>
          <Divider />
          <Button
            onClick={this.handleSubmit}
            disabled={this.handleValidate()}
            style={this.padding}
            color="red"
          >
            Create Issue
          </Button>
        </Container>
        <Container textAlign="center" />
      </Modal>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(IssueModal);

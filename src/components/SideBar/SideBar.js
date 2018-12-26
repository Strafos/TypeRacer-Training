import React, { Component } from "react";
import { Grid, Button } from "semantic-ui-react";
import { connect } from "react-redux";

import Modal from "../Modal/Modal";
import SprintMenu from "../SprintMenu/SprintMenu";

class SideBar extends Component {
  render() {
    const { sprintList, projectList, selectedSprint, build } = this.props;

    return (
      <Grid.Column width={3}>
        {build === "dev" && <Grid.Row>DEV BUILD</Grid.Row>}

        <Grid.Row>
          <br />
          <Button.Group color="black" vertical>
            <Modal sprints={sprintList} />
          </Button.Group>
        </Grid.Row>
        <br />

        <Grid.Row>
          <div className="center">
            <SprintMenu sprints={sprintList} />
            <br />
          </div>

          {selectedSprint && (
            <div>
              <br />
            </div>
          )}
        </Grid.Row>

        <br />
      </Grid.Column>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SideBar);

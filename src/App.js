import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Grid } from "semantic-ui-react";
import { connect } from "react-redux";

import "react-datepicker/dist/react-datepicker.css";

import "./semantic/dist/semantic.min.css";
import "./App.css";

import SideBar from "./components/SideBar/SideBar";
import TypingPage from "./screens/TypingPage/TypingPage";

import * as CommonActions from "./commonActions";

class App extends Component {
  state = {};

  componentDidMount() {
    this.props.getSprints();
  }

  render() {
    return (
      <Router>
        <div className="App">
          <Grid.Row>

            <Grid.Column width={13}>
              <Route
                exact
                path="/path/:id?"
                render={props => {
                  return <TypingPage {...props} />;
                }}
              />

            </Grid.Column>
          </Grid.Row>
        </div>
      </Router>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {
  getSprints: CommonActions.getAllSprints,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(App);

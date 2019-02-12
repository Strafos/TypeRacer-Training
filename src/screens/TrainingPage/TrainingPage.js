import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Input,
  Button,
  Form,
  Container,
  Segment,
  Table,
} from "semantic-ui-react";
import Mousetrap from "mousetrap";

import "./TrainingPage.css";

import {
  getText,
  getGhostText,
  getLogs,
  createLog,
  deleteText,
  createSessionLog,
} from "../../utils/api";
import { cleanNumber } from "../../utils/arithUtils";

const charPerWord = 5;
const secondsPerMinute = 60;
const testing = false;

class TypingPage extends Component {
  state = {
    index: 0,
    done: false,
    currWrong: false,
    startTime: null,
    endTime: null,
    id: "",
    text: "",
    typedText: "",
    autoRetry: false,
    gameType: "normal",
    pastLogs: null,
    phase: null,
    phaseCounter: 0,
    data: null,
    history: [],
    done: false,
  };

  phaseLen = {
    Practice: 1,
    Train: 2,
    Test: 4,
    Review: 1,
  };

  componentDidMount() {
    this.newText();
    this.input.focus();
    Mousetrap.bind(["n"], this.newText);
    Mousetrap.bind(["esc"], () => {
      this.input.focus();
    });
  }

  newText = () => {
    const currPhase = this.updatePhase();
    if (currPhase === "Practice") {
      getText().then(typetext => {
        this.setState({
          text: testing
            ? typetext.text
                .slice(-5)
                .split(" ")
                .filter(el => el !== "")
            : typetext.text.split(" ").filter(el => el !== ""),
          title: typetext.pagename,
          id: typetext.id,
          index: 0,
          done: false,
          currWrong: false,
          startTime: null,
          endTime: null,
          typedText: "",
        });
      });
    } else if (currPhase === "Train") {
      getText().then(typetext => {
        getLogs(typetext.id).then(data => {
          this.setState({
            text: testing
              ? typetext.text
                  .slice(-5)
                  .split(" ")
                  .filter(el => el !== "")
              : typetext.text.split(" ").filter(el => el !== ""),
            title: typetext.pagename,
            id: typetext.id,
            index: 0,
            done: false,
            currWrong: false,
            startTime: null,
            endTime: null,
            typedText: "",
            pastLogs: data,
          });
        });
      });
    } else if (currPhase === "Test") {
      getGhostText().then(typetext => {
        this.setState({
          text: testing
            ? typetext.text
                .slice(-5)
                .split(" ")
                .filter(el => el !== "")
            : typetext.text.split(" ").filter(el => el !== ""),
          title: typetext.pagename,
          id: typetext.content_id,
          index: 0,
          done: false,
          currWrong: false,
          startTime: null,
          endTime: null,
          typedText: "",
          pastLogs: typetext.data,
        });
      });
    }
  };

  getWpm = () => {
    const { startTime, endTime, text, index, typedText } = this.state;
    const totalTime = ((endTime || new Date()) - startTime) / 1000;
    const letters =
      text
        .slice(0, Math.max(0, index))
        .reduce((acc, curr) => acc + curr.length, 0) +
      typedText.length -
      1;
    return (
      cleanNumber((letters / totalTime / charPerWord) * secondsPerMinute, 2) | 0
    );
  };

  sendLog = () => {
    const { phase, id, index, text, history, pastLogs } = this.state;
    const semanticGameType = phase === "Practice" ? "practice" : "normal";

    const completion = (index === text.length - 1) | 0;
    const wpm = this.getWpm();
    const logObj = {
      contentId: id,
      date: new Date().toISOString(),
      wpm: wpm.toString(),
      type: semanticGameType,
      complete: completion,
      // The ones below are not needed by the backend
      phase,
      wpmFloat: wpm,
      pastLogs,
    };
    createLog(logObj);
    console.log("Log sent");
    console.log(logObj);

    history.push(logObj);
    this.setState({
      history: history,
    });
  };

  deleteText = () => {
    const { id } = this.state;
    deleteText(id);
    this.newText();
  };

  updatePhase = () => {
    const { phase, phaseCounter, done } = this.state;
    if (phase === null) {
      this.setState({
        phase: "Practice",
        phaseCounter: 1,
      });
      return "Practice";
    }

    if (!done) {
      return phase;
    }

    const newCounter = phaseCounter + 1;
    if (phase === "Practice" && phaseCounter === this.phaseLen[phase]) {
      this.setState({
        phase: "Train",
        phaseCounter: 1,
      });
      return "Train";
    } else if (phase === "Train" && phaseCounter === this.phaseLen[phase]) {
      this.setState({
        phase: "Test",
        phaseCounter: 1,
      });
      return "Test";
    } else if (phase === "Test" && phaseCounter === this.phaseLen[phase]) {
      this.setState({
        phase: "Review",
        phaseCounter: 0,
      });
      return "Review";
    } else {
      this.setState({
        phaseCounter: newCounter,
      });
      return phase;
    }
  };

  handleReview = () => {
    const { history } = this.state;
    console.log(history);
    const practice = history.filter(el => el.phase === "Practice");
    const train = history.filter(el => el.phase === "Train");
    const test = history
      .filter(el => el.phase === "Test")
      .sort((e1, e2) => e2.contentId - e1.contentId);

    const practiceIdArr = practice.map(el => el.contentId);
    const trainIdArr = train.map(el => el.contentId);
    const testIdArr = test.map(el => el.contentId);

    const testAvgPastWpm = test.map(el =>
      cleanNumber(
        el.pastLogs.reduce((acc, curr) => acc + parseFloat(curr.wpm, 10), 0) /
          el.pastLogs.length
      )
    );

    const practiceIds = practiceIdArr.join(",");
    const trainIds = trainIdArr.join(",");
    const testIds = testIdArr.join(",");
    const pastTestWpm = testAvgPastWpm.join(",");

    const practiceWpm = cleanNumber(
      practice.reduce((acc, curr) => acc + curr.wpmFloat, 0) / practice.length
    );
    const trainWpm = cleanNumber(
      train.reduce((acc, curr) => acc + curr.wpmFloat, 0) / train.length
    );
    const testWpm = cleanNumber(
      test.reduce((acc, curr) => acc + curr.wpmFloat, 0) / test.length
    );

    const totalWpm = cleanNumber(
      history.reduce((acc, curr) => acc + curr.wpmFloat, 0) / history.length
    );

    const testWpmDelta = cleanNumber(
      (test.reduce((acc, el) => acc + el.wpmFloat, 0) -
        testAvgPastWpm.reduce((acc, el) => acc + el, 0)) /
        test.length
    );

    const logObj = {
      date: new Date().toISOString(),
      practiceIds,
      practiceWpm,
      trainIds,
      trainWpm,
      testIds,
      testWpm,
      testWpmDelta,
      pastTestWpm,
      totalWpm,
    };
    console.log(logObj);
    createSessionLog(logObj);

    logObj.testAvgPastWpm = testAvgPastWpm;
    logObj.test = test;

    return logObj;
  };

  handleTypedText = (event, { value }) => {
    const { typedText, index, startTime, text } = this.state;
    if (startTime === null || (index === 0 && typedText === "")) {
      this.setState({
        startTime: new Date(),
      });
    }
    if (value === text[index] + " ") {
      this.setState({
        index: index + 1,
        typedText: "",
        currWrong: false,
      });
    } else if (value === " " && typedText === "") {
      this.setState({
        typedText: "",
      });
    } else if (index === text.length - 1 && value === text[index]) {
      this.setState({
        index: index + 1,
        typedText: "",
        currWrong: false,
        done: true,
        endTime: new Date(),
      });
      this.sendLog();
    } else {
      this.setState({
        typedText: value,
        currWrong: !text[index].startsWith(value),
      });
    }
  };

  renderReview = () => {
    const {
      trainWpm,
      testWpm,
      testWpmDelta,
      totalWpm,
      test,
      testAvgPastWpm,
    } = this.handleReview();

    return (
      <div>
        <Table sortable fixed celled size="large" compact>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Train WPM</Table.HeaderCell>
              <Table.HeaderCell>Test WPM</Table.HeaderCell>
              <Table.HeaderCell>Total WPM</Table.HeaderCell>
              <Table.HeaderCell>Test WPM Delta</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            <Table.Row>
              <Table.Cell>{trainWpm}</Table.Cell>
              <Table.Cell>{testWpm}</Table.Cell>
              <Table.Cell>{totalWpm}</Table.Cell>
              <Table.Cell>{testWpmDelta}</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>

        <Table sortable fixed celled size="large" compact>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell />
              {test.map(el => (
                <Table.HeaderCell>{"Id: " + el.contentId}</Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body key={0}>
            <Table.Row>
              <Table.Cell>{"Test WPM"}</Table.Cell>
              {test.map(el => (
                <Table.Cell>{el.wpm}</Table.Cell>
              ))}
            </Table.Row>
          </Table.Body>
          <Table.Body key={1}>
            <Table.Row>
              <Table.Cell>{"Past Avg WPM"}</Table.Cell>
              {testAvgPastWpm.map(el => (
                <Table.Cell>{el}</Table.Cell>
              ))}
            </Table.Row>
          </Table.Body>
        </Table>
      </div>
    );
  };

  render() {
    const {
      index,
      typedText,
      currWrong,
      done,
      text,
      title,
      id,
      phase,
      phaseCounter,
    } = this.state;

    const wrong = { backgroundColor: "red" };
    const correct = { backgroundColor: "#90ee90" };

    let prev = "";
    let curr = "";
    let next = "";
    if (text) {
      prev = text.slice(0, index).join(" ") + " ";
      curr = text[index];
      next = " " + text.slice(index + 1, text.length).join(" ");
    }

    return (
      <Container>
        {phase !== "Review" ? (
          <div>
            <Segment style={{ fontSize: "25px" }} textAlign="left">
              <p>
                <span>{"Training Mode"}</span>
                <br />
                <span>
                  {"Current Phase: " +
                    phase +
                    " " +
                    phaseCounter +
                    "/" +
                    this.phaseLen[phase]}
                </span>
                <br />
                <span>{title}</span>
                <br />
                <span>{"ID: " + id}</span>
              </p>
            </Segment>
            <Segment style={{ fontSize: "30px" }} textAlign="left">
              <p>
                <span>{prev}</span>
                <span style={currWrong ? wrong : correct}>{curr}</span>
                <span>{next}</span>
              </p>
            </Segment>
            <Form>
              <Form.Field>
                <Input
                  size="large"
                  style={{ fontSize: "25px" }}
                  disabled={done}
                  type="text"
                  value={typedText}
                  onChange={this.handleTypedText}
                  ref={input => {
                    this.input = input;
                  }}
                />
              </Form.Field>
            </Form>
          </div>
        ) : (
          <div>
            <Segment style={{ fontSize: "25px" }} textAlign="left">
              <p>
                <span>{"Training Mode"}</span>
                <br />
                <span>{"Current Phase: " + phase}</span>
              </p>
            </Segment>
            {this.renderReview()}
          </div>
        )}
        <br />
        <Button color="red" onClick={this.deleteText}>
          Delete Text
        </Button>
      </Container>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TypingPage);

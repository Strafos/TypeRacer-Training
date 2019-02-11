import React, { Component } from "react";
import { connect } from "react-redux";
import {
  Input,
  Button,
  Checkbox,
  Form,
  Container,
  Segment,
  Table,
} from "semantic-ui-react";
import TimeAgo from "react-timeago";
import Mousetrap from "mousetrap";

import "./TrainingPage.css";

import {
  getText,
  getGhostText,
  getLogs,
  createLog,
  deleteText,
} from "../../utils/api";
import { cleanNumber } from "../../utils/arithUtils";

const charPerWord = 5;
const secondsPerMinute = 60;

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
    phase: "Practice",
    phaseCounter: 0,
  };

  phaseLen = {
    Practice: 1,
    Train: 1,
    Test: 1,
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
    const { phase, done } = this.state;
    if (done) {
      this.updatePhase();
    }
    if (phase === "Practice") {
      getText().then(typetext => {
        this.setState({
          text: typetext.text.split(" ").filter(el => el !== ""),
          title: typetext.pagename,
          id: typetext.content_id,
          index: 0,
          done: false,
          currWrong: false,
          startTime: null,
          endTime: null,
          typedText: "",
        });
      });
    } else if (phase === "Train") {
      getText().then(typetext => {
        getLogs(typetext.id).then(data => {
          this.setState({
            text: typetext.text.split(" ").filter(el => el !== ""),
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
    } else if (phase === "Test") {
      getText().then(typetext => {
        getLogs(typetext.id).then(data => {
          this.setState({
            text: typetext.text.split(" ").filter(el => el !== ""),
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
    const { phase, id, index, text } = this.state;
    const semanticGameType = phase === "Practice" ? "practice" : "normal";

    const completion = (index === text.length - 1) | 0;
    const wpm = this.getWpm();
    if (wpm > 30) {
      const logObj = {
        contentId: id,
        date: new Date().toISOString(),
        wpm: wpm.toString(),
        type: semanticGameType,
        complete: completion,
      };
      createLog(logObj);
      console.log("Log sent");
      console.log(logObj);
    }
  };

  deleteText = () => {
    const { id } = this.state;
    deleteText(id);
    this.newText();
  };

  updatePhase = () => {
    const { phase, phaseCounter } = this.state;
    const newCounter = phaseCounter + 1;
    if (phase === "Practice" && newCounter === this.phaseLen[phase]) {
      this.setState({
        phase: "Train",
        phaseCounter: 0,
      });
    } else if (phase === "Train" && newCounter === this.phaseLen[phase]) {
      this.setState({
        phase: "Test",
        phaseCounter: 0,
      });
    } else if (phase === "Test" && newCounter === this.phaseLen[phase]) {
      this.setState({
        phase: "Review",
        phaseCounter: 0,
      });
    } else {
      this.setState({
        phaseCounter: newCounter,
      });
    }
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

  renderHistoryRow = log => {
    return (
      <Table.Body key={log.id}>
        <Table.Row>
          <Table.Cell>
            <TimeAgo date={log.date} />
          </Table.Cell>
          <Table.Cell>{log.wpm}</Table.Cell>
          <Table.Cell>{log.date}</Table.Cell>
        </Table.Row>
      </Table.Body>
    );
  };

  renderHistoryTable = () => {
    const { pastLogs } = this.state;
    let totalWPM = 0;
    pastLogs.map(log => (totalWPM = totalWPM + parseInt(log.wpm)));
    return (
      <Table sortable fixed celled size="large" compact>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Time Ago</Table.HeaderCell>
            <Table.HeaderCell>Wpm</Table.HeaderCell>
            <Table.HeaderCell>Date</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        {pastLogs.map(this.renderHistoryRow)}
        <Table.Footer fullWidth>
          <Table.Row>
            <Table.HeaderCell textAlign="center" colSpan="3">
              {`Average WPM: ${totalWPM / pastLogs.length}`}
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
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
        {/* {done && <p style={{ fontSize: "25px" }}>{this.getWpm()} wpm</p>} */}
        {/* {done &&
          this.state.pastLogs &&
          this.state.pastLogs.length > 0 &&
          this.renderHistoryTable()} */}
        <br />
        <Button disabled={!done} color="green" onClick={this.newText}>
          New Text
        </Button>
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

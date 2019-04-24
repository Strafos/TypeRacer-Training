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

import "./TypingPage.css";

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
    correctLetters: 0,
  };

  componentDidMount() {
    this.newText();
    this.input.focus();
    Mousetrap.bind(["r"], this.retry);
    Mousetrap.bind(["n"], this.newText);
    Mousetrap.bind(["esc"], () => {
      this.retry();
      this.input.focus();
    });
  }

  retry = () => {
    // Retry the current text
    this.setState({
      index: 0,
      typedText: "",
      done: false,
      currWrong: false,
      startTime: null,
    });
  };

  newText = () => {
    const { gameType } = this.state;
    if (gameType === "ghost") {
      getGhostText().then(typetext => {
        this.setState({
          text: typetext.text.split(" ").filter(el => el !== ""),
          title: typetext.pagename,
          id: typetext.content_id,
          index: 0,
          done: false,
          currWrong: false,
          startTime: null,
          endTime: null,
          correctLetters: 0,
          typedText: "",
          pastLogs: typetext.data,
        });
      });
    } else {
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
            correctLetters: 0,
            typedText: "",
            pastLogs: data,
          });
        });
      });
    }
  };

  getWpm = () => {
    const { startTime, endTime, correctLetters } = this.state;
    const totalTime = ((endTime || new Date()) - startTime) / 1000;
    console.log(totalTime);
    return (
      cleanNumber(
        (correctLetters / totalTime / charPerWord) * secondsPerMinute,
        2
      ) | 0
    );
  };

  sendLog = () => {
    const { gameType, id, index, text } = this.state;
    if (gameType === "practice") {
      return;
    }
    const semanticGameType = gameType === "ghost" ? "normal" : gameType;
    const completion = (index === text.length) | 0;
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

  handleTypedText = (event, { value }) => {
    const {
      typedText,
      index,
      startTime,
      text,
      gameType,
      autoRetry,
      correctLetters,
    } = this.state;
    if (startTime === null || (index === 0 && typedText === "")) {
      // Start new text
      this.setState({
        startTime: new Date(),
      });
    }
    if (value === text[index] + " ") {
      // Finish a word
      this.setState({
        index: index + 1,
        typedText: "",
        currWrong: false,
        correctLetters: correctLetters + text[index].length + 1,
      });
    } else if (value === " " && typedText === "") {
      // Null case of space on empty
      this.setState({
        typedText: "",
      });
    } else if (index === text.length - 1 && value === text[index]) {
      // Finish text
      this.setState(
        {
          index: index + 1,
          typedText: "",
          currWrong: false,
          done: true,
          endTime: new Date(),
          correctLetters: correctLetters + text[index].length,
        },
        this.sendLog
      );
    } else if (gameType === "sudden death" && !text[index].startsWith(value)) {
      // Sudden death loss
      if (autoRetry) {
        this.setState(
          {
            index: 0,
            typedText: "",
            endTime: new Date(),
            correctLetters: correctLetters + typedText.length - 1,
          },
          this.sendLog
        );
      } else {
        this.setState(
          {
            typedText: value,
            currWrong: true,
            done: true,
            endTime: new Date(),
            correctLetters: correctLetters + typedText.length - 1,
          },
          this.sendLog
        );
      }
    } else {
      // Fallthrough case
      this.setState({
        typedText: value,
        currWrong: !text[index].startsWith(value),
      });
    }
  };

  handleGameChange = (e, { value }) => this.setState({ gameType: value });

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
    const { index, typedText, currWrong, done, text, title, id } = this.state;

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
        {done && <p style={{ fontSize: "25px" }}>{this.getWpm()} wpm</p>}
        {done &&
          this.state.pastLogs &&
          this.state.pastLogs.length > 0 &&
          this.renderHistoryTable()}
        <br />
        <Button disabled={!done} color="green" onClick={this.newText}>
          New Text
        </Button>
        <Button color="red" onClick={this.deleteText}>
          Delete Text
        </Button>
        <Form>
          <Form.Field>
            Selected value: <b>{this.state.gameType}</b>
          </Form.Field>
          <Form.Field>
            <Checkbox
              radio
              label="Sudden Death Mode"
              name="checkboxRadioGroup"
              value="sudden death"
              checked={this.state.gameType === "sudden death"}
              onChange={this.handleGameChange}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              radio
              label="Normal Mode"
              name="checkboxRadioGroup"
              value="normal"
              checked={this.state.gameType === "normal"}
              onChange={this.handleGameChange}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              radio
              label="Practice Mode"
              name="checkboxRadioGroup"
              value="practice"
              checked={this.state.gameType === "practice"}
              onChange={this.handleGameChange}
            />
          </Form.Field>
          <Form.Field>
            <Checkbox
              radio
              label="Ghost Mode"
              name="checkboxRadioGroup"
              value="ghost"
              checked={this.state.gameType === "ghost"}
              onChange={this.handleGameChange}
            />
          </Form.Field>
        </Form>
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

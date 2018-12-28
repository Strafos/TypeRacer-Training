import React, { Component } from "react";
import { connect } from "react-redux";
import { Input, Button, Form, Container, Segment } from "semantic-ui-react";

import "./TypingPage.css";

import { getText, createLog } from "../../utils/api";
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
    gameType: "sudden death",
  };

  componentDidMount() {
    this.newText();
  }

  newText = () => {
    getText().then(typetext => {
      console.log(typetext.text);
      console.log(typetext.text.split(" ").filter(el => el !== ""));
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
      });
    });
    this.input.focus();
  };

  getWpm = () => {
    const { startTime, endTime, text, index } = this.state;
    const totalTime = ((endTime || new Date()) - startTime) / 1000;
    const letters = text
      .slice(0, Math.max(0, index))
      .reduce((acc, curr) => acc + curr.length, 0);
    return cleanNumber(
      (letters / totalTime / charPerWord) * secondsPerMinute,
      2
    );
  };

  sendLog = () => {
    const { gameType, id, index, text, retry } = this.state;
    const completion = (index === text.length - 1) | 0;
    const wpm = this.getWpm();
    if (wpm > 30) {
      const logObj = {
        contentId: id,
        date: new Date().toISOString(),
        wpm: wpm.toString(),
        type: gameType,
        complete: completion,
      };
      createLog(logObj);
    }
  };

  handleTypedText = (event, { value }) => {
    const { index, startTime, text, gameType, autoRetry } = this.state;
    if (startTime === null) {
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
    } else if (index === text.length - 1 && value === text[index]) {
      this.setState({
        index: index + 1,
        typedText: "",
        currWrong: false,
        done: true,
        endTime: new Date(),
      });
      this.sendLog();
    } else if (gameType === "sudden death" && !text[index].startsWith(value)) {
      if (autoRetry) {
        this.sendLog();
        this.setState({
          index: 0,
          typedText: "",
        });
      } else {
        this.setState({
          typedText: value,
          currWrong: true,
          done: true,
          endTime: new Date(),
        });
        this.sendLog();
      }
    } else {
      this.setState({
        typedText: value,
        currWrong: !text[index].startsWith(value),
        done: !text[index].startsWith(value),
        endTime: !text[index].startsWith(value) ? new Date() : null,
      });
    }
  };

  render() {
    const { index, typedText, currWrong, done, text } = this.state;

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
        {done && <p>{this.getWpm()} wpm</p>}
        <Button disabled={!done} color="green" onClick={this.newText}>
          New Text
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

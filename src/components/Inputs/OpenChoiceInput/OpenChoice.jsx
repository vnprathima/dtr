import React, { Component } from "react";

import "./OpenChoice.css";
import "../../ComponentStyles.css";
import { getListOfChoices } from "../../../util/util.js";

export default class OpenChoice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      values: [],
      open: false,
      choices: [],
      display: ""
    };

    this.onInputChange = this.onInputChange.bind(this);
    this.setChoice = this.setChoice.bind(this);
    this.ref = React.createRef();
  }

  componentWillUnmount() {
    this.props.updateCallback(
      this.props.item.linkId,
      {
        type: this.props.inputTypeDisplay,
        text: this.props.item.text,
        valueType: "valueCoding",
        ref: this.ref,
        enabled: false
      },
      "itemTypes"
    );
  }

  componentWillMount() {
    const returnAnswer = getListOfChoices(this.props, this.setChoice);
    if (returnAnswer) {
      this.setState({ values: [returnAnswer] });
      if (!this.props.item.repeats) {
        this.setState({ display: returnAnswer.display });
      }
      this.props.updateCallback(this.props.item.linkId, returnAnswer, "values");
    }
  }

  componentDidMount() {
    const value = this.props.retrieveCallback(this.props.item.linkId);
    this.autofill(this.state.choices, value);
    this.props.updateCallback(
      this.props.item.linkId,
      {
        type: this.props.inputTypeDisplay,
        text: this.props.item.text,
        valueType: "valueCoding",
        ref: this.ref,
        enabled: true
      },
      "itemTypes"
    );
  }

  autofill(choices, values) {
    const options = [];
    values &&
      values.forEach(value => {
        let found = choices.some(choice => {
          if (choice.code === value || choice.code === value.code) {
            options.push(choice);
            return true;
          }
        });
        if (!found) {
          // manually entered info
          options.push(value);
        }
      });

    if (options.length > 0) {
      if (this.props.item.repeats) {
        this.addOption(options);
        // if the options are dynamic, pull them from the list of the values string
        if (choices.length === 0) {
          options
            .map(option => {
              return { code: option, display: option };
            })
            .forEach(pair => this.setChoice(pair));
        }
      } else {
        this.addOption(options[0]);
      }
    }
  }

  onInputChange(event) {
    if (!this.props.item.repeats) {
      this.addOption({ display: event.target.value });
    } else {
      this.setState({ display: event.target.value });
    }
  }

  setChoice(pair) {
    this.setState(previousState => ({
      choices: [...previousState.choices, pair]
    }));
  }

  addOption(e) {
    let newArray;
    if (this.props.item.repeats) {
      if (Array.isArray(e)) {
        newArray = [...this.state.values, ...e];
      } else {
        newArray = [...this.state.values, e];
      }
    } else {
      newArray = [e];
    }

    this.setState({ values: newArray });
    this.props.updateCallback(this.props.item.linkId, newArray, "values");

    if (!this.props.item.repeats) {
      this.setState({ display: e.display });
      this.props.updateCallback(
        this.props.item.linkId,
        {
          type: this.props.inputTypeDisplay,
          text: this.props.item.text,
          valueType: "valueCoding",
          ref: this.ref,
          enabled: true
        },
        "itemTypes"
      );
    }

    return newArray;
  }

  saveToDisplay(e) {
    if (this.props.item.repeats) {
      if (this.state.display.trim().length > 0) {
        if (
          this.state.values.filter(el => {
            return el.display.trim() === this.state.display.trim();
          }).length === 0
        ) {
          this.addOption({ display: this.state.display });
        }
      }
      this.setState({ display: "" });
    } else {
      e.target.blur();
    }
  }
  render() {
    return (
      <div className="open-choice" ref={this.ref}>
        <div className="text-input-label">{this.props.item.type}</div>
        <div className="dropdown">
          <div
            className={
              "dropdown-input " +
              (this.props.item.repeats ? "repeated-choice" : "")
            }
            tabIndex="0"
            onBlur={e => {
              this.setState({ open: false });
              this.saveToDisplay(e);
            }}
            onClick={() => {
              this.myInp.focus();
              this.setState(prevState => ({
                open: true
              }));
            }}
          >
            {this.props.item.repeats
              ? this.state.values.map(value => {
                  return (
                    <a
                      key={value.display}
                      className="selected-value"
                      onClick={() => {
                        const newArray = this.state.values.filter(e => {
                          return e.display !== value.display;
                        });
                        this.setState({ values: newArray });
                        this.props.updateCallback(
                          this.props.item.linkId,
                          newArray,
                          "values"
                        );
                      }}
                      onMouseDown={event => {
                        event.preventDefault();
                      }}
                    >
                      {value.display}
                    </a>
                  );
                })
              : null}

            <input
              ref={ip => (this.myInp = ip)}
              value={this.state.display}
              style={{ width: this.state.display.length + 2 + "ch" }}
              className={
                "input-block top-block " +
                (this.props.item.repeats ? "repeated-input" : "")
              }
              spellCheck="false"
              onChange={this.onInputChange}
              onKeyPress={e => {
                if (e.key === "Enter") {
                  this.saveToDisplay(e);
                }
              }}
            />

            <div
              className={
                "dropdown-block option-block " +
                (this.state.open ? "" : "hide-block ") +
                (this.props.item.repeats ? "repeated-choice" : "")
              }
            >
              {this.state.choices.map(e => {
                if (
                  this.state.values.filter(el => {
                    return el.display === e.display;
                  }).length === 0
                ) {
                  return (
                    <div
                      key={e.code}
                      className="unselected-option"
                      onClick={() => this.addOption(e)}
                      // prevent the dropdown from stealing focus and closing
                      onMouseDown={event => {
                        event.preventDefault();
                      }}
                    >
                      {e.display}
                    </div>
                  );
                }
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

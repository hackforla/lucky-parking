import React from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "./geosearch.css";

class Geosearch extends React.Component {
  state = {
    startDate: new Date(),
    endDate: new Date(),
  };

  handleStartDateChange = (date) => {
    this.setState({
      startDate: date,
    });
  };

  handleEndDateChange = (date) => {
    this.setState({
      endDate: date,
    });
  };

  render() {
    return (
      <div className="geosearch">
        <div className="geosearch__main">
          From :
          <DatePicker
            selected={this.state.startDate}
            onChange={this.handleStartDateChange}
          />
          <select
            className="geosearch__main-time-select"
            style={{ "margin-right": "5rem" }}
          >
            <option>12:00 AM</option>
            <option>12:30 AM</option>
            <option>1:00 AM</option>
            <option>1:30 AM</option>
            <option>2:00 AM</option>
            <option>2:30 AM</option>
            <option>3:00 AM</option>
            <option>3:30 AM</option>
            <option>4:00 AM</option>
            <option>4:30 AM</option>
            <option>5:00 AM</option>
            <option>5:30 AM</option>
            <option>6:00 AM</option>
            <option>6:30 AM</option>
            <option>7:00 AM</option>
            <option>7:30 AM</option>
            <option>8:00 AM</option>
            <option>8:30 AM</option>
            <option>9:00 AM</option>
            <option>9:30 AM</option>
            <option>10:00 AM</option>
            <option>10:30 AM</option>
            <option>11:00 AM</option>
            <option>11:30 AM</option>
            <option>12:00 PM</option>
            <option>12:30 PM</option>
            <option>1:00 PM</option>
            <option>1:30 PM</option>
            <option>2:00 PM</option>
            <option>2:30 PM</option>
            <option>3:00 PM</option>
            <option>3:30 PM</option>
            <option>4:00 PM</option>
            <option>4:30 PM</option>
            <option>5:00 PM</option>
            <option>5:30 PM</option>
            <option>6:00 PM</option>
            <option>6:30 PM</option>
            <option>7:00 PM</option>
            <option>7:30 PM</option>
            <option>8:00 PM</option>
            <option>8:30 PM</option>
            <option>9:00 PM</option>
            <option>9:30 PM</option>
            <option>10:00 PM</option>
            <option>10:30 PM</option>
            <option>11:00 PM</option>
            <option>11:30 PM</option>
          </select>
          To :
          <DatePicker
            selected={this.state.endDate}
            onChange={this.handleEndDateChange}
          />
          <select className="geosearch__main-time-select">
            <option>12:00 AM</option>
            <option>12:30 AM</option>
            <option>1:00 AM</option>
            <option>1:30 AM</option>
            <option>2:00 AM</option>
            <option>2:30 AM</option>
            <option>3:00 AM</option>
            <option>3:30 AM</option>
            <option>4:00 AM</option>
            <option>4:30 AM</option>
            <option>5:00 AM</option>
            <option>5:30 AM</option>
            <option>6:00 AM</option>
            <option>6:30 AM</option>
            <option>7:00 AM</option>
            <option>7:30 AM</option>
            <option>8:00 AM</option>
            <option>8:30 AM</option>
            <option>9:00 AM</option>
            <option>9:30 AM</option>
            <option>10:00 AM</option>
            <option>10:30 AM</option>
            <option>11:00 AM</option>
            <option>11:30 AM</option>
            <option>12:00 PM</option>
            <option>12:30 PM</option>
            <option>1:00 PM</option>
            <option>1:30 PM</option>
            <option>2:00 PM</option>
            <option>2:30 PM</option>
            <option>3:00 PM</option>
            <option>3:30 PM</option>
            <option>4:00 PM</option>
            <option>4:30 PM</option>
            <option>5:00 PM</option>
            <option>5:30 PM</option>
            <option>6:00 PM</option>
            <option>6:30 PM</option>
            <option>7:00 PM</option>
            <option>7:30 PM</option>
            <option>8:00 PM</option>
            <option>8:30 PM</option>
            <option>9:00 PM</option>
            <option>9:30 PM</option>
            <option>10:00 PM</option>
            <option>10:30 PM</option>
            <option>11:00 PM</option>
            <option>11:30 PM</option>
          </select>
        </div>
      </div>
    );
  }
}

export default Geosearch;

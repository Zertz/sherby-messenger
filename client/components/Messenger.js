import React, { Fragment, PureComponent } from "react";
import io from "socket.io-client";

import MessageList from "./MessageList";

class Messenger extends PureComponent {
  state = { connectedUsers: 0, message: "", socket: null, token: null };

  componentDidMount() {
    const socket = io("https://slack-jirafe.fwd.wf/");
    const token = window.localStorage.getItem("user:token");

    socket.on("user:connect", this.handleConnect);

    this.setState(
      {
        socket
      },
      () => {
        if (token) {
          this.handleToken(token);
        } else {
          socket.on("user:token", this.handleToken);
        }
      }
    );
  }

  componentWillUnmount() {
    const { socket } = this.state;

    socket.off("user:connect", this.handleConnect);

    socket.close();
  }

  handleChange = e => {
    const {
      target: { name, value }
    } = e;

    this.setState({ [name]: value });
  };

  handleConnect = connectedUsers => {
    this.setState({
      connectedUsers
    });
  };

  handleSubmit = e => {
    const { message, socket, token } = this.state;

    e.preventDefault();

    socket.emit("message:create", JSON.stringify({ message, token }));

    this.setState({
      message: ""
    });
  };

  handleToken = token => {
    const { socket } = this.state;

    socket.off("user:token", this.handleToken);

    localStorage.setItem("user:token", token);

    this.setState({
      token
    });
  };

  render() {
    const { connectedUsers, message, socket, token } = this.state;

    return (
      <section>
        <style jsx>{`
          section {
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: absolute;
            top: 0.5em;
            right: 0.5em;
            bottom: 0.5em;
            left: 0.5em;
          }

          .User {
            font-size: 1rem;
            margin-bottom: 0.5em;
            text-align: center;
            word-wrap: break-word;
          }

          form {
            display: flex;
            flex-shrink: 0;
          }

          input,
          button {
            border: 1px solid #ccc;
          }

          input {
            flex-grow: 1;
            font-size: 1rem;
            margin-right: 0.5em;
            padding: 1em;
          }

          button[type="submit"] {
            flex-shrink: 0;
            cursor: pointer;
            font-size: 1rem;
            padding: 1em;
          }
        `}</style>
        <div className="User">
          <p>{token ? token : "Connecting..."}</p>
          <p>{`Utilisateurs: ${connectedUsers}`}</p>
        </div>
        <MessageList socket={socket} token={token} />
        <form onSubmit={this.handleSubmit}>
          <input
            autoComplete="off"
            autoFocus
            type="text"
            name="message"
            value={message}
            onChange={this.handleChange}
          />
          <button type="submit">Envoyer</button>
        </form>
      </section>
    );
  }
}

export default Messenger;

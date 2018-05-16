import React, { PureComponent } from "react";
import io from "socket.io-client";

import Message from "./Message";

class MessageList extends PureComponent {
  state = { messages: [] };

  componentWillReceiveProps(nextProps) {
    const { socket, token } = this.props;

    if (!token && nextProps.token) {
      socket.on("message:fetch", this.handleFetch);
      socket.emit("message:fetch");
    }
  }

  componentWillUnmount() {
    const { socket } = this.props;

    socket.off("message:create", this.handleCreate);
    socket.off("message:delete", this.handleDelete);
  }

  handleCreate = message => {
    this.setState(
      prevState => ({
        messages: prevState.messages.concat(message)
      }),
      () => {
        this.ref.scrollTop = this.ref.scrollHeight;
      }
    );
  };

  handleDelete = _id => {
    const { messages } = this.state;

    this.setState(prevState => ({
      messages: prevState.messages.filter(m => m._id !== _id)
    }));
  };

  handleFetch = messages => {
    const { socket } = this.props;

    socket.off("message:fetch", this.handleFetch);

    this.setState(
      {
        messages: JSON.parse(messages)
      },
      () => {
        this.ref.scrollTop = this.ref.scrollHeight;

        socket.on("message:create", this.handleCreate);
        socket.on("message:delete", this.handleDelete);
      }
    );
  };

  render() {
    const { socket, token } = this.props;
    const { messages } = this.state;

    return (
      <div className="MessageList" ref={ref => (this.ref = ref)}>
        <style jsx>{`
          .MessageList {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            background-color: #fefefe;
            font-size: 1rem;
            margin-bottom: 0.5em;
            overflow-x: hidden;
            overflow-y: scroll;
            padding: 0.5em;
          }

          hr {
            margin: 0.5em 0;
            padding: 0;
          }
        `}</style>
        {messages.map(message => (
          <Message
            key={message._id}
            message={message}
            socket={socket}
            token={token}
          />
        ))}
      </div>
    );
  }
}

export default MessageList;

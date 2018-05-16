import React, { PureComponent } from "react";
import io from "socket.io-client";

import Message from "./Message";

class MessageList extends PureComponent {
  state = { messages: [] };

  componentWillReceiveProps(nextProps) {
    const { socket, token } = this.props;

    if (!token && nextProps.token) {
      socket.on("message:read", this.handleRead);
      socket.emit("message:read");
    }
  }

  componentWillUnmount() {
    const { socket } = this.props;

    socket.off("message:create", this.handleCreate);
    socket.off("message:update", this.handleUpdate);
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

  handleRead = messages => {
    const { socket } = this.props;

    socket.off("message:read", this.handleRead);

    this.setState(
      {
        messages: JSON.parse(messages)
      },
      () => {
        this.ref.scrollTop = this.ref.scrollHeight;

        socket.on("message:create", this.handleCreate);
        socket.on("message:update", this.handleUpdate);
        socket.on("message:delete", this.handleDelete);
      }
    );
  };

  handleUpdate = message => {
    this.setState(prevState => ({
      messages: prevState.messages.map(m => {
        if (m._id === message._id) {
          return {
            ...m,
            ...message
          };
        }

        return m;
      })
    }));
  };

  handleDelete = _id => {
    this.setState(prevState => ({
      messages: prevState.messages.filter(m => m._id !== _id)
    }));
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
            flex-grow: 1;
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

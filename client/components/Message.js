import React, { Fragment, PureComponent } from "react";

class Message extends PureComponent {
  handleDelete = () => {
    const {
      message: { _id },
      socket,
      token
    } = this.props;

    socket.emit("message:delete", JSON.stringify({ _id, token }));
  };

  handleEdit = () => {
    const {
      message: { _id },
      token
    } = this.props;

    console.info("message:update", JSON.stringify({ _id, token }));
  };

  render() {
    const { message, token } = this.props;

    return (
      <p className={`Message ${message.token === token && "Author"}`}>
        <style jsx>{`
          .Message {
            display: inline-block;
            flex-shrink: 0;
            border: 1px solid tomato;
            border-radius: 0.25em;
            overflow: hidden;
            padding: 0.5em;
            max-width: calc(87.5% - 1em);
          }

          .Message:not(:last-child) {
            margin-bottom: 0.5em;
          }

          .Author {
            margin-left: auto;
            text-overflow: ellipsis;
          }

          small {
            font-size: 0.75em;
          }

          span {
            display: block;
            margin: 0.5em 0;
            word-break: break-all;
          }

          button[type="submit"] {
            cursor: pointer;
            font-size: 1rem;
            padding: 0.25em;
          }
        `}</style>
        <small>{message.token}</small>
        <br />
        <span>{message.message}</span>
        {message.token === token && (
          <Fragment>
            <button onClick={this.handleEdit}>modifier</button>
            <button onClick={this.handleDelete}>supprimer</button>
          </Fragment>
        )}
      </p>
    );
  }
}

export default Message;

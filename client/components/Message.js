import React, { Fragment, PureComponent } from "react";

class Message extends PureComponent {
  state = {
    isEditing: false,
    editedMessage: this.props.message.message
  };

  handleCancel = () => {
    this.setState({
      isEditing: false
    });
  };

  handleChange = e => {
    const {
      target: { name, value }
    } = e;

    this.setState({ [name]: value });
  };

  handleDelete = () => {
    const {
      message: { _id },
      socket,
      token
    } = this.props;

    socket.emit("message:delete", JSON.stringify({ _id, token }));
  };

  handleEdit = () => {
    this.setState({
      isEditing: true
    });
  };

  handleSubmit = e => {
    const {
      message: { _id },
      socket,
      token
    } = this.props;

    const { editedMessage } = this.state;

    e.preventDefault();

    socket.emit(
      "message:update",
      JSON.stringify({ _id, message: editedMessage, token })
    );

    this.setState({
      isEditing: false
    });
  };

  render() {
    const { message, token } = this.props;
    const { isEditing, editedMessage } = this.state;

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

          .Message:first-child {
            margin-top: auto;
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

          form {
            display: flex;
          }

          input {
            flex-grow: 1;
            margin-right: 0.5em;
          }

          button {
            flex-shrink: 0;
            cursor: pointer;
            font-size: 0.75rem;
            padding: 0.25em;
          }
        `}</style>
        <small>{`Auteur: ${message.token}`}</small>
        <br />
        {isEditing ? (
          <form onSubmit={this.handleSubmit}>
            <input
              autoComplete="off"
              autoFocus
              type="text"
              name="editedMessage"
              value={editedMessage}
              onChange={this.handleChange}
            />
            <button type="submit">sauvegarder</button>
          </form>
        ) : (
          <Fragment>
            <span>{message.message}</span>
            <small>{`Crée le ${message.createdAt}`}</small>
            {message.updatedAt && (
              <Fragment>
                <br />
                <small>{`Modifié le ${message.updatedAt}`}</small>
              </Fragment>
            )}
            <br />
          </Fragment>
        )}
        {message.token === token && (
          <Fragment>
            {isEditing ? (
              <button onClick={this.handleCancel}>annuler</button>
            ) : (
              <button onClick={this.handleEdit}>modifier</button>
            )}
            <button onClick={this.handleDelete}>supprimer</button>
          </Fragment>
        )}
      </p>
    );
  }
}

export default Message;

export default () => (
  <section>
    <style jsx>{`
      section {
        display: grid;
        grid: 1fr min-content / 1fr min-content;
        grid-gap: 0.5em;
        grid-template-areas:
          "messages messages"
          "input button";
        position: absolute;
        top: 0.5em;
        right: 0.5em;
        bottom: 0.5em;
        left: 0.5em;
      }

      .MessageList {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-end;
        grid-area: messages;
        background-color: #fefefe;
        font-size: 1rem;
        padding: 0.5em;
      }

      .Message {
        display: inline-block;
        border: 1px solid tomato;
        border-radius: 0.25em;
        padding: 0.5em;
      }

      .Message:not(:last-child) {
        margin-bottom: 0.5em;
      }

      input {
        grid-area: input;
        font-size: 1rem;
        padding: 1em;
      }

      button {
        grid-area: button;
        font-size: 1rem;
        padding: 1em;
      }
    `}</style>
    <div className="MessageList">
      <p className="Message">Salut</p>
      <p className="Message">Allo</p>
    </div>
    <input type="text" name="message" />
    <button type="submit">Envoyer</button>
  </section>
);

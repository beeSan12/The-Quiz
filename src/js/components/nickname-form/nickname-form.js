/**
 * The nickname-form web component module.
 *
 * @author // Beatriz Sanssi <bs222eh@student.lnu.se>
 * @version 1.1.0
 */

// Define template.
const template = document.createElement('template')
template.innerHTML = `
<style>
  #nickname-form {
    font-family: 'NT Adventure';
    font-size: 40px;
    font-weight: bold;
    text-align: center;
    justify-self: center;
    padding: 10px;
    margin: 10px;
    max-width: 500px;
  }

  #nickname-form p {
    padding: 10px;
    max-width: 800px;
    justify-self: center;
    color: rgb(76, 99, 76);
    font-size: 50px;
  }

  button {
    background-color: rgb(76, 99, 76);
    color: white;
    font-family: 'NT Adventure';
    max-width: fit-content;
    font-size: 20px;
  }

  input {
    font-family: 'NT Adventure';
    color: rgb(76, 99, 76);
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    justify-self: center;
    padding: 10px;
    max-width: 200px;
  }

</style>
<form id="nickname-form">
    <label for="nickname"><p>Enter your nickname:</p></label>
    <hr>
    <input type="text" id="nickname" name="nickname" placeholder="Your nickname..." required="true">
    <button id="start-button" type="submit">Start Quiz</button>
</form>
`

customElements.define('nickname-form',
  /**
   * Represents a nickname-form element.
   */
  class extends HTMLElement {
    #nickname
    /**
     * The element representing the Start Quiz button.
     *
     * @type {HTMLFormElement}
     */
    #form

    /**
     * Creates an instance of the current type.
     */
    constructor () {
      super()

      // Attach a shadow DOM tree to this element and
      // append the template to the shadow root.
      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))

      // Get the nickname-form element in the shadow root.
      this.#form = this.shadowRoot.getElementById('nickname-form')
      this.#form.addEventListener('submit', (event) => this.#onSubmit(event))
      this.#nickname = this.shadowRoot.getElementById('nickname')
    }

    /**
     * Called after the element is inserted into the DOM.
     *
     * @param {event} event - The nickname submittedevent.
     */
    #onSubmit (event) {
      event.preventDefault()
      if (this.#nickname.value) {
        // Dispatch a custom event with the nickname data
        this.dispatchEvent(new CustomEvent('nicknameSubmitted', { detail: { nickname: this.#nickname.value } }))

        // Save the nickname in localStorage
        localStorage.setItem('nickname', this.#nickname.value)
      } else {
        alert('Please enter a nickname!')
      }
    }

    /**
     * Clear the nickname input field.
     */
    clearForm () {
      this.#nickname.value = ''
    }
  }
)

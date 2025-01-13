/**
 * The quiz-question web component module.
 *
 * @author // Beatriz Sanssi <bs222eh@student.lnu.se>
 * @version 1.1.0
 */
// Define template.
const template = document.createElement('template')
template.innerHTML = `
<style>
#quiz-question {
  font-family: 'NT Adventure';
  border: 3px solid rgb(76, 99, 76);
  margin: 20px;
  padding: 20px;
  background-color: white;
  justify-content: space-evenly;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: 100px 500px;
  grid-template-areas:
  ".   question-text  question-text       ."
  ".  multiple-choice-form  answer-form   .";
}
.question-text {
  grid-area: question-text;
  font-size: 40px;
  font-weight: bold;
  text-align: center;
  justify-self: center;
  padding: 10px;
}

#multiple-choice-form {
  grid-area: multiple-choice-form;
  padding: 30px;
  margin: 30px;
  display: none;
  list-style-type: none;
  justify-content: space-evenly;
}

#multipleChoiceForm button {
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  padding: 5px;
  margin: 7px;
  font-weight: bold;
  float: right;
  clear: both;
  position: sticky;
  max-width: fit-content;
  display: inline-block;
  background-color: rgb(170, 197, 170);
}

#answer-form {
  grid-area: answer-form;
  align-self: center;
  padding: 10px;
  margin: 10px;
}

#answer-input {
  font-size: 35px;
  padding: 10px;
  margin: 10px;
  width: 200px;
  background-color: rgb(170, 197, 170);
}

#options-list {
  list-style-type: none;
  padding: 20px;
  margin: 10px;
  justify-content: space-between;
  text-align: left;
  color: rgb(76, 99, 76);
  max-width: fit-content;
  max-height: fit-content;
}

#options-list li {
  padding: 10px;
  font-size: 30px;
  font-weight: bold;
  text-transform: uppercase;
}

button {
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  padding: 5px;
  margin: 7px;
  font-weight: bold;
  float: right;
  clear: both;
  position: static;
  max-width: fit-content;
  display: inline-block;
  background-color: rgb(170, 197, 170);
}

button p {
  font-size: 13px;
  color: rgb(76, 99, 76);
  font-weight: bold; 
  padding: 5px;
}

label p {
  font-size: 20px;
  font-weight: bold;
  color: rgb(76, 99, 76);
  float: left;
  clear: right;
  margin: 10px;
}
</style>
<div id="quiz-question">
  <p class="question-text"></p>
  <hr>
  <form id="answer-form">
    <label for="answer-input"><p>Your Answer:</p></label>
    <input type="text" id="answer-input" name="answer" required="true">
    <button type="submit"><p>Submit Answer</p></button>
  </form>
  <form id="multiple-choice-form">
    <ul id="options-list"></ul>
    <button type="submit"><p>Submit Answer</p></button>
  </form>
  </div>
`

customElements.define('quiz-question',
  /**
   *
   */
  class extends HTMLElement {
    #quizQuestion
    #optionsList
    #answerForm
    #multipleChoiceForm
    #answerInput
    /**
     * Creates an instance of the current type.
     */
    constructor () {
      super()

      // Attach a shadow DOM tree to this element and append the template to the shadow root.
      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))

      // Get the quiz-question element in the shadow root.
      this.#quizQuestion = this.shadowRoot.getElementById('quiz-question')

      // Get the options-list element in the shadow root.
      this.#optionsList = this.shadowRoot.getElementById('options-list')

      // Get the answer-input element in the shadow root.
      this.#answerForm = this.shadowRoot.getElementById('answer-form')

      // Get the form for multiple choice element in the shadow root.
      this.#multipleChoiceForm = this.shadowRoot.getElementById('multiple-choice-form')

      // Get the answer-input element in the shadow root.
      this.#answerInput = this.shadowRoot.getElementById('answer-input')

      // Add event listener to the answer form.
      this.#answerForm.addEventListener('submit', (event) => this.onSubmitAnswer(event))

      // Add event listener to the multiple choice.
      this.#multipleChoiceForm.addEventListener('submit', (event) => this.onSubmitMultipleChoiceAnswer(event))
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    async connectedCallback () {
      const question = JSON.parse(this.getAttribute('question'))
      if (question !== null) {
        console.log('Question:', question)
        await this.displayRecievedQuestion(question)
      }
    }

    /**
     * Clear the existing question before adding a new one.
     */
    clearQuestion () {
      this.#answerForm.querySelector('input').value = ''
      this.#quizQuestion.querySelector('.question-text').textContent = ''
      this.clearForm()
      this.clearOptions()
    }

    /**
     * Display the question recieved from the server.
     *
     * @param {object} question - The question.
     */
    async displayRecievedQuestion (question) {
      if (!question) {
        console.error('Question is undefined.')
        return
      }
      await this.displayQuestion(question)
    }

    /**
     * Display question and options.
     *
     * @param {object} question - The question recieved from the server.
     */
    displayQuestion (question) {
      if (!question) {
        console.error('Question is undefined.')
        return
      }
      const questionText = this.#quizQuestion.querySelector('.question-text')
      questionText.textContent = question.question

      if (question.alternatives) {
        this.displayMultipleChoiceQuestion(question)
      } else {
        this.displayTextQuestion(question)
      }
    }

    /**
     * Display multiple choice question.
     *
     * @param {object} question - The question recieved from the server.
     */
    displayMultipleChoiceQuestion (question) {
      const alternatives = question.alternatives
      this.#optionsList.innerHTML = ''

      Object.keys(alternatives).forEach((key, index) => {
        const alternative = alternatives[key]

        // Create a list item for each alternative.
        const listItem = document.createElement('li')

        // Create a radio button for each alternative.
        const radioButton = document.createElement('input')
        radioButton.type = 'radio'
        radioButton.name = 'alternative'
        radioButton.value = key
        radioButton.id = `alternative-${index}`

        // Create a label for each radio button.
        const label = document.createElement('label')
        label.htmlFor = radioButton.id
        label.textContent = `${key}: ${alternative}`

        // Append the label to the list item.
        listItem.appendChild(radioButton)
        listItem.appendChild(label)

        // Append the list item to the options list.
        this.#optionsList.append(listItem)

        // Add event listener to the each radio button.
        radioButton.addEventListener('keydown', (event) => {
          if (event.key === 'Enter') {
            radioButton.checked = true
            event.preventDefault()
            this.#multipleChoiceForm.requestSubmit()
          }
        })
      })

      // Hide the answer form and display the multiple choice form.
      this.#answerForm.style.display = 'none'
      this.#multipleChoiceForm.style.display = 'block'
    }

    /**
     * Clear the existing options before adding new ones.
     */
    clearOptions () {
      const multipleChoiceForm = this.#multipleChoiceForm.querySelector('ul')
      if (multipleChoiceForm) {
        while (multipleChoiceForm.firstChild) {
          multipleChoiceForm.removeChild(multipleChoiceForm.firstChild)
        }
      }
    }

    /**
     * Display text question.
     *
     * @param {object} question - The question recieved from the server.
     */
    async displayTextQuestion (question) {
      await this.clearForm()

      // Display the answer form.
      this.#answerForm.style.display = 'block'

      // Create an input field for the answer.
      const answerInput = this.shadowRoot.getElementById('answer-input')

      // Append the input field to the form.
      this.#answerForm.appendChild(answerInput)

      // Hide the options and display the answer input field.
      this.#multipleChoiceForm.style.display = 'none'
    }

    /**
     * Clear the existing form before adding a new one.
     */
    clearForm () {
      const answerInput = this.#answerForm.querySelector('answer-input')
      if (answerInput) {
        this.#answerForm.removeChild(this.#answerForm.firstChild)
      }
    }

    /**
     * Called after the element is inserted into the DOM.
     *
     * @param {event} event - The answer submitted event.
     */
    onSubmitAnswer (event) {
      event.preventDefault()

      const answerInputValue = this.#answerInput.value.trim()
      if (answerInputValue !== '') {
        this.dispatchEvent(new CustomEvent('answerSubmitted', { detail: { answer: answerInputValue } }))
        this.clearQuestion()
      } else {
        alert('Please enter an answer.')
      }
    }

    /**
     * Called after the element is inserted into the DOM.
     *
     * @param {event} event - The multiple choice answer submitted event.
     */
    onSubmitMultipleChoiceAnswer (event) {
      event.preventDefault()

      const selectedAlternative = this.shadowRoot.querySelector('input[name="alternative"]:checked')
      console.log('selected: ', selectedAlternative)
      if (selectedAlternative !== '') {
        this.dispatchEvent(new CustomEvent('answerSubmitted', { detail: { answer: selectedAlternative.value } }))
        this.clearQuestion()
      } else {
        alert('Please select an option.')
      }
    }
  })

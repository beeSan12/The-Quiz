/**
 * The quiz-application web component module.
 *
 * @author // Beatriz Sanssi <bs222eh@student.lnu.se>
 * @version 1.1.0
 */
import '../nickname-form/index.js'
import '../quiz-question/index.js'
import '../countdown-timer/index.js'
import '../high-score/index.js'

const QUIZ_APPLICATION_GET_URL = 'https://courselab.lnu.se/quiz/question/1'

// Define template.
const template = document.createElement('template')
template.innerHTML = `
    <style>

      #game-over {
        font-family: 'NT Adventure';
        color: rgb(76, 99, 76);
        font-size: 40px;
        font-weight: bold;
        
        padding: 10px;
        margin: 10px;
        max-width: fit-content;
        display: none;
      }
    
    </style>
    <div id="game-over">
      <h1>Game Over!</h1>
    </div>
    <nickname-form></nickname-form>
    <quiz-question></quiz-question>  
    <countdown-timer></countdown-timer>
    <high-score></high-score>   
  `

customElements.define('quiz-application',
  /**
   * Represents a quiz-application element.
   */
  class extends HTMLElement {
    #nicknameForm
    #quizQuestion
    #countdownTimer
    #highScore
    /**
     * The element representing the URL to the server
     * providing the initial question.
     *
     * @type {HTMLLinkElement}
     */
    #URL

    /**
     * The game over element.
     *
     * @type {HTMLDivElement}
     */
    #gameOver

    #totalElapsedSeconds = 0

    /**
     * Creates an instance of the current type.
     */
    constructor () {
      super()

      // Attach a shadow DOM tree to this element and append the template to the shadow root.
      this.attachShadow({ mode: 'open' })
        .appendChild(template.content.cloneNode(true))

      // Initialize the components and elements.
      this.#nicknameForm = this.shadowRoot.querySelector('nickname-form')
      this.#quizQuestion = this.shadowRoot.querySelector('quiz-question')
      this.#countdownTimer = this.shadowRoot.querySelector('countdown-timer')
      this.#highScore = this.shadowRoot.querySelector('high-score')
      this.#gameOver = this.shadowRoot.getElementById('game-over')

      // Add event listeners.
      this.#quizQuestion.addEventListener('answerSubmitted', (event) => this.onSubmittedAnswer(event))
      this.#countdownTimer.addEventListener('timerEnded', (event) => this.gameOver(event))
      this.#highScore.addEventListener('click', (event) => this.tryAgain(event))

      // Set the URL.
      this.#URL = QUIZ_APPLICATION_GET_URL
    }

    /**
     * Called after the element is inserted into the DOM.
     */
    connectedCallback () {
      this.#nicknameForm.addEventListener('nicknameSubmitted', (event) => {
        const nickname = event.detail.nickname
        console.log(`Nickname submitted: ${nickname}`)
        this.#onSubmit()
      })
      this.hideQuizComponents()
    }

    /**
     * Hide quiz components.
     */
    hideQuizComponents () {
      this.#nicknameForm.style.display = 'block'
      this.#quizQuestion.style.display = 'none'
      this.#countdownTimer.style.display = 'none'
      this.#gameOver.style.display = 'none'
      this.#highScore.style.display = 'none'
    }

    /**
     * Handles the click event when the Start Quiz button is clicked.
     * Starts the quiz, displays the next question, and starts the timer.
     */
    #onSubmit () {
      this.startQuiz()
      console.log('Quiz started!')
    }

    /**
     * Show quiz components.
     */
    showQuizComponents () {
      this.#nicknameForm.style.display = 'none'
      this.#quizQuestion.style.display = 'block'
      this.#countdownTimer.style.display = 'block'
    }

    /**
     * Starts the quiz.
     */
    startQuiz () {
      console.log('Starting quiz...')

      const question = this.getData()
      console.log('Data fetched!')
      this.showQuizComponents()

      // Display the recieved question and start the timer
      this.#quizQuestion.displayRecievedQuestion(question)
      this.#countdownTimer.startTimer(question)
    }

    /**
     * Gets data from the API.
     *
     * @returns {object} question - The data.
     */
    async getData () {
      console.log('Fetching data from: ', this.#URL)
      try {
        const response = await fetch(this.#URL, {
          method: 'GET',
          cache: 'no-store'
        })

        if (response.ok) {
          const question = await response.json()

          if (question) {
            this.nextURL = question.nextURL
            this.limit = question.limit

            this.#quizQuestion.displayRecievedQuestion(question)
            this.#countdownTimer.startTimer(question)
          } else {
            console.error('Invalid data structure from the server: ', question)
          }
        } else {
          throw new Error(`HTTP error! Status: ${response.statusText}`)
        }
      } catch (error) {
        console.error('Error fetching data: ', error)
        this.gameOver()
      }
    }

    /**
     * Get user answer.
     *
     * @param {event} event - The event.
     */
    async onSubmittedAnswer (event) {
      try {
        if (!event && !event.detail) {
          throw new Error('Event or event.detail is undefined.')
        }

        const answer = event.detail.answerInput || event.detail.answer
        console.log(`Answer submitted: ${answer}`)

        const elapsedSeconds = this.#countdownTimer.getElapsedSeconds()
        this.#totalElapsedSeconds += elapsedSeconds
        console.log(`Elapsed time for this question: ${elapsedSeconds} seconds`)
        console.log(`Total elapsed time: ${this.#totalElapsedSeconds} seconds`)

        // Store the elapsed seconds for each question in an array.
        const elapsedSecondsArray = JSON.parse(localStorage.getItem('elapsedSecondsPerQuestion')) || []
        elapsedSecondsArray.push(elapsedSeconds)
        localStorage.setItem('elapsedSecondsPerQuestion', JSON.stringify(elapsedSecondsArray))

        // Calculate the score and save it in local storage.
        const score = this.#highScore.calculateScore()
        localStorage.setItem('score', score)

        const serverResponse = await this.sendAnswerToServer(answer)

        if (serverResponse && serverResponse.nextURL) {
          await this.getNextQuestion(serverResponse.nextURL)
        } else if (serverResponse && !serverResponse.nextURL) {
          this.quizCompleted()
        }
      } catch (error) {
        console.error('Error submitting answer:', error)
        this.gameOver()
      }
    }

    /**
     * Send answer to server.
     *
     * @param {string} answer - The answer.
     * @returns {string} nextURL - The next URL.
     */
    async sendAnswerToServer (answer) {
      try {
        const response = await fetch(this.nextURL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ answer })
        })

        const serverResponse = await response.json()
        console.log('Server response:', serverResponse)

        // If the response is not ok, end the game.
        if (!response.ok) {
          this.gameOver()
          throw new Error(`Failed to post data. Status: ${response.statusText}`)
        }

        // Update the nextURL
        this.nextURL = serverResponse.nextURL

        return serverResponse
      } catch (error) {
        console.error('Error posting data:', error.message)
      }
    }

    /**
     * Get next question.
     *
     * @param {string} nextURL - The next URL.
     */
    async getNextQuestion (nextURL) {
      try {
        const response = await fetch(nextURL)
        if (!response.ok) {
          throw new Error(`Failed to fecth the next question. Status: ${response.statusText}`)
        }

        this.#countdownTimer.storeElapsedSeconds()
        this.#countdownTimer.clearTimer()

        const data = await response.json()
        console.log('Next question:', data)
        // Replace the response url with the next url
        this.nextURL = data.nextURL
        this.#quizQuestion.displayRecievedQuestion(data)
        this.#countdownTimer.startTimer(data)
      } catch (error) {
        console.error('Error fetching next question:', error)
        this.gameOver()
      }
    }

    /**
     * Quiz completed.
     */
    quizCompleted () {
      console.log('Quiz completed! Total elapsed time:', this.#totalElapsedSeconds)
      this.#countdownTimer.onStopTimer()
      this.calculateHighScores()

      this.#quizQuestion.style.display = 'none'
      this.#countdownTimer.style.display = 'none'
      this.#highScore.style.display = 'block'

      const finalScore = this.#totalElapsedSeconds
      const nickname = localStorage.getItem('nickname')
      if (nickname && finalScore !== null) {
        this.#highScore.updateHighScore(nickname, finalScore)
        console.log(`Nickname: ${nickname}, Score: ${finalScore}`)
        this.#highScore.displayHighscore()
        this.#highScore.displayScore(finalScore)
      } else {
        console.error('Invalid nickname or score')
      }
    }

    /**
     * Calculate high scores.
     *
     * @param {number} finalScore - The final score.
     * @returns {Array} highScores - The high scores.
     */
    calculateHighScores (finalScore) {
      const nickname = localStorage.getItem('nickname')
      if (nickname && finalScore !== undefined) {
        return this.#highScore.updateHighScore({ nickname, score: finalScore })
      }
      return []
    }

    /**
     * Game over.
     */
    gameOver () {
      console.log('Game over!')
      this.#countdownTimer.onStopTimer()

      // Clear the local storage from the previous game.
      localStorage.removeItem('score')
      localStorage.removeItem('nickname')
      localStorage.removeItem('finalScore')
      localStorage.removeItem('elapsedSecondsPerQuestion')
      localStorage.removeItem('elapsedSecondsArray')

      // Display the game over screen.
      this.#gameOver.style.display = 'block'
      this.#highScore.clearScore()
      this.#highScore.displayHighscore()
      this.#highScore.style.display = 'block'
      this.#countdownTimer.style.display = 'none'
      this.#quizQuestion.style.display = 'none'
    }

    /**
     * Try again.
     *
     * @param {event} event - The event.
     */
    tryAgain (event) {
      this.dispatchEvent(new CustomEvent('tryAgain', { detail: { tryAgain: true } }))

      // Clear the local storage.
      localStorage.removeItem('nickname')
      localStorage.removeItem('finalScore')
      localStorage.removeItem('score')
      localStorage.removeItem('elapsedSecondsArray')
      localStorage.removeItem('elapsedSecondsPerQuestion')

      // Reset the quiz.
      this.#nicknameForm.style.display = 'block'
      this.#gameOver.style.display = 'none'
      this.#highScore.style.display = 'none'
      this.#quizQuestion.style.display = 'none'
      this.#nicknameForm.clearForm()
      this.#quizQuestion.clearQuestion()
      this.#totalElapsedSeconds = 0
    }
  })
